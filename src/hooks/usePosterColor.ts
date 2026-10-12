import { useEffect, useState } from "react";

const colorCache = new Map<string, string>();

/** The poster's average colour as "r g b", so a card can glow in its own artwork's colour. */
export function usePosterColor(src: string | undefined) {
  const [color, setColor] = useState(() => (src ? colorCache.get(src) : undefined));

  useEffect(() => {
    if (!src || colorCache.has(src)) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 5;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, 8, 5);
      const data = context.getImageData(0, 0, 8, 5).data;
      // Take the most saturated swatch rather than the mean, which turns most screenshots grey.
      let best = [255, 179, 71];
      let bestScore = -1;
      for (let index = 0; index < data.length; index += 4) {
        const [r, g, b] = [data[index], data[index + 1], data[index + 2]];
        const score = Math.max(r, g, b) - Math.min(r, g, b) + Math.max(r, g, b) / 4;
        if (score > bestScore) {
          bestScore = score;
          best = [r, g, b];
        }
      }
      const value = best.join(" ");
      colorCache.set(src, value);
      setColor(value);
    };
    image.src = src;
    return () => {
      image.onload = null;
    };
  }, [src]);

  return src ? (color ?? colorCache.get(src)) : undefined;
}
