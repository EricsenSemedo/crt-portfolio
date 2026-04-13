import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useModalAccessibility } from "../hooks/useModalAccessibility";
import CRTScanlines from "./CRTScanlines";
import CRTVignette from "./CRTVignette";
import Navbar from "./Navbar";

interface SelectedItem {
  id: string;
  title: string;
}

interface TVZoomOverlayProps {
  selectedItem: SelectedItem | null;
  onClose?: () => void;
  children?: ReactNode;
  backgroundRef?: RefObject<HTMLElement | null>;
}

/**
 * TVZoomOverlay - True full-screen overlay that displays TV content with CRT effects.
 * Uses theme tokens for background, glow, and noise colors.
 */
export default function TVZoomOverlay({ selectedItem, onClose, children, backgroundRef }: TVZoomOverlayProps) {
  // ========================================
  // State Management
  // ========================================
  const [phase, setPhase] = useState<"warmup" | "sweep" | "flicker" | "ready" | "off">("off");
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: Boolean(selectedItem),
    dialogRef,
    backgroundRef,
    onClose,
  });

  useEffect(() => {
    if (!selectedItem) {
      setPhase("off");
      return;
    }

    setPhase("warmup");
    const timers = [
      setTimeout(() => setPhase("sweep"), 300),
      setTimeout(() => setPhase("flicker"), 700),
      setTimeout(() => setPhase("ready"), 850),
    ];

    return () => timers.forEach(clearTimeout);
  }, [selectedItem]);

  return (
    <AnimatePresence>
      {selectedItem && (
        <motion.div
          ref={dialogRef}
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ backgroundColor: "rgb(var(--crt-bg-overlay) / 0.6)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={showContent ? "tv-overlay-title" : undefined}
          aria-label={showContent ? undefined : "TV overlay"}
          tabIndex={-1}
        >
          {/* Full-screen content container with CRT effects */}
          <motion.div
            className="w-full h-full bg-crt-base relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CRT Effects */}
            <CRTVignette intensity={0.3} innerRadius={40} />
            <CRTScanlines opacity={0.2} lineHeight={4} lineSpacing={2} />

            {/* Content */}
            <motion.div
              className="relative w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
                {/* Phase 1: Phosphor warm-up — bright line expands from center */}
                {phase === "warmup" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-full"
                      style={{
                        height: "2px",
                        background: "rgb(var(--crt-glow-accent))",
                        boxShadow: "0 0 20px rgb(var(--crt-glow-accent) / 0.6), 0 0 60px rgb(var(--crt-glow-accent) / 0.3)",
                        animation: "phosphorWarmup 0.3s ease-out forwards",
                      }}
                    />
                  </div>
                )}

                {/* Phase 2+: Content with sweep/flicker */}
                {phase !== "warmup" && phase !== "off" && (
                  <div className="absolute inset-0">
                    <Navbar title={selectedItem.title} onClose={onClose} />

                    {/* Page content — blurry during sweep, sharp after */}
                    <div
                      className="absolute inset-0"
                      style={{
                        filter: phase === "sweep" ? "blur(2px) brightness(0.8)" : "none",
                        animation: phase === "flicker" ? "crtFlicker 0.15s ease-in-out" : undefined,
                      }}
                    >
                      {children}
                    </div>

                    {/* Clear content revealed by sweep */}
                    {phase === "sweep" && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          clipPath: "inset(0 0 100% 0)",
                          animation: "revealClear 0.4s linear forwards",
                        }}
                      >
                        <div className="absolute inset-0">{children}</div>
                      </div>
                    )}

                    {/* Accent-colored sweep line */}
                    {phase === "sweep" && (
                      <div
                        className="pointer-events-none absolute inset-x-0 h-8 -top-8"
                        style={{
                          background: "linear-gradient(to bottom, rgb(var(--crt-glow-accent) / 0.2), rgb(var(--crt-glow-accent) / 0.08), transparent)",
                          boxShadow: "0 0 24px rgb(var(--crt-glow-accent) / 0.4)",
                          opacity: "var(--crt-glow-opacity)",
                          mixBlendMode: "screen",
                          animation: "sweepLine 0.4s linear forwards",
                        }}
                      />
                    )}

                    {/* Noise overlay in unswept area */}
                    {phase === "sweep" && (
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          opacity: "calc(0.4 * var(--crt-noise-opacity))",
                          background: `repeating-linear-gradient(0deg, rgb(var(--crt-noise-light) / 0.02) 0px, rgb(var(--crt-noise-dark) / 0.02) 1px, transparent 2px, transparent 3px), repeating-linear-gradient(90deg, rgb(var(--crt-noise-light) / 0.01) 0px, rgb(var(--crt-noise-dark) / 0.01) 1px, transparent 2px, transparent 4px)`,
                          clipPath: "inset(0 0 0% 0)",
                          animation: "hideNoise 0.4s linear forwards",
                        }}
                      />
                    )}
                  </div>
                )}

                <style>{`
                  @keyframes phosphorWarmup {
                    0% { transform: scaleY(1); opacity: 0.3; }
                    50% { transform: scaleY(3); opacity: 1; }
                    100% { transform: scaleY(100); opacity: 0.8; }
                  }
                  @keyframes sweepLine {
                    0% { transform: translateY(-150%); }
                    100% { transform: translateY(calc(100vh + 150%)); }
                  }
                  @keyframes revealClear {
                    0% { clip-path: inset(0 0 100% 0); }
                    100% { clip-path: inset(0 0 0% 0); }
                  }
                  @keyframes hideNoise {
                    0% { clip-path: inset(0% 0 0 0); }
                    100% { clip-path: inset(100% 0 0 0); }
                  }
                  @keyframes crtFlicker {
                    0% { opacity: 1; }
                    25% { opacity: 0.7; }
                    50% { opacity: 1; }
                    75% { opacity: 0.85; }
                    100% { opacity: 1; }
                  }
                `}</style>
              </motion.div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
