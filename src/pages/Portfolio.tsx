import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import CRTButton from "../components/CRTButton";
import { ProjectDetailView, ProjectTV } from "../components/portfolio";
import projects from "../data/projects";
import type { NavigateFunction, Project } from "../types";

type ChannelType = 'demo' | 'description';

interface PortfolioProps {
  onNavigate?: NavigateFunction;
}

export default function Portfolio({ onNavigate }: PortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentChannel, setCurrentChannel] = useState<ChannelType>('demo');
  const backgroundRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full h-full overflow-y-auto text-crt-text bg-crt-base">
      <div ref={backgroundRef}>
        {/* Header */}
        <section className="text-center space-y-4 pt-6 sm:pt-8 px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold bg-linear-to-r from-crt-gradient-from to-crt-gradient-to bg-clip-text text-transparent leading-tight pb-2 tracking-wide">
            Project Gallery
          </h1>
          <p className="text-sm sm:text-base text-crt-text-tertiary max-w-2xl mx-auto">
            Browse through my project channels. Click any TV to tune in and explore the details.
          </p>
        </section>

        {/* TV Grid - Channel Browser Style */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 py-6 sm:py-8">
          {projects.map((project) => (
            <ProjectTV
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
              isSelected={selectedProject?.id === project.id}
            />
          ))}
        </section>

        {/* Footer Navigation */}
        <section className="text-center space-y-4 pb-6 sm:pb-8 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
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
