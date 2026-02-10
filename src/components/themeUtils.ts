import type { Theme } from "../types";

const STORAGE_KEY = "crt-portfolio-theme";
const TRANSITION_CLASS = "theme-transition";

export { STORAGE_KEY, TRANSITION_CLASS };

/**
 * Reads the preferred theme from localStorage, falling back to OS preference.
 */
export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/** Track whether applyTheme has been called before (skip transition on first call). */
let isFirstApply = true;

/** Reset first-apply flag (for testing only). */
export function resetFirstApply() {
  isFirstApply = true;
}

/**
 * Toggles the .light class on <html>.
 */
function setThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
}

/**
 * Applies the theme class to <html> with a smooth visual transition.
 *
 * Uses the View Transitions API when available for a crossfade effect.
 * Falls back to the CSS transition-class approach for older browsers.
 * Skips animation entirely on the initial page load.
 */
export function applyTheme(theme: Theme) {
  // On first call (page load), apply immediately without animation
  if (isFirstApply) {
    isFirstApply = false;
    setThemeClass(theme);
    return;
  }

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Use View Transitions API if available and motion is allowed
  if ("startViewTransition" in document && !prefersReduced) {
    (document as Document & { startViewTransition: (cb: () => void) => void })
      .startViewTransition(() => setThemeClass(theme));
    return;
  }

  // Fallback: CSS transition-class approach
  const root = document.documentElement;
  root.classList.add(TRANSITION_CLASS);
  setThemeClass(theme);

  // Clean up transition class -- whichever fires first (event or fallback) wins
  const fallbackTimer = setTimeout(cleanup, 400);

  function cleanup() {
    clearTimeout(fallbackTimer);
    root.removeEventListener("transitionend", handleTransitionEnd);
    root.classList.remove(TRANSITION_CLASS);
  }

  function handleTransitionEnd(e: TransitionEvent) {
    if (e.target !== root) return;
    cleanup();
  }

  root.addEventListener("transitionend", handleTransitionEnd);
}
