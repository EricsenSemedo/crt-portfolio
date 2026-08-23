import { motion } from "framer-motion";
import type { Project } from "../../types";
import ScrambleHeading from "../ScrambleHeading";

interface DemoChannelProps {
  project: Project;
}

/**
 * DemoChannel - Demo tab content with video/image player and tech tags.
 * Uses theme tokens for backgrounds, text, and accent colors.
 */
export default function DemoChannel({ project }: DemoChannelProps) {
  const demo = project.demo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <ScrambleHeading as="h2" delay={180} className="text-3xl font-display font-bold text-crt-accent mb-2 tracking-wide">{project.title}</ScrambleHeading>
          <p className="text-crt-text-tertiary font-mono text-lg">{project.category}</p>
        </div>
        
        {/* Demo Media */}
        <div className="relative bg-crt-surface-primary rounded-lg overflow-hidden aspect-video mb-6">
          {!demo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-crt-surface-secondary">
              <div className="text-center px-6">
                <p className="font-mono text-crt-text-tertiary">Demo media not available</p>
              </div>
            </div>
          ) : demo.type === 'video' ? (
            <video
              src={demo.src}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="metadata"
            />
          ) : demo.type === 'gif' ? (
            <img
              src={demo.src}
              alt={demo.alt}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={demo.src}
              alt={demo.alt}
              className="w-full h-full object-cover"
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
        </div>
        
        {/* Tech Stack */}
        <div className="flex flex-wrap justify-center gap-2">
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
