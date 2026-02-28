import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CRTBootScreenProps {
  onComplete: () => void;
}

/**
 * CRTBootScreen — Full-screen CRT power-on sequence shown once on initial load.
 *
 * Phases:
 *   1. Black screen with expanding white dot (cathode warm-up)
 *   2. Horizontal line expands across screen
 *   3. Screen "unfolds" vertically with brief static
 *   4. Fade to transparent — main UI visible
 */
export default function CRTBootScreen({ onComplete }: CRTBootScreenProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) {
      onComplete();
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => {
        setPhase(4);
        onComplete();
      }, 1900),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "rgb(var(--crt-bg-base))" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Phase 0: black screen */}

          {/* Phase 1: bright dot */}
          {phase >= 1 && (
            <motion.div
              className="absolute rounded-full"
              style={{ backgroundColor: "rgb(var(--crt-glow-color))" }}
              initial={{ width: 4, height: 4, opacity: 0 }}
              animate={{ width: 8, height: 8, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Phase 2: horizontal line */}
          {phase >= 2 && (
            <motion.div
              className="absolute h-px"
              style={{
                backgroundColor: "rgb(var(--crt-glow-color))",
                boxShadow: "0 0 12px 2px rgb(var(--crt-glow-accent) / 0.6)",
              }}
              initial={{ width: 8, opacity: 0.8 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}

          {/* Phase 3: screen unfold + static */}
          {phase >= 3 && (
            <>
              <motion.div
                className="absolute inset-x-0"
                style={{
                  backgroundColor: "rgb(var(--crt-bg-base))",
                  boxShadow: "0 0 40px 8px rgb(var(--crt-glow-accent) / 0.15)",
                }}
                initial={{ top: "50%", bottom: "50%" }}
                animate={{ top: 0, bottom: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      0deg,
                      rgb(var(--crt-noise-light) / 0.06) 0px,
                      rgb(var(--crt-noise-dark) / 0.04) 1px,
                      transparent 2px,
                      transparent 4px
                    )
                  `,
                  opacity: "calc(0.6 * var(--crt-noise-opacity))",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.15 }}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
