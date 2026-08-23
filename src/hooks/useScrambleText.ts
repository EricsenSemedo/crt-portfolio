import { useCallback, useEffect, useRef, useState } from "react";

interface ScrambleOptions {
  autoPlay?: "touch" | "always";
  delay?: number;
}

export default function useScrambleText(label: string, disabled = false, options: ScrambleOptions = {}) {
  const [visibleLabel, setVisibleLabel] = useState(label);
  const animationRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setVisibleLabel(label);
    return () => {
      window.clearTimeout(timerRef.current);
      cancelAnimationFrame(animationRef.current);
    };
  }, [label]);

  const scramble = useCallback(() => {
    if (disabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(animationRef.current);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const startedAt = performance.now();

    function frame(now: number) {
      const progress = Math.min((now - startedAt) / 260, 1);
      const resolved = Math.floor(progress * label.length);
      setVisibleLabel(label.split("").map((character, index) => {
        if (character === " " || index < resolved) return character;
        return alphabet[(index * 7 + Math.floor(now / 28)) % alphabet.length];
      }).join(""));
      if (progress < 1) animationRef.current = requestAnimationFrame(frame);
      else setVisibleLabel(label);
    }

    animationRef.current = requestAnimationFrame(frame);
  }, [disabled, label]);

  useEffect(() => {
    if (!options.autoPlay) return;
    const touchPrimary = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    // NOTE: Preserve the entrance cue on touch devices without replaying decoration for mouse users.
    if (options.autoPlay === "touch" && !touchPrimary) return;
    timerRef.current = window.setTimeout(scramble, options.delay ?? 0);
    return () => window.clearTimeout(timerRef.current);
  }, [options.autoPlay, options.delay, scramble]);

  return { visibleLabel, scramble };
}
