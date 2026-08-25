import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Project } from "../../types";
import StaticNoise from "../StaticNoise";

interface DemoChannelProps {
  project: Project;
}

/**
 * DemoChannel - Demo tab content with video/image player and tech tags.
 * Uses theme tokens for backgrounds, text, and accent colors.
 */
export default function DemoChannel({ project }: DemoChannelProps) {
  const demo = project.demo;
  const media = useMemo(() => project.media ?? (demo ? [demo] : []), [demo, project.media]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTuning, setIsTuning] = useState(false);
  const pendingIndex = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setIsTuning(false);
    pendingIndex.current = null;
  }, [project.id]);

  useEffect(() => {
    if (media.length === 0) return;

    const preloadIndices = new Set([
      activeIndex,
      (activeIndex - 1 + media.length) % media.length,
      (activeIndex + 1) % media.length,
    ]);
    const imagePreloads = [...preloadIndices]
      .map((index) => media[index])
      .filter((item) => item.type === "image" || item.type === "gif")
      .map((item) => {
        const image = new Image();
        image.src = item.src;
        return image;
      });

    return () => imagePreloads.forEach((image) => image.removeAttribute("src"));
  }, [activeIndex, media]);

  useEffect(() => {
    if (!isTuning) return;

    const timeout = window.setTimeout(() => {
      if (pendingIndex.current !== null) setActiveIndex(pendingIndex.current);
      pendingIndex.current = null;
      setIsTuning(false);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [isTuning]);

  function selectMedia(index: number) {
    if (index === activeIndex || isTuning) return;
    pendingIndex.current = index;
    setIsTuning(true);
  }

  function moveMedia(direction: -1 | 1) {
    selectMedia((activeIndex + direction + media.length) % media.length);
  }

  const activeMedia = media[activeIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto flex flex-col items-center justify-center p-8"
      data-crt-scroll-container
    >
      <div className="w-full max-w-6xl">
        <div className="mb-4 text-center">
          <p className="text-crt-text-tertiary font-mono text-lg">{project.category}</p>
        </div>
        
        {/* Demo Media */}
        <div className="crt-scroll-reveal relative bg-crt-surface-primary overflow-hidden aspect-video border border-crt-border mb-3">
          {!activeMedia ? (
            <div className="absolute inset-0 flex items-center justify-center bg-crt-surface-secondary">
              <div className="text-center px-6">
                <p className="font-mono text-crt-text-tertiary">Demo media not available</p>
              </div>
            </div>
          ) : activeMedia.type === 'video' ? (
            <video
              key={activeMedia.src}
              src={activeMedia.src}
              className="w-full h-full object-contain"
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="metadata"
            />
          ) : activeMedia.type === 'gif' ? (
            <img
              src={activeMedia.src}
              alt={activeMedia.alt}
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={activeMedia.src}
              alt={activeMedia.alt}
              className="w-full h-full object-contain"
            />
          )}
          
          {/* Overlay for placeholder only */}
          {demo?.src.includes('placeholder') && (
            <div className="absolute inset-0 flex items-center justify-center bg-crt-surface-secondary">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-crt-text-tertiary">Demo video coming soon</p>
                <p className="text-sm text-crt-text-muted mt-2">{demo.alt}</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {isTuning && (
              <motion.div
                key="media-static"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.04 }}
                className="absolute inset-0 z-10 overflow-hidden bg-black"
                aria-hidden="true"
              >
                <StaticNoise intensity={7} />
                <div className="demo-carousel__static absolute inset-0" />
              </motion.div>
            )}
          </AnimatePresence>

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveMedia(-1)}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 border border-white/50 bg-black/70 px-3 py-2 font-mono text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crt-accent"
                aria-label="Previous project media"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => moveMedia(1)}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 border border-white/50 bg-black/70 px-3 py-2 font-mono text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crt-accent"
                aria-label="Next project media"
              >
                →
              </button>
              <span className="absolute bottom-3 right-3 z-20 bg-black/75 px-2 py-1 font-mono text-xs text-white">
                {String(activeIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
              </span>
            </>
          )}
        </div>

        {media.length > 1 && (
          <div className="mb-6 flex justify-center gap-1.5" aria-label={`${project.title} media slides`}>
            {media.map((item, index) => (
              <button
                key={item.src}
                type="button"
                onClick={() => selectMedia(index)}
                className={"h-1.5 transition-[width,background-color] duration-150 " + (index === activeIndex ? "w-8 bg-crt-accent" : "w-3 bg-crt-border hover:bg-crt-text-tertiary")}
                aria-label={`Show media ${index + 1} of ${media.length}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}
        
        {/* Tech Stack */}
        <div className="crt-scroll-reveal flex flex-wrap justify-center gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 font-mono bg-crt-accent/20 text-crt-accent-hover text-sm rounded border border-crt-accent/30"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
