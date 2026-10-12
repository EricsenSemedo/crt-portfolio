import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { drawTvStatic } from "../utils/tvStatic";

interface TVStaticProps {
  className?: string;
  /** Stops redrawing once the snow has faded out but is still mounted. */
  paused?: boolean;
}

/**
 * TVStatic - Live snow from the same frames the 3D sets use, so every lost signal on the
 * site looks alike. Reduced motion holds a single still frame.
 */
export default function TVStatic({ className = "", paused = false }: TVStaticProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let frame = 0;
    let lastDrawn = -Infinity;
    function draw(time: number) {
      if (time - lastDrawn >= 40) {
        lastDrawn = time;
        drawTvStatic(context!, 0, 0, canvas!.width, canvas!.height, 1, time);
      }
      if (!reduceMotion && !paused) frame = requestAnimationFrame(draw);
    }
    draw(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [paused, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      width={384}
      height={216}
      className={"pointer-events-none absolute inset-0 h-full w-full " + className}
      aria-hidden="true"
    />
  );
}
