import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import { ProjectDetailView, ProjectShelves } from "../components/portfolio";
import ScreenCarry, { type ScreenCarryFlight } from "../components/portfolio/ScreenCarry";
import { browseGroups, browseLineup, browseMedia } from "../data/browse";
import type { NavigateFunction, Project } from "../types";

function cardScreen(id: string) {
  return document.querySelector(`[data-crt-screen="${id}"]`);
}

function demoRect() {
  return document.querySelector("[data-carry-target]")?.getBoundingClientRect() ?? null;
}

function inView(rect: DOMRect | null | undefined): rect is DOMRect {
  return Boolean(rect && rect.bottom > 0 && rect.top < window.innerHeight);
}

interface PortfolioProps {
  onNavigate?: NavigateFunction;
  selectedProject: Project | null;
  onOpenProject: (project: Project) => void;
  onCloseProject: () => void;
}

export default function Portfolio({ onNavigate, selectedProject, onOpenProject, onCloseProject }: PortfolioProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [flight, setFlight] = useState<ScreenCarryFlight | null>(null);
  const flightKey = useRef(0);
  const endFlight = useCallback(() => setFlight(null), []);

  // The clicked screen carries into the project page, and back to its shelf on close.
  function openWithCarry(project: Project, screen: Element | null) {
    const src = browseMedia(project)?.poster;
    if (src && screen && !reduceMotion) {
      setFlight({ key: ++flightKey.current, src, from: () => screen.getBoundingClientRect(), to: demoRect, direction: "open" });
    }
    onOpenProject(project);
  }

  function closeWithCarry() {
    const src = selectedProject ? browseMedia(selectedProject)?.poster : undefined;
    const from = demoRect();
    // After flipping channels this is the card of the project now showing. Only carry it home
    // when both ends are on screen.
    const screen = selectedProject ? cardScreen(selectedProject.id) : null;
    if (src && inView(from) && inView(screen?.getBoundingClientRect()) && !reduceMotion) {
      setFlight({ key: ++flightKey.current, src, from: () => from, to: () => screen?.getBoundingClientRect() ?? null, direction: "close" });
    }
    onCloseProject();
  }

  return (
    <div tabIndex={-1} className="crt-page bg-page-tint w-full h-full overflow-y-auto text-crt-text">
      <div ref={backgroundRef} className="crt-content-container min-h-full">
        {/* Header */}
        <section className="space-y-4 px-2 pt-20 text-center sm:px-6">
          <ScrambleHeading className="pb-2 text-4xl font-display font-bold leading-tight tracking-wide text-crt-text md:text-5xl">
            Project Gallery
          </ScrambleHeading>
          <nav data-enter="copy" className="flex flex-wrap justify-center gap-3" aria-label="Jump to project group">
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
          <ProjectShelves groups={browseGroups} onOpen={openWithCarry} />
        </div>

        <footer data-enter="copy" className="px-2 py-10 text-center sm:px-6" aria-label="Project gallery navigation">
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
      <AnimatePresence custom={flight?.direction === "close"}>
        {selectedProject && (
          <ProjectDetailView
            key="project-detail"
            project={selectedProject}
            lineup={browseLineup}
            onOpenProject={onOpenProject}
            onContact={() => onNavigate?.("contact")}
            onClose={closeWithCarry}
            carried={flight?.direction === "open"}
            backgroundRef={backgroundRef}
          />
        )}
      </AnimatePresence>
      {flight && <ScreenCarry key={flight.key} flight={flight} onDone={endFlight} />}
    </div>
  );
}
