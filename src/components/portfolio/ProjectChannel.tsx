import type { Project } from "../../types";
import CRTButton from "../CRTButton";
import ScrambleHeading from "../ScrambleHeading";
import ProjectMedia from "./ProjectMedia";

interface ProjectChannelProps {
  project: Project;
  nextProject?: Project;
  onNextProject?: () => void;
  onContact?: () => void;
}

interface ProjectStep {
  title: string;
  description: string;
}

function projectSteps(project: Project): ProjectStep[] {
  const { contribution, problem, solution, impact } = project.detailedDescription;
  const owned = { title: "What I owned", description: contribution };
  if (project.detailLayout === "hackathon") {
    return [owned, ...(project.storySteps ?? []).filter((step) => step.label !== "My Contribution")];
  }
  if (project.detailLayout === "game") {
    return [
      owned,
      { title: "What made it difficult", description: problem },
      { title: "How I built it", description: solution },
      { title: "Where it stands", description: impact },
    ];
  }
  return [
    owned,
    { title: "What needed to change", description: problem },
    { title: "What I built", description: solution },
    { title: "Outcome", description: impact },
  ];
}

/**
 * ProjectChannel - One project as a single page: the demo leads, the story reads beneath it,
 * and a spec sheet keeps stack and links in reach. Ends on the next channel and the contact call.
 */
export default function ProjectChannel({ project, nextProject, onNextProject, onContact }: ProjectChannelProps) {
  const isHackathon = project.detailLayout === "hackathon";
  const links = [
    ...(project.sources ?? []),
    ...(project.github && !project.sources?.some((source) => source.href === project.github) ? [{ label: "GitHub", href: project.github }] : []),
  ];

  return (
    <div className="h-full overflow-y-auto overscroll-y-contain" data-crt-scroll-container>
      <article className="mx-auto w-full max-w-6xl px-3 pb-12 pt-6 sm:px-8 sm:pt-8">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <ScrambleHeading
            as="h1"
            delay={180}
            className="font-display text-3xl font-bold leading-tight tracking-wide text-crt-text sm:text-5xl"
          >
            {project.title}
          </ScrambleHeading>
          <p className="font-mono text-sm text-crt-text-tertiary sm:text-right">
            {project.category}
            <span className={"block " + (isHackathon ? "font-semibold text-crt-accent-text" : "")}>{project.status}</span>
          </p>
        </header>

        {/* The whole demo fits on the first screen, so the work is seen before any reading. */}
        <div className="project-channel__media mx-auto">
          <ProjectMedia project={project} />
        </div>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[minmax(0,1fr)_17rem] md:gap-14">
          <div>
            <p data-enter="copy" className="max-w-[60ch] font-display text-xl leading-relaxed text-crt-text sm:text-2xl">
              {project.description}
            </p>

            {projectSteps(project).map((step) => (
              <section key={step.title} className="relative mt-10 pt-7">
                <span data-enter="rule" className="crt-rule" aria-hidden="true" />
                <h2 data-enter="heading" className="font-display text-2xl font-bold tracking-wide text-crt-text">{step.title}</h2>
                <p data-enter="copy" className="mt-3 max-w-[62ch] text-[1.0625rem] leading-relaxed text-crt-text-secondary">{step.description}</p>
              </section>
            ))}

            {!isHackathon && project.detailedDescription.highlights.length > 0 && (
              <section className="relative mt-10 pt-7">
                <span data-enter="rule" className="crt-rule" aria-hidden="true" />
                <h2 data-enter="heading" className="font-display text-2xl font-bold tracking-wide text-crt-text">
                  {project.detailLayout === "game" ? "Key systems" : "Technical highlights"}
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {project.detailedDescription.highlights.map((highlight) => (
                    <li key={highlight} data-enter="copy" className="flex gap-3 border border-crt-border bg-crt-surface-primary/40 p-4 leading-relaxed text-crt-text-secondary">
                      <span className="mt-2 block h-2 w-2 shrink-0 bg-crt-accent" aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="md:sticky md:top-6 md:self-start" aria-label="Project details">
            <dl className="space-y-7 border-t border-crt-border pt-7 md:border-l md:border-t-0 md:pl-7 md:pt-0">
              <div data-enter="copy">
                <dt className="font-display text-lg font-semibold text-crt-text">Built with</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span key={tech} className="border border-crt-accent/30 bg-crt-accent/20 px-2.5 py-1 font-mono text-sm text-crt-accent-text">
                      {tech}
                    </span>
                  ))}
                </dd>
              </div>
              {links.length > 0 && (
                <div data-enter="copy">
                  <dt className="font-display text-lg font-semibold text-crt-text">See more</dt>
                  <dd className="mt-3 flex flex-col gap-2">
                    {links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="crt-action-shell flex min-h-11 items-center justify-between border border-crt-border px-4 py-2 font-mono text-crt-text transition-colors hover:bg-crt-text hover:text-[#111]"
                      >
                        {link.label}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </div>

        <footer className="relative mt-16 flex flex-wrap items-center justify-between gap-6 pt-8" aria-label="Keep watching">
          <span data-enter="rule" className="crt-rule" aria-hidden="true" />
          {nextProject && onNextProject ? (
            <button
              type="button"
              data-enter="copy"
              onClick={onNextProject}
              className="group min-h-11 text-left font-display text-xl text-crt-text-secondary transition-colors hover:text-crt-text focus-visible:outline-2 focus-visible:outline-crt-accent-text sm:text-2xl"
            >
              Next channel: <span className="font-bold text-crt-text">{nextProject.title}</span>{" "}
              <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
          ) : <span />}
          {onContact && (
            <CRTButton data-enter="copy" variant="primary" className="min-h-11" onClick={onContact}>Get In Touch</CRTButton>
          )}
        </footer>
      </article>
    </div>
  );
}
