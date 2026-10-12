import { useState } from "react";
import { browseMedia, channelNumber } from "../../data/browse";
import type { Project } from "../../types";
import StaticNoise from "../StaticNoise";
import BrowseScreen from "./BrowseScreen";
import { usePosterColor, useSpotlight, useTouchOnly } from "./browseHooks";
import type { BrowseDirectionProps } from "./types";

interface Filter {
  id: string;
  label: string;
  matches: (project: Project, groupId: string) => boolean;
}

function mentions(project: Project, pattern: RegExp) {
  return pattern.test(project.category) || project.tech.some((tech) => pattern.test(tech));
}

const FILTERS: Filter[] = [
  { id: "all", label: "Everything", matches: () => true },
  { id: "software", label: "Software & AI", matches: (_, groupId) => groupId === "software" },
  { id: "games", label: "Games", matches: (_, groupId) => groupId === "games" },
  { id: "client-websites", label: "Client websites", matches: (_, groupId) => groupId === "client-websites" },
  { id: "roblox", label: "Roblox", matches: (project) => mentions(project, /roblox|luau/i) },
  { id: "ai", label: "AI", matches: (project) => mentions(project, /\bai\b|vision|llm|ml/i) },
];

function WallScreen({ project, active, dimmed, onActive, onOpen, spotlightRef }: {
  project: Project;
  active: boolean;
  dimmed: boolean;
  onActive: (active: boolean) => void;
  onOpen: BrowseDirectionProps["onOpen"];
  spotlightRef: (element: Element | null) => void;
}) {
  const glow = usePosterColor(browseMedia(project)?.poster);

  return (
    <li ref={spotlightRef} className="relative">
      <button
        type="button"
        disabled={dimmed}
        onClick={(event) => onOpen(project, event.currentTarget.querySelector("[data-crt-screen]"))}
        onPointerEnter={() => onActive(true)}
        onPointerLeave={() => onActive(false)}
        onFocus={() => onActive(true)}
        onBlur={() => onActive(false)}
        className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-crt-accent disabled:cursor-default"
      >
        <BrowseScreen
          project={project}
          active={active && !dimmed}
          className={"aspect-[16/10] transition-[box-shadow,filter,opacity] duration-300 " + (dimmed ? "opacity-35 grayscale" : "")}
          style={{ boxShadow: active && !dimmed && glow ? `0 0 0 1px rgb(${glow} / 0.8), 0 0 42px 2px rgb(${glow} / 0.4)` : undefined }}
        >
          {/* A filtered-out set loses the signal instead of disappearing, so the wall never reshuffles. */}
          {dimmed && <StaticNoise intensity={3} />}
        </BrowseScreen>
        <span className={"mt-1.5 flex items-baseline justify-between gap-2 transition-opacity " + (dimmed ? "opacity-35" : "")}>
          <span className={"truncate text-sm transition-colors " + (active && !dimmed ? "text-crt-accent-text" : "text-crt-text")}>{project.title}</span>
          <span className="shrink-0 font-mono text-[0.7rem] text-crt-text-tertiary">CH {channelNumber(project)}</span>
        </span>
      </button>
    </li>
  );
}

/**
 * 4 · Wall (itch.io): every screen at once, small and dense, with tags across the top. Hovering plays
 * the clip and the set glows in its own artwork's colour; filtered-out sets drop to static in place.
 */
export default function WallDirection({ groups, onOpen }: BrowseDirectionProps) {
  const touchOnly = useTouchOnly();
  const { spotlightId, register } = useSpotlight(touchOnly);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("all");
  const filter = FILTERS.find((candidate) => candidate.id === filterId) ?? FILTERS[0];
  const activeId = touchOnly ? spotlightId : hoveredId;
  const sets = groups.flatMap((group) => group.projects.map((project) => ({ project, groupId: group.id })));
  const matchCount = sets.filter(({ project, groupId }) => filter.matches(project, groupId)).length;

  return (
    <div className="pt-8">
      <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter projects">
        {FILTERS.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            aria-pressed={candidate.id === filterId}
            onClick={() => setFilterId(candidate.id)}
            className={"min-h-9 border px-3 py-1 font-mono text-sm transition-colors "
              + (candidate.id === filterId
                ? "border-crt-accent bg-crt-accent text-crt-on-accent"
                : "border-crt-border text-crt-text-secondary hover:border-crt-border-secondary hover:text-crt-text")}
          >
            {candidate.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-crt-text-tertiary" aria-live="polite">{matchCount} on air</span>
      </div>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {sets.map(({ project, groupId }) => (
          <WallScreen
            key={project.id}
            project={project}
            active={activeId === project.id}
            dimmed={!filter.matches(project, groupId)}
            onActive={(active) => setHoveredId(active ? project.id : null)}
            onOpen={onOpen}
            spotlightRef={register(project.id)}
          />
        ))}
      </ul>
    </div>
  );
}
