import { useEffect, useRef, useState } from "react";

export default function useScrambleText(label: string, disabled = false) {
  const [visibleLabel, setVisibleLabel] = useState(label);
  const animationRef = useRef(0);

  useEffect(() => {
    setVisibleLabel(label);
    return () => cancelAnimationFrame(animationRef.current);
  }, [label]);

  function scramble() {
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
  }

  return { visibleLabel, scramble };
}
