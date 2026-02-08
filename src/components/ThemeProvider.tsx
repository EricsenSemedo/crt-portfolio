import { useEffect, useState, useCallback, type ReactNode } from "react";
import { ThemeContext } from "../hooks/useTheme";
import type { Theme } from "../types";

const STORAGE_KEY = "crt-portfolio-theme";
const TRANSITION_CLASS = "theme-transition";

/**
 * Reads the preferred theme from localStorage, falling back to OS preference.
 */
function getInitialTheme(): Theme {
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
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // Enable transitions
  root.classList.add(TRANSITION_CLASS);

  // Toggle .light class (dark is default, no class needed)
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }

  // Remove transition class once the root element's transition ends
  function handleTransitionEnd(e: TransitionEvent) {
    // Only respond to transitions on the root element itself
    if (e.target !== root) return;
    root.removeEventListener("transitionend", handleTransitionEnd);
    root.classList.remove(TRANSITION_CLASS);
  }

  root.addEventListener("transitionend", handleTransitionEnd);
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider - Manages dark/light theme state with localStorage persistence.
 */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme to DOM on mount and changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === "dark" ? "light" : "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
