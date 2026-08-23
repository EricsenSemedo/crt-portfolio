import { useEffect, useRef, useState } from "react";
import {
  createPortfolioScene,
  type PortfolioChannelId,
  type PortfolioSceneController,
} from "../three/createPortfolioScene";
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

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const controller = createPortfolioScene();
    sceneRef.current = controller;
    mount.appendChild(controller.canvas);

    const resizeObserver = new ResizeObserver(() => {
      controller.resize(mount.clientWidth, mount.clientHeight);
    });
    resizeObserver.observe(mount);
    controller.resize(mount.clientWidth, mount.clientHeight);

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

    </main>
  );
}
