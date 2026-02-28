import { useCallback, useEffect } from "react";

interface UseKeyboardNavOptions {
  tvIds: string[];
  selectedId: string | null;
  isAnimating: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/**
 * Global keyboard shortcuts for TV navigation.
 *
 * When no TV is selected (overview):
 *   1/2/3       — jump to TV by index
 *   ArrowRight  — select next TV
 *   ArrowLeft   — select previous TV
 *   Enter       — select first TV
 *
 * When a TV is open:
 *   Escape      — handled by TVZoomOverlay already
 *   ArrowRight  — navigate to next TV
 *   ArrowLeft   — navigate to previous TV
 */
export default function useKeyboardNav({
  tvIds,
  selectedId,
  isAnimating,
  onSelect,
  onClose,
}: UseKeyboardNavOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isAnimating) return;

      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;
      if (isInput) return;

      const currentIndex = selectedId ? tvIds.indexOf(selectedId) : -1;

      switch (e.key) {
        case "1":
        case "2":
        case "3": {
          const idx = Number(e.key) - 1;
          if (idx < tvIds.length) {
            e.preventDefault();
            onSelect(tvIds[idx]);
          }
          break;
        }

        case "ArrowRight": {
          e.preventDefault();
          if (selectedId) {
            const next = (currentIndex + 1) % tvIds.length;
            onSelect(tvIds[next]);
          } else {
            onSelect(tvIds[0]);
          }
          break;
        }

        case "ArrowLeft": {
          e.preventDefault();
          if (selectedId) {
            const prev = (currentIndex - 1 + tvIds.length) % tvIds.length;
            onSelect(tvIds[prev]);
          } else {
            onSelect(tvIds[tvIds.length - 1]);
          }
          break;
        }

        case "Enter": {
          if (!selectedId) {
            e.preventDefault();
            onSelect(tvIds[0]);
          }
          break;
        }

        case "Escape": {
          if (selectedId) {
            e.preventDefault();
            onClose();
          }
          break;
        }
      }
    },
    [tvIds, selectedId, isAnimating, onSelect, onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
