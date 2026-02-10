import { AnimatePresence } from "framer-motion";
import { useState } from "react";
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

  return (
    <div className="w-full h-full overflow-y-auto text-crt-text bg-crt-base">
      {/* Header */}
      <section className="text-center space-y-4 pt-8 px-6">
        <h1 className="text-4xl md:text-5xl font-display font-bold bg-linear-to-r from-crt-gradient-from to-crt-gradient-to bg-clip-text text-transparent leading-tight pb-2 tracking-wide">
          Project Gallery
        </h1>
        <p className="text-crt-text-tertiary max-w-2xl mx-auto">
          Browse through my project channels. Click any TV to tune in and explore the details.
        </p>
      </section>

      {/* TV Grid - Channel Browser Style */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 py-8">
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
