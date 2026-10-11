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

const FLIGHT_MS = 640;
const FADE_MS = 180;
const MAX_HOLD_MS = 600;

// Fast out of the card, long settle into place.
function ease(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * ScreenCarry - Carries a project's screen between its gallery card and the project page.
 * Both ends are re-measured every frame, so the screen lands where the page settles.
 * It moves by transform only, sized to the larger end so the picture is never upscaled.
 */
export default function ScreenCarry({ flight, onDone }: ScreenCarryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const mountedAt = performance.now();
    let start: number | null = null;
    let base: DOMRect | null = null;
    const first = flight.from();
    let frame = 0;

    function place(rect: DOMRect, opacity: number, glow: number) {
      if (!element || !base) return;
      element.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0) scale(${rect.width / base.width}, ${rect.height / base.height})`;
      element.style.opacity = String(opacity);
      if (glowRef.current) glowRef.current.style.opacity = String(glow);
    }

    function size(rect: DOMRect) {
      base = rect;
      Object.assign(element!.style, { width: `${rect.width}px`, height: `${rect.height}px` });
    }

    function tick(now: number) {
      const from = first ?? flight.from();
      const to = flight.to();
      // The destination page renders a frame or two after the click; hold the screen until it exists.
      if (from && !to && now - mountedAt < MAX_HOLD_MS) {
        if (!base) size(from);
        place(from, 1, 0);
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!from || !to) {
        onDone();
        return;
      }
      if (start === null) {
        start = now;
        size(from.width * from.height > to.width * to.height ? from : to);
      }
      const elapsed = now - start;
      const t = ease(Math.min(elapsed / FLIGHT_MS, 1));
      const mix = (a: number, b: number) => a + (b - a) * t;
      const rect = new DOMRect(mix(from.left, to.left), mix(from.top, to.top), mix(from.width, to.width), mix(from.height, to.height));
      // A brightness kick mid-flight, like a set warming up.
      const glow = Math.sin(Math.min(elapsed / FLIGHT_MS, 1) * Math.PI) * 0.22;
      const opacity = elapsed <= FLIGHT_MS ? 1 : Math.max(0, 1 - (elapsed - FLIGHT_MS) / FADE_MS);
      place(rect, opacity, glow);
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
    <div
      ref={ref}
      className="screen-carry pointer-events-none fixed left-0 top-0 z-[60] origin-top-left overflow-hidden border border-crt-border-secondary bg-black will-change-transform"
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <img src={flight.src} alt="" className="h-full w-full object-cover" />
      <div className="screen-carry__lines absolute inset-0" />
      <div ref={glowRef} className="absolute inset-0 bg-white opacity-0 mix-blend-screen" />
    </div>
  );
}
