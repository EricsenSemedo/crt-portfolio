import { useTheme } from "../hooks/useTheme";

/**
 * ThemeToggle - CRT-styled dark/light mode switch.
 * Rendered as a physical toggle knob that matches the TV aesthetic.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 group cursor-pointer"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Outer knob housing */}
      <div className="relative w-12 h-12 rounded-full bg-crt-surface-secondary border-2 border-crt-border shadow-lg transition-all duration-300 group-hover:border-crt-accent/50 group-hover:shadow-crt-accent/20 group-active:scale-95">
        {/* Inner indicator */}
        <div className="absolute inset-2 rounded-full flex items-center justify-center transition-all duration-300">
          {/* Sun icon (light mode) */}
          <svg
            className={`w-5 h-5 absolute transition-all duration-300 ${isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`}
            fill="none"
            stroke="rgb(var(--crt-accent-primary))"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          {/* Moon icon (dark mode) */}
          <svg
            className={`w-5 h-5 absolute transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`}
            fill="none"
            stroke="rgb(var(--crt-accent-primary))"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </div>

        {/* CRT scanline overlay on hover */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none overflow-hidden"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              rgb(var(--crt-scanline-color) / 0.08) 2px,
              rgb(var(--crt-scanline-color) / 0.08) 3px
            )`
          }}
        />
      </div>
    </button>
  );
}
