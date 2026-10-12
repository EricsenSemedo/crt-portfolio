import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import { ProjectDetailView, ProjectShelves } from "../components/portfolio";
import { browseGroups } from "../data/browse";
import type { NavigateFunction, Project } from "../types";

type ChannelType = 'demo' | 'description';

interface PortfolioProps {
  onNavigate?: NavigateFunction;
  selectedProject: Project | null;
  onOpenProject: (project: Project) => void;
  onCloseProject: () => void;
}

export default function Portfolio({ onNavigate, selectedProject, onOpenProject, onCloseProject }: PortfolioProps) {
  const [currentChannel, setCurrentChannel] = useState<ChannelType>('demo');
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Reset the local demo tab for a new route, including browser Back/Forward.
  const projectId = selectedProject?.id ?? null;
  const [previousProjectId, setPreviousProjectId] = useState(projectId);
  if (previousProjectId !== projectId) {
    setPreviousProjectId(projectId);
    setCurrentChannel('demo');
  }

  return (
    <div tabIndex={-1} className="crt-page bg-page-tint w-full h-full overflow-y-auto text-crt-text">
      <div ref={backgroundRef} className="crt-content-container min-h-full">
        {/* Header */}
        <section className="space-y-4 px-2 pt-20 text-center sm:px-6">
          <ScrambleHeading className="pb-2 text-4xl font-display font-bold leading-tight tracking-wide text-crt-text md:text-5xl">
            Project Gallery
          </ScrambleHeading>
          <nav className="flex flex-wrap justify-center gap-3" aria-label="Jump to project group">
            {browseGroups.map((group) => (
              <CRTButton
                key={group.id}
                variant="secondary"
                className="min-h-11"
                onClick={() => document.getElementById(group.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                {group.title}
              </CRTButton>
            ))}
          </nav>
        </section>

        <div className="mt-10 px-2 sm:px-6">
          <ProjectShelves groups={browseGroups} onOpen={onOpenProject} />
        </div>

        <footer className="px-2 py-10 text-center sm:px-6" aria-label="Project gallery navigation">
          <div className="flex flex-wrap justify-center gap-4">
            <CRTButton
              onClick={() => onNavigate?.('home')}
              variant="secondary"
            >
              Back to Profile
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
            onClose={onCloseProject}
            backgroundRef={backgroundRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
