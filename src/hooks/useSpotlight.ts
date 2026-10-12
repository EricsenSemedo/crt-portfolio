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
