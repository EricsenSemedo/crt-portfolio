import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import CRTButton from "../components/CRTButton";
import { ProjectDetailView, ProjectTV } from "../components/portfolio";
import projects from "../data/projects";
import type { NavigateFunction, Project } from "../types";

type ChannelType = 'demo' | 'description';

const featuredProjectIds = [
  "pullworth",
  "toonsync",
  "derma",
  "shadi",
  "dont-get-caught",
  "grow-your-plant",
];

interface PortfolioProps {
  onNavigate?: NavigateFunction;
}

export default function Portfolio({ onNavigate }: PortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentChannel, setCurrentChannel] = useState<ChannelType>('demo');
  const backgroundRef = useRef<HTMLDivElement>(null);
  const featuredProjects = featuredProjectIds.flatMap((id) => {
    const project = projects.find((candidate) => candidate.id === id);
    return project ? [project] : [];
  });
  const earlierProjects = projects.filter((project) => !featuredProjectIds.includes(project.id));

  return (
    <div className="crt-page bg-page-tint w-full h-full overflow-y-auto text-crt-text">
      <div ref={backgroundRef} className="bg-page-tint min-h-full">
        {/* Header */}
        <section className="text-center space-y-4 pt-20 px-6">
          <h1 className="pb-2 text-4xl font-display font-bold leading-tight tracking-wide text-white md:text-5xl">
            Project Gallery
          </h1>
          <p className="text-crt-text-tertiary max-w-2xl mx-auto">
            Browse through my project channels. Click any TV to tune in and explore the details.
          </p>
        </section>

        <section className="px-6 pt-10">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-crt-accent">Featured</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 py-8">
          {featuredProjects.map((project) => (
            <ProjectTV
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
              isSelected={selectedProject?.id === project.id}
            />
          ))}
        </section>

        <section className="border-t border-crt-border-subtle px-6 pt-10">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-crt-text-tertiary">Archive</p>
          <p className="mt-2 max-w-2xl text-sm text-crt-text-tertiary">
            Experiments, coursework, client systems, and earlier builds that shaped the featured work above.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 px-6 py-8 md:grid-cols-2 xl:grid-cols-3">
          {earlierProjects.map((project) => (
            <ProjectTV
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
              isSelected={selectedProject?.id === project.id}
            />
          ))}
        </section>

        {/* Footer Navigation */}
        <section className="text-center space-y-4 pb-8 px-6">
          <div className="flex justify-center space-x-4">
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
        </section>
      </div>

      {/* Project Detail Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailView
            key={selectedProject.id}
            project={selectedProject}
            currentChannel={currentChannel}
            onChannelChange={setCurrentChannel}
            onClose={() => {
              setSelectedProject(null);
              setCurrentChannel('demo');
            }}
            backgroundRef={backgroundRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
