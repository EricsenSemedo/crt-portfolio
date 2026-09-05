import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import { AdditionalProjectRow, ProjectDetailView, ProjectTV } from "../components/portfolio";
import projects from "../data/projects";
import type { NavigateFunction, Project } from "../types";

type ChannelType = 'demo' | 'description';

const softwareProjectIds = [
  "pullworth",
  "toonsync",
  "derma",
  "shadi",
];

const gameDevelopmentProjectIds = [
  "physics-grab",
  "dont-get-caught",
  "grow-your-plant",
];

const featuredProjectIds = [...softwareProjectIds, ...gameDevelopmentProjectIds];

function projectsById(ids: string[]) {
  return ids.flatMap((id) => {
    const project = projects.find((candidate) => candidate.id === id);
    return project ? [project] : [];
  });
}

interface PortfolioProps {
  onNavigate?: NavigateFunction;
  onProjectDetailOpenChange?: (isOpen: boolean) => void;
}

export default function Portfolio({ onNavigate, onProjectDetailOpenChange }: PortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentChannel, setCurrentChannel] = useState<ChannelType>('demo');
  const backgroundRef = useRef<HTMLDivElement>(null);
  const softwareProjects = projectsById(softwareProjectIds);
  const gameDevelopmentProjects = projectsById(gameDevelopmentProjectIds);
  const additionalProjects = projects.filter((project) => !featuredProjectIds.includes(project.id));

  function openProject(project: Project) {
    setSelectedProject(project);
    onProjectDetailOpenChange?.(true);
  }

  function closeProject() {
    setSelectedProject(null);
    setCurrentChannel('demo');
    onProjectDetailOpenChange?.(false);
  }

  return (
    <div className="crt-page bg-page-tint w-full h-full overflow-y-auto text-crt-text">
      <div ref={backgroundRef} className="crt-content-container min-h-full">
        {/* Header */}
        <section className="space-y-4 px-2 pt-20 text-center sm:px-6">
          <ScrambleHeading className="pb-2 text-4xl font-display font-bold leading-tight tracking-wide text-white md:text-5xl">
            Project Gallery
          </ScrambleHeading>
        </section>

        <section id="software-and-ai" className="border-t border-crt-border-subtle px-2 pt-10 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-crt-accent">Software &amp; AI</p>
          <p className="mt-2 max-w-2xl text-sm text-crt-text-tertiary">
            Product, client, and hackathon work spanning field tools, social platforms, and applied AI systems.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-8 px-2 py-8 sm:px-6 md:grid-cols-2">
          {softwareProjects.map((project) => (
            <ProjectTV
              key={project.id}
              project={project}
              onClick={() => openProject(project)}
            />
          ))}
        </section>

        <section id="game-development" className="border-t border-crt-border-subtle px-2 pt-10 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-crt-accent">Game Development</p>
          <p className="mt-2 max-w-2xl text-sm text-crt-text-tertiary">
            Roblox games and gameplay systems built around multiplayer loops, progression, and responsive cross-platform controls.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-8 px-2 py-8 sm:px-6 md:grid-cols-2">
          {gameDevelopmentProjects.map((project) => (
            <ProjectTV
              key={project.id}
              project={project}
              onClick={() => openProject(project)}
            />
          ))}
        </section>

        <section className="border-t border-crt-border-subtle px-2 pt-10 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-crt-accent">Additional Projects</p>
          <p className="mt-2 max-w-2xl text-sm text-crt-text-tertiary">
            Experiments, coursework, client systems, and earlier builds that shaped the featured work above.
          </p>
        </section>

        <section className="px-2 py-8 sm:px-6">
          <div className="border-t border-crt-border">
            {additionalProjects.map((project) => (
              <AdditionalProjectRow
                key={project.id}
                project={project}
                onClick={() => openProject(project)}
              />
            ))}
          </div>
        </section>

        <footer className="px-2 py-10 text-center sm:px-6" aria-label="Project gallery navigation">
          <div className="flex flex-wrap justify-center gap-4">
            <CRTButton
              onClick={() => onNavigate?.('home')}
              variant="secondary"
            >
              Back to Home
            </CRTButton>
            <CRTButton
              onClick={() => onNavigate?.('contact')}
              variant="primary"
            >
              Get In Touch
            </CRTButton>
          </div>
        </footer>
      </div>

      {/* Project Detail Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailView
            key={selectedProject.id}
            project={selectedProject}
            currentChannel={currentChannel}
            onChannelChange={setCurrentChannel}
            onClose={closeProject}
            backgroundRef={backgroundRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
