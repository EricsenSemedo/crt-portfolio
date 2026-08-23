import { motion } from "framer-motion";
import { useState } from "react";
import StaticNoise from "./StaticNoise";
import { getTVSignalTransition } from "./tvSignalTransition";
import type { PortfolioChannelId } from "../three/createPortfolioScene";

interface TVSignalTransitionProps {
  channel: PortfolioChannelId;
  title: string;
  reduceMotion: boolean;
}

export default function TVSignalTransition({ channel, title, reduceMotion }: TVSignalTransitionProps) {
  const [complete, setComplete] = useState(false);
  const kind = getTVSignalTransition(channel);
  if (complete) return null;
  if (reduceMotion) {
    return <motion.div className="tv-signal-transition bg-[#0b246f]" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.08 }} onAnimationComplete={() => setComplete(true)} />;
  }

  if (kind === "pinch") {
    return (
      <motion.div
        className="tv-signal-transition tv-signal-transition--pinch"
        initial={{ scaleX: 1, scaleY: 1, opacity: 1, filter: "brightness(1)" }}
        animate={{ scaleX: [1, 1, 0.08], scaleY: [1, 0.018, 0.006], opacity: [1, 1, 0], filter: ["brightness(1)", "brightness(2.8)", "brightness(4)"] }}
        transition={{ delay: 0.16, duration: 0.3, times: [0, 0.72, 1], ease: [0.55, 0, 1, 0.45] }}
        onAnimationComplete={() => setComplete(true)}
      >
        <span className="tv-signal-transition__title">{title}</span>
      </motion.div>
    );
  }

  if (kind === "channel-static") {
    return (
      <motion.div
        className="tv-signal-transition tv-signal-transition--static"
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{ delay: 0.14, duration: 0.24, times: [0, 0.68, 1], ease: "linear" }}
        onAnimationComplete={() => setComplete(true)}
      >
        <StaticNoise intensity={2.4} />
        <span className="tv-signal-transition__blanking" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="tv-signal-transition tv-signal-transition--lock"
      initial={{ y: "0%", opacity: 1 }}
      animate={{ y: ["0%", "-18%", "-105%"], opacity: [1, 1, 0] }}
      transition={{ delay: 0.14, duration: 0.34, times: [0, 0.38, 1], ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => setComplete(true)}
    >
      <span className="tv-signal-transition__title">{title}</span>
      <span className="tv-signal-transition__sync-line" />
    </motion.div>
  );
}
