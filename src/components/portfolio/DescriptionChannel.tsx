import { motion } from "framer-motion";
import type { Project } from "../../types";
import ProjectContentHeading from "./ProjectContentHeading";

interface DescriptionChannelProps {
  project: Project;
}

/**
 * Shared project description channel with a centered, typography-led layout.
 */
export default function DescriptionChannel({ project }: DescriptionChannelProps) {
  const isGame = project.detailLayout === "game";
  const isHackathon = project.detailLayout === "hackathon";
  const overviewSteps = isGame
    ? [
        { label: "My Contribution", title: "What I owned", description: project.detailedDescription.contribution },
        { label: "Technical Challenge", title: "What made it difficult", description: project.detailedDescription.problem },
        { label: "Approach", title: "How I built it", description: project.detailedDescription.solution },
        { label: "Current Result", title: project.status, description: project.detailedDescription.impact },
      ]
    : [
        { label: "My Contribution", title: "What I owned", description: project.detailedDescription.contribution },
        { label: "Context", title: "What needed to change", description: project.detailedDescription.problem },
        { label: "Approach", title: "What I built", description: project.detailedDescription.solution },
        { label: "Outcome", title: project.status, description: project.detailedDescription.impact },
      ];
  const hackathonSteps = [
    { label: "My Contribution", title: "What I owned", description: project.detailedDescription.contribution },
    ...(project.storySteps ?? []).filter((step) => step.label !== "My Contribution"),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={isHackathon ? "h-full overflow-y-auto p-4 sm:p-8" : "h-full overflow-y-auto px-3 py-8 sm:px-8 sm:py-10"}
      data-crt-scroll-container
    >
      <div>
        <div className={"mx-auto w-full " + (isHackathon ? "max-w-4xl" : "max-w-3xl text-center")}>
          <ProjectContentHeading
            title={project.title}
            category={project.category}
            className={isHackathon ? "mb-8" : "mb-10"}
          />
        
        <div className="space-y-8">
          {isHackathon && (
            <div className="border border-crt-accent p-6">
              <p className="crt-scroll-reveal font-mono text-xs uppercase tracking-[.2em] text-crt-accent mb-2">Competition Result</p>
              <p className="crt-scroll-reveal font-display text-3xl font-bold text-crt-text">{project.status}</p>
            </div>
          )}

          {isHackathon ? (
            <div>
              <p className="crt-scroll-reveal mb-10 max-w-3xl font-display text-2xl leading-relaxed text-crt-text">{project.description}</p>
              <div className="ml-2 border-l border-crt-accent pl-7">
                {hackathonSteps.map((step, index) => (
                  <div key={step.label} className="relative pb-8 last:pb-0">
                    <span className="absolute -left-[2rem] top-1 block h-2.5 w-2.5 bg-crt-accent" aria-hidden="true" />
                    <p className="crt-scroll-reveal font-mono text-xs uppercase tracking-[.2em] text-crt-accent">{String(index + 1).padStart(2, "0")} / {step.label}</p>
                    <h3 className="crt-scroll-reveal mt-2 text-xl font-display font-bold text-crt-text">{step.title}</h3>
                    <p className="crt-scroll-reveal mt-2 max-w-3xl leading-relaxed text-crt-text-secondary">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="crt-scroll-reveal mb-10 font-display text-lg leading-relaxed text-crt-text sm:text-2xl">{project.description}</p>
              <div className="ml-2 border-l border-crt-accent pl-7 text-left">
                {overviewSteps.map((step, index) => (
                  <div key={step.label} className="relative pb-8 last:pb-0">
                    <span className="absolute -left-[2rem] top-1 block h-2.5 w-2.5 bg-crt-accent" aria-hidden="true" />
                    <p className="crt-scroll-reveal font-mono text-xs uppercase tracking-[.2em] text-crt-accent">
                      {String(index + 1).padStart(2, "0")} / {step.label}
                    </p>
                    <h3 className="crt-scroll-reveal mt-2 font-display text-xl font-bold text-crt-text">{step.title}</h3>
                    <p className="crt-scroll-reveal mt-2 max-w-3xl leading-relaxed text-crt-text-secondary">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Key Highlights */}
          {!isHackathon && <div className="pt-4">
            <h3 className="crt-scroll-reveal mb-4 font-display text-xl font-bold text-crt-accent">{isGame ? "Key Systems" : "Technical Highlights"}</h3>
            <ul className="space-y-2">
              {project.detailedDescription.highlights.map((highlight, index) => (
                <li key={index} className="crt-scroll-reveal">
                  <span className="text-crt-text-secondary">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>}
          
          {/* Tech Stack */}
          <div className="text-center">
            <h3 className="crt-scroll-reveal text-xl font-display font-bold text-crt-accent mb-4">Technologies Used</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="border border-crt-accent/30 bg-crt-accent/20 px-4 py-2 font-mono text-crt-accent-hover"
                >
                  <span className="crt-scroll-reveal inline-block">{tech}</span>
                </span>
              ))}
            </div>
          </div>

          {project.sources && project.sources.length > 0 && (
            <div className={"flex flex-wrap justify-center gap-3 " + (isHackathon ? "border-t border-crt-border pt-6" : "pt-4")}>
              {project.sources.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="crt-action-shell border border-crt-border px-4 py-3 font-mono text-crt-text hover:bg-white hover:text-[#111] transition-colors"
                >
                  <span className="crt-scroll-reveal inline-block">{source.label} ↗</span>
                </a>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
