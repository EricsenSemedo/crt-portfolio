import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { browseMedia } from "../../data/browse";
import type { Project } from "../../types";
import CRTScanlines from "../CRTScanlines";
import StaticNoise from "../StaticNoise";

interface ShelfScreenProps {
  project: Project;
  /** Plays the clip; the poster stays up until real frames arrive. */
  active: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** A project's screen: its poster, its clip while active, or static while it's off the air. */
export default function ShelfScreen({ project, active, className = "", style, children }: ShelfScreenProps) {
  const media = browseMedia(project);
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const shouldPlay = active && !reduceMotion && Boolean(media?.clip);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  return (
    <div className={"relative overflow-hidden bg-crt-shell-screen " + className} style={style}>
      {media ? (
        <>
          <img src={media.poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
          {media.clip && (
            <video
              ref={videoRef}
              src={media.clip}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              onPlaying={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className={"absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-200 " + (shouldPlay && playing ? "opacity-100" : "opacity-0")}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-black">
          <StaticNoise intensity={5} />
          <div className="demo-carousel__static absolute inset-0" />
          <p className="absolute inset-0 m-auto h-fit w-fit border border-crt-border bg-crt-base/90 px-3 py-1.5 font-mono text-xs text-crt-text">
            Off air
          </p>
        </div>
      )}
      <CRTScanlines opacity={0.12} lineHeight={3} lineSpacing={1} />
      {children}
    </div>
  );
}
