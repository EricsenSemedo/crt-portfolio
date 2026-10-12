import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import BrowseDirections from "../components/browse/BrowseDirections";
import { ProjectDetailView } from "../components/portfolio";
import ScreenCarry, { type ScreenCarryFlight } from "../components/portfolio/ScreenCarry";
import { browseLineup, browseMedia } from "../data/browse";
import type { NavigateFunction, Project } from "../types";

function cardScreen(id: string) {
  return document.querySelector(`[data-crt-screen="${id}"]`);
}

function demoRect() {
  return document.querySelector("[data-carry-target]")?.getBoundingClientRect() ?? null;
}

function carryImage(project: Project) {
  return browseMedia(project)?.poster ?? null;
}

interface PortfolioProps {
  onNavigate?: NavigateFunction;
  selectedProject: Project | null;
  onOpenProject: (project: Project) => void;
  onCloseProject: () => void;
}

export default function Portfolio({ onNavigate, selectedProject, onOpenProject, onCloseProject }: PortfolioProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const lineup = browseLineup;

  const reduceMotion = useReducedMotion();
  const [flight, setFlight] = useState<ScreenCarryFlight | null>(null);
  const flightKey = useRef(0);
  const carrySource = useRef<{ id: string; element: Element } | null>(null);
  const endFlight = useCallback(() => setFlight(null), []);

  // The clicked screen carries into the project page, and back into its card on close.
  function openWithCarry(project: Project, source?: Element | null) {
    const src = carryImage(project);
    const screen = source ?? cardScreen(project.id);
    carrySource.current = screen ? { id: project.id, element: screen } : null;
    if (src && !reduceMotion && screen) {
      setFlight({ key: ++flightKey.current, src, from: () => screen.getBoundingClientRect(), to: demoRect, direction: "open" });
    }
    onOpenProject(project);
  }

  function closeWithCarry() {
    const src = selectedProject ? carryImage(selectedProject) : null;
    const from = demoRect();
    // Only carry the screen home when the demo is still on screen.
    const demoInView = from && from.bottom > 0 && from.top < window.innerHeight;
    if (selectedProject && src && from && demoInView && !reduceMotion) {
      // After flipping channels, the screen goes home to the card of the project now showing.
      const source = carrySource.current;
      const screen = source?.id === selectedProject.id && source.element.isConnected ? source.element : cardScreen(selectedProject.id);
      const home = screen?.getBoundingClientRect();
      if (home && home.bottom > 0 && home.top < window.innerHeight) {
        setFlight({ key: ++flightKey.current, src, from: () => from, to: () => screen?.getBoundingClientRect() ?? null, direction: "close" });
      }
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
        </section>

        <div className="px-2 sm:px-6">
          <BrowseDirections onOpen={openWithCarry} />
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
            lineup={lineup}
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
