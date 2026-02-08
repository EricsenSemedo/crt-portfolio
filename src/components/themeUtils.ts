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

/**
 * Applies the theme class to <html>.
 * Briefly enables transition class for smooth visual switch,
 * then removes it once the transition completes.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // Enable transitions
  root.classList.add(TRANSITION_CLASS);

  // Toggle .light class (dark is default, no class needed)
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }

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
