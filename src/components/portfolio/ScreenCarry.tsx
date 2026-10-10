import { useEffect, useRef } from "react";

export interface ScreenCarryFlight {
  key: number;
  src: string;
  from: () => DOMRect | null;
  to: () => DOMRect | null;
  direction: "open" | "close";
}

interface ScreenCarryProps {
  flight: ScreenCarryFlight;
  onDone: () => void;
}

const FLIGHT_MS = 620;
const FADE_MS = 160;
const MAX_HOLD_MS = 600;

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * ScreenCarry - Carries a project's screen between its gallery card and the project page.
 * Both ends are re-measured every frame, so the screen lands where the page settles.
 */
export default function ScreenCarry({ flight, onDone }: ScreenCarryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const mountedAt = performance.now();
    let start: number | null = null;
    const first = flight.from();
    let frame = 0;

    function tick(now: number) {
      const from = first ?? flight.from();
      const to = flight.to();
      // The destination page renders a frame or two after the click; hold the screen until it exists.
      if (element && from && !to && now - mountedAt < MAX_HOLD_MS) {
        Object.assign(element.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!element || !from || !to) {
        onDone();
        return;
      }
      start ??= now;
      const elapsed = now - start;
      const t = ease(Math.min(elapsed / FLIGHT_MS, 1));
      element.style.left = `${from.left + (to.left - from.left) * t}px`;
      element.style.top = `${from.top + (to.top - from.top) * t}px`;
      element.style.width = `${from.width + (to.width - from.width) * t}px`;
      element.style.height = `${from.height + (to.height - from.height) * t}px`;
      // A brightness kick mid-flight, like a set warming up.
      element.style.filter = `brightness(${1 + Math.sin(t * Math.PI) * 0.45})`;
      element.style.opacity = String(elapsed <= FLIGHT_MS ? 1 : Math.max(0, 1 - (elapsed - FLIGHT_MS) / FADE_MS));
      if (elapsed >= FLIGHT_MS + FADE_MS) {
        onDone();
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [flight, onDone]);

  return (
    <div ref={ref} className="screen-carry pointer-events-none fixed z-[60] overflow-hidden border border-crt-border-secondary bg-black" aria-hidden="true">
      <img src={flight.src} alt="" className="h-full w-full object-cover" />
      <div className="screen-carry__lines absolute inset-0" />
    </div>
  );
}
