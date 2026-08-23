import { useEffect, useRef, useState } from "react";
import {
  createPortfolioScene,
  type PortfolioChannelId,
  type PortfolioSceneController,
  type ScreenFit,
} from "../three/createPortfolioScene";
import { cloneScreenFitProfile, getScreenFitProfile } from "../three/screenFitProfiles";
import "./ThreeCRTStage.css";

interface ThreeCRTStageProps {
  onSelect: (id: PortfolioChannelId) => void;
  requestedChannel?: PortfolioChannelId | null;
  quickTransition?: boolean;
  screenEffectActive?: boolean;
  onRequestedFocusComplete?: (id: PortfolioChannelId) => void;
  onOverviewComplete?: () => void;
}

const channels: Array<{ id: PortfolioChannelId; number: string; label: string }> = [
  { id: "home", number: "01", label: "Profile" },
  { id: "portfolio", number: "02", label: "Projects" },
  { id: "contact", number: "03", label: "Contact" },
];

function loadScreenFits(profile: ReturnType<typeof getScreenFitProfile>) {
  if (!import.meta.env.DEV) return cloneScreenFitProfile(profile);
  const saved = localStorage.getItem("crt-screen-fits:" + profile);
  if (!saved) return cloneScreenFitProfile(profile);
  try {
    const parsed: unknown = JSON.parse(saved);
    if (isScreenFitRecord(parsed)) return parsed;
    return cloneScreenFitProfile(profile);
  } catch {
    return cloneScreenFitProfile(profile);
  }
}

function isScreenFitRecord(value: unknown): value is Record<PortfolioChannelId, ScreenFit> {
  if (!value || typeof value !== "object") return false;
  return channels.every(({ id }) => {
    const fit = (value as Partial<Record<PortfolioChannelId, ScreenFit>>)[id];
    return isFinitePair(fit?.scale) && isFinitePair(fit?.offset);
  });
}

function isFinitePair(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && value.every((entry) => typeof entry === "number" && Number.isFinite(entry));
}

