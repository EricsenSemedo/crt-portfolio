import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

/**
 * ThemeToggle - CRT-styled dark/light mode switch.
 * Rendered as a physical toggle knob that matches the TV aesthetic.
 * Uses Framer Motion spring animations for icon transitions and CRT-style
 * press effects consistent with CRTButton.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crt-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-crt-base rounded-full"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{
        scale: 0.95,
        filter: "contrast(1.3) brightness(1.2) hue-rotate(5deg)",
      }}
      transition={{ type: "spring", damping: 15, stiffness: 400 }}
    >
      {/* Outer knob housing */}
      <div className="relative w-12 h-12 rounded-full bg-crt-surface-secondary border-2 border-crt-border shadow-lg transition-all duration-300 motion-reduce:transition-none group-hover:border-crt-accent/50 group-hover:shadow-crt-accent/20">
        {/* Inner indicator */}
        <div className="absolute inset-2 rounded-full flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.svg
                key="moon"
                className="w-5 h-5 absolute"
                fill="none"
                stroke="rgb(var(--crt-accent-primary))"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
                initial={{ opacity: 0, rotate: -90, scale: 0 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </motion.svg>
            ) : (
              <motion.svg
                key="sun"
                className="w-5 h-5 absolute"
                fill="none"
                stroke="rgb(var(--crt-accent-primary))"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
                initial={{ opacity: 0, rotate: 90, scale: 0 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>

        {/* CRT scanline overlay on hover */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-200 motion-reduce:transition-none pointer-events-none overflow-hidden"
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
    </motion.button>
  );
}
