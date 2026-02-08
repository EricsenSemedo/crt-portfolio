import { useEffect, useState, useCallback, type ReactNode } from "react";
import { ThemeContext } from "../hooks/useTheme";
import type { Theme } from "../types";
import { STORAGE_KEY, getInitialTheme, applyTheme } from "./themeUtils";

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
