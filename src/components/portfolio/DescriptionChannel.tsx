import { motion } from "framer-motion";
import type { Project } from "../../types";
import ScrambleHeading from "../ScrambleHeading";

interface DescriptionChannelProps {
  project: Project;
}

/**
 * DescriptionChannel - Project description tab with Problem/Solution/Impact cards.
 * Uses theme tokens for card backgrounds, borders, semantic colors, and text.
 */
export default function DescriptionChannel({ project }: DescriptionChannelProps) {
  const isGame = project.detailLayout === "game";
  const isHackathon = project.detailLayout === "hackathon";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto p-8"
      data-crt-scroll-container
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <ScrambleHeading as="h2" delay={180} className="text-3xl font-display font-bold text-crt-accent mb-2 tracking-wide">{project.title}</ScrambleHeading>
          <p className="text-crt-text-tertiary font-mono text-lg">{project.category}</p>
        </div>
        
        <div className="space-y-8">
          {isHackathon && (
            <div className="crt-scroll-reveal border border-crt-accent p-6">
              <p className="font-mono text-xs uppercase tracking-[.2em] text-crt-accent mb-2">Competition Result</p>
              <p className="font-display text-3xl font-bold text-crt-text">{project.status}</p>
            </div>
          )}

          {isGame ? (
            <div className="crt-scroll-reveal bg-crt-surface-primary/50 p-6 rounded-lg border border-crt-border">
              <h3 className="text-xl font-display font-bold text-crt-accent mb-3">About the Game</h3>
              <p className="text-crt-text-secondary text-lg leading-relaxed">{project.description}</p>
            </div>
          ) : isHackathon ? (
            <div>
              <p className="crt-scroll-reveal mb-10 max-w-3xl font-display text-2xl leading-relaxed text-crt-text">{project.description}</p>
              <div className="ml-2 border-l border-crt-accent pl-7">
                {project.storySteps?.map((step, index) => (
                  <div key={step.label} className="crt-scroll-reveal relative pb-8 last:pb-0">
                    <span className="absolute -left-[2rem] top-1 block h-2.5 w-2.5 bg-crt-accent" aria-hidden="true" />
                    <p className="font-mono text-xs uppercase tracking-[.2em] text-crt-accent">{String(index + 1).padStart(2, "0")} / {step.label}</p>
                    <h3 className="mt-2 text-xl font-display font-bold text-crt-text">{step.title}</h3>
                    <p className="mt-2 max-w-3xl leading-relaxed text-crt-text-secondary">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="crt-scroll-reveal bg-crt-surface-primary/50 p-6 rounded-lg border border-crt-border">
                <h3 className="text-xl font-display font-bold text-crt-danger mb-3">Problem</h3>
                <p className="text-crt-text-secondary">{project.detailedDescription.problem}</p>
              </div>

              <div className="crt-scroll-reveal bg-crt-surface-primary/50 p-6 rounded-lg border border-crt-border">
                <h3 className="text-xl font-display font-bold text-crt-warning mb-3">Solution</h3>
                <p className="text-crt-text-secondary">{project.detailedDescription.solution}</p>
              </div>

              <div className="crt-scroll-reveal bg-crt-surface-primary/50 p-6 rounded-lg border border-crt-border">
                <h3 className="text-xl font-display font-bold text-crt-success mb-3">Impact</h3>
                <p className="text-crt-text-secondary">{project.detailedDescription.impact}</p>
              </div>
            </div>
          )}
          
          {/* Key Highlights */}
          {!isHackathon && <div className="crt-scroll-reveal bg-crt-surface-primary/30 p-6 rounded-lg border border-crt-border">
            <h3 className="text-xl font-display font-bold text-crt-accent mb-4">{isGame ? "Key Features" : "Key Highlights"}</h3>
            <ul className="space-y-2">
              {project.detailedDescription.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-crt-accent mr-3 mt-1">•</span>
                  <span className="text-crt-text-secondary">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>}
          
          {/* Tech Stack */}
          <div className="crt-scroll-reveal text-center">
            <h3 className="text-xl font-display font-bold text-crt-accent mb-4">Technologies Used</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 font-mono bg-crt-accent/20 text-crt-accent-hover rounded-lg border border-crt-accent/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {project.sources && project.sources.length > 0 && (
            <div className="crt-scroll-reveal flex flex-wrap justify-center gap-3 border-t border-crt-border pt-6">
              {project.sources.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="crt-action-shell border border-crt-border px-4 py-3 font-mono text-crt-text hover:bg-white hover:text-[#111] transition-colors"
                >
                  {source.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
