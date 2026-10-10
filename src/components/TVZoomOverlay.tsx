import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { PORTFOLIO_CHANNELS, type PortfolioChannelId } from "../data/channels";
import { useModalAccessibility } from "../hooks/useModalAccessibility";
import useScrollMotion from "../hooks/useScrollMotion";
import Navbar from "./Navbar";
import StaticNoise from "./StaticNoise";

interface SelectedItem {
  id: PortfolioChannelId;
}

interface TVZoomOverlayProps {
  selectedItem: SelectedItem | null;
  onClose?: () => void;
  onExitComplete?: () => void;
  onEnterComplete?: () => void;
  hideHeader?: boolean;
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
  hideHeader = false,
  children,
  backgroundRef,
}: TVZoomOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const selectedId = selectedItem?.id;
  const enterDelay = reduceMotion ? 20 : 460;

  useScrollMotion(dialogRef, selectedId, enterDelay);

  useEffect(() => {
    if (!selectedId) return;
    const timer = window.setTimeout(() => onEnterComplete?.(), enterDelay);
    return () => window.clearTimeout(timer);
  }, [enterDelay, onEnterComplete, selectedId]);

  useModalAccessibility({
    isOpen: Boolean(selectedItem),
    dialogRef,
    backgroundRef,
    onClose,
    initialFocus: "dialog",
  });

  // Hand focus to the page scroller so arrow keys and Page Down read the channel.
  useEffect(() => {
    if (!selectedId) return;
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>(".crt-page")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedId]);

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
          aria-labelledby={hideHeader ? undefined : "tv-overlay-title"}
          aria-label={hideHeader ? PORTFOLIO_CHANNELS[selectedItem.id].title : undefined}
          tabIndex={-1}
        >
          {/* Full-screen content container with CRT effects */}
          <motion.div
            className="crt-screen-frame relative h-full w-full overflow-hidden bg-crt-base"
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
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={selectedItem.id}
                      className="absolute inset-0"
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-7%", filter: "brightness(2.2)" }}
                      animate={{ opacity: 1, y: "0%", filter: "brightness(1)" }}
                      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.12 } }}
                      transition={reduceMotion
                        ? { duration: 0.01 }
                        : { delay: 0.16, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {!hideHeader && <Navbar title={PORTFOLIO_CHANNELS[selectedItem.id].title} onClose={onClose} />}
                      <div className="absolute inset-0">{children}</div>
                    </motion.div>
                  </AnimatePresence>
                  {!reduceMotion && <ChannelFlip id={selectedItem.id} />}
                </div>
              </motion.div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Static burst and on-screen channel number when the channel changes inside the TV. */
function ChannelFlip({ id }: { id: PortfolioChannelId }) {
  const [flip, setFlip] = useState<{ id: PortfolioChannelId; count: number }>({ id, count: 0 });
  if (flip.id !== id) setFlip({ id, count: flip.count + 1 });
  const channel = PORTFOLIO_CHANNELS[id];

  return (
    <AnimatePresence>
      {flip.count > 0 && (
        <motion.div key={flip.count} className="pointer-events-none absolute inset-0 z-50" aria-hidden="true">
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.14, duration: 0.2 }}
          >
            <StaticNoise intensity={8} />
            <div className="demo-carousel__static absolute inset-0" />
          </motion.div>
          <motion.p
            className="channel-osd absolute right-6 top-20 font-mono text-3xl font-bold md:right-10 md:text-4xl"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1.1, duration: 0.25 }}
          >
            CH {channel.number}
            <span className="block text-right text-lg">{channel.title.toUpperCase()}</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
