import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { PORTFOLIO_CHANNELS, type PortfolioChannelId } from "../data/channels";
import { useModalAccessibility } from "../hooks/useModalAccessibility";
import Navbar from "./Navbar";

interface SelectedItem {
  id: PortfolioChannelId;
}

interface TVZoomOverlayProps {
  selectedItem: SelectedItem | null;
  onClose?: () => void;
  onExitComplete?: () => void;
  onEnterComplete?: () => void;
  children?: ReactNode;
  backgroundRef?: RefObject<HTMLElement | null>;
}

/**
 * TVZoomOverlay - True full-screen overlay that displays TV content with CRT effects.
 * Uses theme tokens for background, glow, and noise colors.
 */
export default function TVZoomOverlay({
  selectedItem,
  onClose,
  onExitComplete,
  onEnterComplete,
  children,
  backgroundRef,
}: TVZoomOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const selectedId = selectedItem?.id;

  useEffect(() => {
    if (!selectedId) return;
    const delay = reduceMotion ? 20 : 460;
    const timer = window.setTimeout(() => onEnterComplete?.(), delay);
    return () => window.clearTimeout(timer);
  }, [onEnterComplete, reduceMotion, selectedId]);

  useModalAccessibility({
    isOpen: Boolean(selectedItem),
    dialogRef,
    backgroundRef,
    onClose,
    initialFocus: "dialog",
  });

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {selectedItem && (
        <motion.div
          ref={dialogRef}
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ backgroundColor: "rgb(var(--crt-bg-overlay) / 0.6)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: "easeOut" }}
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.32, ease: "easeIn" } }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tv-overlay-title"
          tabIndex={-1}
        >
          {/* Full-screen content container with CRT effects */}
          <motion.div
            className="crt-screen-frame relative h-full w-full overflow-hidden bg-[#1a1a1a]"
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: "center" }}
            initial={reduceMotion
              ? { opacity: 0 }
              : { scaleX: 0.08, scaleY: 0.008, opacity: 0, filter: "brightness(3) blur(3px)" }}
            animate={reduceMotion ? { opacity: 1 } : {
              scaleX: [0.08, 1, 1],
              scaleY: [0.008, 0.018, 1],
              opacity: [0, 1, 1],
              filter: ["brightness(3) blur(3px)", "brightness(2.2) blur(1px)", "brightness(1) blur(0px)"],
            }}
            transition={reduceMotion
              ? { duration: 0.01 }
              : { duration: 0.42, times: [0, 0.34, 1], ease: [0.22, 1, 0.36, 1] }}
            exit={reduceMotion ? { opacity: 0 } : {
              scaleX: [1, 1, 0.08],
              scaleY: [1, 0.014, 0.005],
              opacity: [1, 1, 0],
              filter: ["brightness(1) blur(0px)", "brightness(2.4) blur(1px)", "brightness(3) blur(3px)"],
              transition: { duration: 0.32, times: [0, 0.72, 1], ease: [0.55, 0, 1, 0.45] },
            }}
          >
            {/* Content */}
            <motion.div
              className="relative w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
            >
                <div className="absolute inset-0">
                  <Navbar title={PORTFOLIO_CHANNELS[selectedItem.id].title} onClose={onClose} />
                  <div className="absolute inset-0">{children}</div>
                </div>
              </motion.div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
