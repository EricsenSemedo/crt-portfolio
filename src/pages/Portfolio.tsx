import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import { AdditionalProjectRow, ProjectDetailView, ProjectTV } from "../components/portfolio";
import NowShowing from "../components/portfolio/NowShowing";
import ScreenCarry, { type ScreenCarryFlight } from "../components/portfolio/ScreenCarry";
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
  "heros-quest",
  "physics-grab",
  "dont-get-caught",
  "grow-your-plant",
];

// Hiring managers for either track can skip straight to their group.
const projectGroups = [
  { id: "software-and-ai", label: "Software & AI" },
  { id: "game-development", label: "Game Development" },
];

const featuredProjectIds = [...softwareProjectIds, ...gameDevelopmentProjectIds];

// Prototype 2.0: one software and one game project per track lead the channel.
const headlineProjectIds = ["pullworth", "heros-quest", "toonsync", "physics-grab"];

function cardScreen(id: string) {
  return document.querySelector(`[data-crt-screen="${id}"]`);
}

function demoRect() {
  return document.querySelector("[data-carry-target]")?.getBoundingClientRect() ?? null;
}

function carryImage(project: Project) {
  return project.image && !/\.(webm|mp4)$/.test(project.image) ? project.image : null;
}

function projectsById(ids: string[]) {
  return ids.flatMap((id) => {
    const project = projects.find((candidate) => candidate.id === id);
    return project ? [project] : [];
  });
}

interface PortfolioProps {
  onNavigate?: NavigateFunction;
  selectedProject: Project | null;
  onOpenProject: (project: Project) => void;
  onCloseProject: () => void;
}

export default function Portfolio({ onNavigate, selectedProject, onOpenProject, onCloseProject }: PortfolioProps) {
  const [currentChannel, setCurrentChannel] = useState<ChannelType>('demo');
  const backgroundRef = useRef<HTMLDivElement>(null);
  const softwareProjects = projectsById(softwareProjectIds);
  const gameDevelopmentProjects = projectsById(gameDevelopmentProjectIds);
  const additionalProjects = projects.filter((project) => !featuredProjectIds.includes(project.id));

  // Reset the local demo tab for a new route, including browser Back/Forward.
  const projectId = selectedProject?.id ?? null;
  const [previousProjectId, setPreviousProjectId] = useState(projectId);
  if (previousProjectId !== projectId) {
    setPreviousProjectId(projectId);
    setCurrentChannel('demo');
  }

  const reduceMotion = useReducedMotion();
  const [flight, setFlight] = useState<ScreenCarryFlight | null>(null);
  const flightKey = useRef(0);
  const carrySource = useRef<Element | null>(null);
  const endFlight = useCallback(() => setFlight(null), []);

  // The clicked screen carries into the project page, and back into its card on close.
  function openWithCarry(project: Project, source?: Element | null) {
    const src = carryImage(project);
    const screen = source ?? cardScreen(project.id);
    carrySource.current = screen;
    if (src && !reduceMotion && screen) {
      setFlight({ key: ++flightKey.current, src, from: () => screen.getBoundingClientRect(), to: demoRect, direction: "open" });
    }
    onOpenProject(project);
  }

  function closeWithCarry() {
    const src = selectedProject ? carryImage(selectedProject) : null;
    const from = demoRect();
    if (selectedProject && src && from && !reduceMotion && currentChannel === "demo") {
      const screen = carrySource.current?.isConnected ? carrySource.current : cardScreen(selectedProject.id);
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
            {projectGroups.map((group) => (
              <CRTButton
                key={group.id}
                variant="secondary"
                className="min-h-11"
                onClick={() => document.getElementById(group.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                {group.label}
              </CRTButton>
            ))}
          </nav>
        </section>

        {!reduceMotion && <NowShowing projects={projectsById(headlineProjectIds)} onWatch={openWithCarry} />}

        <section id="software-and-ai" className="relative px-2 pt-10 sm:px-6">
          <span data-enter="rule" className="crt-rule" aria-hidden="true" />
          <h2 data-enter="heading" className="font-display text-2xl font-bold tracking-wide text-crt-text">Software &amp; AI</h2>
          <p data-enter="copy" className="mt-2 max-w-2xl text-sm text-crt-text-tertiary">
            Product, client, and hackathon work spanning field tools, social platforms, and applied AI systems.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-8 px-2 py-8 sm:px-6 md:grid-cols-2">
          {softwareProjects.map((project) => (
            <ProjectTV
              key={project.id}
              project={project}
              channel={featuredProjectIds.indexOf(project.id) + 1}
              onClick={() => openWithCarry(project)}
            />
          ))}
        </section>

        <section id="game-development" className="relative px-2 pt-10 sm:px-6">
          <span data-enter="rule" className="crt-rule" aria-hidden="true" />
          <h2 data-enter="heading" className="font-display text-2xl font-bold tracking-wide text-crt-text">Game Development</h2>
          <p data-enter="copy" className="mt-2 max-w-2xl text-sm text-crt-text-tertiary">
            Roblox games and gameplay systems built around arcade and multiplayer loops, progression, and responsive cross-platform controls.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-8 px-2 py-8 sm:px-6 md:grid-cols-2">
          {gameDevelopmentProjects.map((project) => (
            <ProjectTV
              key={project.id}
              project={project}
              channel={featuredProjectIds.indexOf(project.id) + 1}
              onClick={() => openWithCarry(project)}
            />
          ))}
        </section>

        <section className="relative px-2 pt-10 sm:px-6">
          <span data-enter="rule" className="crt-rule" aria-hidden="true" />
          <h2 data-enter="heading" className="font-display text-2xl font-bold tracking-wide text-crt-text">Additional Projects</h2>
          <p data-enter="copy" className="mt-2 max-w-2xl text-sm text-crt-text-tertiary">
            Experiments, coursework, client systems, and earlier builds that shaped the featured work above.
          </p>
        </section>

        <section className="px-2 py-8 sm:px-6">
          <div className="border-t border-crt-border">
            {additionalProjects.map((project) => (
              <AdditionalProjectRow
                key={project.id}
                project={project}
                onClick={() => openWithCarry(project)}
              />
            ))}
          </div>
        </section>

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
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailView
            key={selectedProject.id}
            project={selectedProject}
            currentChannel={currentChannel}
            onChannelChange={setCurrentChannel}
            onClose={closeWithCarry}
            backgroundRef={backgroundRef}
          />
        )}
      </AnimatePresence>
      {flight && <ScreenCarry key={flight.key} flight={flight} onDone={endFlight} />}
    </div>
  );
}
