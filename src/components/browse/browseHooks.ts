import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const TOUCH_QUERY = "(hover: none)";

function subscribeToPointer(onChange: () => void) {
  const query = window.matchMedia(TOUCH_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True on phones and tablets, where nothing can be hovered. */
export function useTouchOnly() {
  return useSyncExternalStore(subscribeToPointer, () => window.matchMedia(TOUCH_QUERY).matches, () => false);
}

/**
 * Hover can't preview anything on a phone, so the card nearest the middle of the screen
 * plays instead, following the thumb as the page scrolls.
 */
export function useSpotlight(enabled: boolean) {
  const elements = useRef(new Map<string, Element>());
  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    function update() {
      frame = 0;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      let best: string | null = null;
      let bestDistance = Infinity;
      for (const [id, element] of elements.current) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) continue;
        const distance = Math.hypot(rect.left + rect.width / 2 - cx, rect.top + rect.height / 2 - cy);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = id;
        }
      }
      setSpotlightId(best);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    schedule();
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);

  const register = useCallback((id: string) => (element: Element | null) => {
    if (element) elements.current.set(id, element);
    else elements.current.delete(id);
  }, []);

  return { spotlightId: enabled ? spotlightId : null, register };
}

const colorCache = new Map<string, string>();

/** The poster's average colour as "r g b", so a card can glow in its own artwork's colour. */
export function usePosterColor(src: string | undefined) {
  const [color, setColor] = useState(() => (src ? colorCache.get(src) : undefined));

  useEffect(() => {
    if (!src || colorCache.has(src)) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 5;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, 8, 5);
      const data = context.getImageData(0, 0, 8, 5).data;
      // Take the most saturated swatch rather than the mean, which turns most screenshots grey.
      let best = [255, 179, 71];
      let bestScore = -1;
      for (let index = 0; index < data.length; index += 4) {
        const [r, g, b] = [data[index], data[index + 1], data[index + 2]];
        const score = Math.max(r, g, b) - Math.min(r, g, b) + Math.max(r, g, b) / 4;
        if (score > bestScore) {
          bestScore = score;
          best = [r, g, b];
        }
      }
      const value = best.join(" ");
      colorCache.set(src, value);
      setColor(value);
    };
    image.src = src;
    return () => {
      image.onload = null;
    };
  }, [src]);

  return src ? (color ?? colorCache.get(src)) : undefined;
}
