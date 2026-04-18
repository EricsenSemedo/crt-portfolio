import { useEffect } from "react";

interface UseKeyboardNavOptions {
  tvIds: readonly string[];
  selectedId: string | null;
  isAnimating: boolean;
  onNavigate: (id: string) => void;
}

const DIGIT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Global keyboard shortcuts for TV channel navigation.
 *
 * - 1-9 / Digit1-Digit9: jump directly to the TV at that index
 * - ArrowLeft / ArrowRight (and KeyH/KeyL): cycle to previous/next TV
 *
 * Skips when the user is typing in a form field, while a camera animation is
 * in flight (prevents queuing during the zoom transition), or when modifier
 * keys are held (so browser/OS shortcuts like Cmd+1 still work).
 *
 * Escape is intentionally NOT handled here — useModalAccessibility owns that
 * key and uses capture-phase + stopPropagation to close the topmost dialog.
 */
export function useKeyboardNav({
  tvIds,
  selectedId,
  isAnimating,
  onNavigate,
}: UseKeyboardNavOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (isAnimating) return;
      if (tvIds.length === 0) return;

      // Direct selection by index (1-9). event.code handles non-US layouts
      // where event.key may be a different glyph for the same physical row.
      const digitFromCode = event.code.startsWith("Digit") ? event.code.slice(5) : null;
      const digit = digitFromCode && DIGIT_KEYS.includes(digitFromCode as (typeof DIGIT_KEYS)[number])
        ? digitFromCode
        : DIGIT_KEYS.includes(event.key as (typeof DIGIT_KEYS)[number])
          ? event.key
          : null;

      if (digit) {
        const index = Number(digit) - 1;
        const targetId = tvIds[index];
        if (targetId && targetId !== selectedId) {
          event.preventDefault();
          onNavigate(targetId);
        }
        return;
      }

      const goPrevious = event.key === "ArrowLeft" || event.code === "KeyH";
      const goNext = event.key === "ArrowRight" || event.code === "KeyL";

      if (goPrevious || goNext) {
        const delta = goNext ? 1 : -1;
        const currentIndex = selectedId ? tvIds.indexOf(selectedId) : -1;
        // Decision: when nothing is selected, ArrowRight enters at index 0 and
        // ArrowLeft enters at the last TV. This mirrors how a remote channel
        // up/down behaves when the TV is "off".
        const startIndex = currentIndex === -1 ? (delta > 0 ? -1 : 0) : currentIndex;
        const nextIndex = (startIndex + delta + tvIds.length) % tvIds.length;
        const targetId = tvIds[nextIndex];
        if (targetId && targetId !== selectedId) {
          event.preventDefault();
          onNavigate(targetId);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tvIds, selectedId, isAnimating, onNavigate]);
}
