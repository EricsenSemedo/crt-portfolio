import { useEffect, useRef, useState } from "react";
import { PORTFOLIO_CHANNEL_LIST, type PortfolioChannelId } from "../data/channels";
import {
  createPortfolioScene,
  type PortfolioSceneController,
} from "../three/createPortfolioScene";
import CRTLoadingScreen from "./CRTLoadingScreen";
import "./ThreeCRTStage.css";

interface ThreeCRTStageProps {
  onSelect: (id: PortfolioChannelId) => void;
  requestedChannel?: PortfolioChannelId | null;
  quickTransition?: boolean;
  screenEffectActive?: boolean;
  onRequestedFocusComplete?: (id: PortfolioChannelId) => void;
  onOverviewComplete?: () => void;
  paused?: boolean;
}

export default function ThreeCRTStage({
  onSelect,
  requestedChannel = null,
  quickTransition = false,
  screenEffectActive = false,
  onRequestedFocusComplete,
  onOverviewComplete,
  paused = false,
}: ThreeCRTStageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PortfolioSceneController | null>(null);
  const selectingRef = useRef(false);
  const focusRequestRef = useRef(0);
  const focusedRef = useRef<PortfolioChannelId | null>(null);
  const pointerGestureRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const pausedRef = useRef(paused);
  const syncLoopRef = useRef<(() => void) | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState({ settled: 0, total: 0 });
  const [slowLoading, setSlowLoading] = useState(false);
  const showFallbackRef = useRef<(() => void) | null>(null);
  const [hovered, setHovered] = useState<PortfolioChannelId | "basketball" | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let active = true;
    let controller: PortfolioSceneController;
    try {
      controller = createPortfolioScene({
        onLoadingProgress: (progress) => { if (active) setLoading(progress); },
      });
    } catch {
      setUnavailable(true);
      setReady(true);
      return;
    }
    sceneRef.current = controller;
    mount.appendChild(controller.canvas);

    const resizeObserver = new ResizeObserver(() => {
      controller.resize(mount.clientWidth, mount.clientHeight);
    });
    resizeObserver.observe(mount);
    controller.resize(mount.clientWidth, mount.clientHeight);

    let frame = 0;
    let sceneReady = false;
    function draw(time: number) {
      controller.render(time);
      frame = requestAnimationFrame(draw);
    }

    function handleVisibilityChange() {
      cancelAnimationFrame(frame);
      if (sceneReady && !document.hidden && !pausedRef.current && sceneRef.current === controller) frame = requestAnimationFrame(draw);
    }

    function showFallback() {
      if (sceneRef.current !== controller) return;
      cancelAnimationFrame(frame);
      window.clearTimeout(slowTimer);
      sceneRef.current = null;
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      controller.canvas.removeEventListener("webglcontextlost", handleContextLost);
      syncLoopRef.current = null;
      showFallbackRef.current = null;
      controller.dispose();
      selectingRef.current = false;
      setUnavailable(true);
      setReady(true);
    }
    function handleContextLost(event: Event) {
      event.preventDefault();
      showFallback();
    }
    showFallbackRef.current = showFallback;
    controller.canvas.addEventListener("webglcontextlost", handleContextLost);
    syncLoopRef.current = handleVisibilityChange;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();
    const slowTimer = window.setTimeout(() => { if (active) setSlowLoading(true); }, 10_000);
    void controller.ready.then(() => {
      if (active && sceneRef.current === controller) {
        window.clearTimeout(slowTimer);
        sceneReady = true;
        handleVisibilityChange();
        setReady(true);
      }
    }).catch(() => { if (active) showFallback(); });

    return () => {
      active = false;
      window.clearTimeout(slowTimer);
      showFallbackRef.current = null;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
      controller.canvas.removeEventListener("webglcontextlost", handleContextLost);
      controller.dispose();
      sceneRef.current = null;
      syncLoopRef.current = null;
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    syncLoopRef.current?.();
  }, [paused]);

  useEffect(() => {
    sceneRef.current?.setScreenEffectActive(screenEffectActive);
  }, [screenEffectActive]);

  useEffect(() => {
    if (!ready) return;
    const controller = sceneRef.current;
    const request = ++focusRequestRef.current;
    const isCurrent = () => sceneRef.current === controller && focusRequestRef.current === request;
    if (unavailable) {
      if (requestedChannel) onRequestedFocusComplete?.(requestedChannel);
      else onOverviewComplete?.();
      return;
    }
    if (!requestedChannel) {
      selectingRef.current = true;
      focusedRef.current = null;
      void controller
        ?.reset(window.matchMedia("(prefers-reduced-motion: reduce)").matches, quickTransition)
        .then(() => {
          if (!isCurrent()) return;
          selectingRef.current = false;
          onOverviewComplete?.();
        });
      return;
    }
    if (focusedRef.current === requestedChannel) {
      onRequestedFocusComplete?.(requestedChannel);
      return;
    }
    selectingRef.current = true;
    focusedRef.current = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void controller
      ?.focus(requestedChannel, reducedMotion, quickTransition)
      .then(() => isCurrent() ? controller.transitionScreen(requestedChannel, reducedMotion) : "cancelled")
      .then((result) => {
        if (!isCurrent()) return;
        if (result !== "completed") {
          selectingRef.current = false;
          return;
        }
        focusedRef.current = requestedChannel;
        selectingRef.current = false;
        onRequestedFocusComplete?.(requestedChannel);
      });
  }, [onOverviewComplete, onRequestedFocusComplete, quickTransition, ready, requestedChannel, unavailable]);

  async function selectChannel(id: PortfolioChannelId) {
    const controller = sceneRef.current;
    if (unavailable) {
      onSelect(id);
      return;
    }
    if (!ready || !controller || selectingRef.current) return;
    const request = ++focusRequestRef.current;
    const isCurrent = () => sceneRef.current === controller && focusRequestRef.current === request;
    selectingRef.current = true;
    focusedRef.current = null;
    setHovered(null);
    controller.setHovered(null);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    await controller.focus(id, reducedMotion);
    if (!isCurrent()) return;
    const transitionResult = await controller.transitionScreen(id, reducedMotion);
    if (!isCurrent()) return;
    if (transitionResult !== "completed") {
      selectingRef.current = false;
      return;
    }
    focusedRef.current = id;
    selectingRef.current = false;
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
      sceneRef.current?.setHovered(next === "basketball" ? null : next);
    }
  }

  return (
    <main className={"three-stage" + (unavailable ? " is-unavailable" : "")} aria-label="Eric Semedo portfolio channels">
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

      {unavailable && <p className="three-stage__fallback" role="status">3D view unavailable. Choose a section below.</p>}
      <nav id="channels" className="three-stage__channels" aria-label="Portfolio sections" inert={!ready}>
        {PORTFOLIO_CHANNEL_LIST.map((channel) => (
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
            <span>{channel.number}</span>{channel.title}
          </button>
        ))}
      </nav>

      {!ready && <CRTLoadingScreen {...loading} onSkip={slowLoading ? () => showFallbackRef.current?.() : undefined} />}
    </main>
  );
}
