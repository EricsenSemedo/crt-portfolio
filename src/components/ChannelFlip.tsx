import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import TVStatic from "./TVStatic";

interface ChannelFlipProps {
  /** Changing this plays the flip; the first value never does. */
  flipKey: string;
  number: string;
  title: string;
}

/**
 * ChannelFlip - The set losing and regaining the picture when the channel changes:
 * a burst of snow, a vertical-hold roll, and the channel number on screen for a moment.
 */
export default function ChannelFlip({ flipKey, number, title }: ChannelFlipProps) {
  const [flip, setFlip] = useState({ key: flipKey, count: 0 });
  const [settledFlip, setSettledFlip] = useState(0);
  if (flip.key !== flipKey) setFlip({ key: flipKey, count: flip.count + 1 });

  return (
    <AnimatePresence>
      {flip.count > 0 && (
        <motion.div key={flip.count} className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.12, duration: 0.22, ease: "easeOut" }}
            onAnimationComplete={() => setSettledFlip(flip.count)}
          >
            <TVStatic paused={settledFlip === flip.count} />
          </motion.div>
          <div className="channel-flip__roll absolute inset-x-0" />
          <motion.p
            className="channel-osd absolute right-6 top-20 font-mono text-3xl font-bold md:right-10 md:text-4xl"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1.1, duration: 0.25 }}
          >
            CH {number}
            <span className="block text-right text-lg">{title.toUpperCase()}</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