export default function ThreeCRTStage({
  onSelect,
  requestedChannel = null,
  quickTransition = false,
  screenEffectActive = false,
  onRequestedFocusComplete,
  onOverviewComplete,
}: ThreeCRTStageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PortfolioSceneController | null>(null);
  const selectingRef = useRef(false);
  const focusedRef = useRef<PortfolioChannelId | null>(null);
  const pointerGestureRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<PortfolioChannelId | null>(null);
  const [calibrating, setCalibrating] = useState<PortfolioChannelId>("home");
  const [viewportProfile, setViewportProfile] = useState(() => getScreenFitProfile(window.innerWidth, window.innerHeight));
  const [viewportSize, setViewportSize] = useState(() => [window.innerWidth, window.innerHeight] as const);
  const [screenFits, setScreenFits] = useState(() => loadScreenFits(getScreenFitProfile(window.innerWidth, window.innerHeight)));
  const initialScreenFitsRef = useRef(screenFits);

  function updateScreenFit(part: "width" | "height" | "x" | "y", value: number) {
    setScreenFits((current) => {
      const fit = current[calibrating];
      const nextFit: ScreenFit = {
        scale: [part === "width" ? value : fit.scale[0], part === "height" ? value : fit.scale[1]],
        offset: [part === "x" ? value : fit.offset[0], part === "y" ? value : fit.offset[1]],
      };
      const next = { ...current, [calibrating]: nextFit };
      sceneRef.current?.setScreenFit(calibrating, nextFit);
      localStorage.setItem("crt-screen-fits:" + viewportProfile, JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const controller = createPortfolioScene();
    sceneRef.current = controller;
    mount.appendChild(controller.canvas);

    const resizeObserver = new ResizeObserver(() => {
      controller.resize(mount.clientWidth, mount.clientHeight);
      const nextProfile = getScreenFitProfile(mount.clientWidth, mount.clientHeight);
      setViewportSize([mount.clientWidth, mount.clientHeight]);
      setViewportProfile((currentProfile) => {
        if (currentProfile === nextProfile) return currentProfile;
        const nextFits = loadScreenFits(nextProfile);
        setScreenFits(nextFits);
        channels.forEach((channel) => controller.setScreenFit(channel.id, nextFits[channel.id]));
        return nextProfile;
      });
    });
    resizeObserver.observe(mount);
    controller.resize(mount.clientWidth, mount.clientHeight);
    channels.forEach((channel) => controller.setScreenFit(channel.id, initialScreenFitsRef.current[channel.id]));

    let frame = 0;
    function draw(time: number) {
      controller.render(time);
      frame = requestAnimationFrame(draw);
    }

    function handleVisibilityChange() {
      cancelAnimationFrame(frame);
      if (!document.hidden) frame = requestAnimationFrame(draw);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    frame = requestAnimationFrame(draw);
    setReady(true);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
      controller.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setScreenEffectActive(screenEffectActive);
  }, [screenEffectActive]);

  useEffect(() => {
    if (!requestedChannel) {
      selectingRef.current = true;
      focusedRef.current = null;
      void sceneRef.current
        ?.reset(window.matchMedia("(prefers-reduced-motion: reduce)").matches, quickTransition)
        .then(() => {
          selectingRef.current = false;
          onOverviewComplete?.();
        });
      return;
    }
    if (focusedRef.current === requestedChannel || selectingRef.current) return;
    selectingRef.current = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void sceneRef.current
      ?.focus(requestedChannel, reducedMotion, quickTransition)
      .then(() => sceneRef.current?.transitionScreen(requestedChannel, reducedMotion))
      .then((result) => {
        if (result !== "completed") {
          selectingRef.current = false;
          return;
        }
        focusedRef.current = requestedChannel;
        selectingRef.current = false;
        onRequestedFocusComplete?.(requestedChannel);
      });
  }, [onOverviewComplete, onRequestedFocusComplete, quickTransition, requestedChannel]);

  async function selectChannel(id: PortfolioChannelId) {
    const controller = sceneRef.current;
    if (!controller || selectingRef.current) return;
    selectingRef.current = true;
    setHovered(null);
    controller.setHovered(null);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    await controller.focus(id, reducedMotion);
    const transitionResult = await controller.transitionScreen(id, reducedMotion);
    if (transitionResult !== "completed") {
      selectingRef.current = false;
      return;
    }
    focusedRef.current = id;
    onSelect(id);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = pointerGestureRef.current;
    if (gesture?.id === event.pointerId && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 10) {
      gesture.moved = true;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    sceneRef.current?.setParallax(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      1 - ((event.clientY - bounds.top) / bounds.height) * 2,
    );
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (selectingRef.current) return;
    const next = sceneRef.current?.pick(event.clientX, event.clientY) ?? null;
    if (next !== hovered) {
      setHovered(next);
      sceneRef.current?.setHovered(next);
    }
  }

  return (
    <main className="three-stage" aria-label="Eric Semedo portfolio channels">
      <div
        ref={mountRef}
        className={"three-stage__canvas " + (hovered ? "is-hovering" : "")}
        onPointerDown={(event) => {
          pointerGestureRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          if (pointerGestureRef.current?.id === event.pointerId) {
            suppressClickRef.current = pointerGestureRef.current.moved;
            pointerGestureRef.current = null;
          }
        }}
        onPointerCancel={() => {
          pointerGestureRef.current = null;
        }}
        onPointerLeave={() => {
          sceneRef.current?.setParallax(0, 0);
          setHovered(null);
          sceneRef.current?.setHovered(null);
        }}
        onClick={(event) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          const result = sceneRef.current?.activateAt(event.clientX, event.clientY);
          if (result && result !== "basketball") void selectChannel(result);
        }}
        aria-hidden="true"
      />

      <nav id="channels" className="three-stage__channels" aria-label="Portfolio sections">
        {channels.map((channel) => (
          <button
            key={channel.id}
            type="button"
            onMouseEnter={() => {
              setHovered(channel.id);
              sceneRef.current?.setHovered(channel.id);
            }}
            onMouseLeave={() => {
              setHovered(null);
              sceneRef.current?.setHovered(null);
            }}
            onFocus={() => sceneRef.current?.setHovered(channel.id)}
            onBlur={() => sceneRef.current?.setHovered(null)}
            onClick={() => void selectChannel(channel.id)}
          >
            <span>{channel.number}</span>{channel.label}
          </button>
        ))}
      </nav>

      <div className={"three-stage__loader " + (ready ? "is-ready" : "")}>WARMING UP</div>

      {import.meta.env.DEV && (
        <aside className="screen-calibrator" aria-label="CRT screen calibration controls">
          <header>
            <span>SCREEN FIT</span>
            <output>{viewportProfile} · {viewportSize[0]}×{viewportSize[1]}</output>
          </header>
          <div className="screen-calibrator__tabs">
            {channels.map((channel) => (
              <button key={channel.id} type="button" className={calibrating === channel.id ? "is-active" : ""} onClick={() => setCalibrating(channel.id)}>
                {channel.number} {channel.label}
              </button>
            ))}
          </div>
          {([
            ["width", "W", 0.7, 2.2, screenFits[calibrating].scale[0]],
            ["height", "H", 0.7, 2.5, screenFits[calibrating].scale[1]],
            ["x", "X", -0.7, 0.7, screenFits[calibrating].offset[0]],
            ["y", "Y", -0.7, 0.7, screenFits[calibrating].offset[1]],
          ] as const).map(([part, label, min, max, value]) => (
            <label key={part}>
              <span>{label}</span>
              <input type="range" min={min} max={max} step="0.01" value={value} onChange={(event) => updateScreenFit(part, Number(event.target.value))} />
              <output>{value.toFixed(2)}</output>
            </label>
          ))}
          <p>Values save automatically for this viewport class.</p>
        </aside>
      )}

    </main>
  );
}
