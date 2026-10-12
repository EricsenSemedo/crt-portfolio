import { useRef, useState } from "react";
import { browseMedia, channelNumber, type BrowseGroup } from "../../data/browse";
import type { Project } from "../../types";
import BrowseScreen from "./BrowseScreen";
import { usePosterColor, useSpotlight, useTouchOnly } from "./browseHooks";
import type { BrowseDirectionProps } from "./types";

function ShelfCard({ project, active, onActive, onOpen, spotlightRef }: {
  project: Project;
  active: boolean;
  onActive: (active: boolean) => void;
  onOpen: BrowseDirectionProps["onOpen"];
  spotlightRef: (element: Element | null) => void;
}) {
  const glow = usePosterColor(browseMedia(project)?.poster);

  return (
    <li ref={spotlightRef} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[31%]">
      <button
        type="button"
        onClick={(event) => onOpen(project, event.currentTarget.querySelector("[data-crt-screen]"))}
        onPointerEnter={() => onActive(true)}
        onPointerLeave={() => onActive(false)}
        onFocus={() => onActive(true)}
        onBlur={() => onActive(false)}
        className="group block w-full text-left focus:outline-none"
      >
        <BrowseScreen
          project={project}
          active={active}
          className={"aspect-[16/10] rounded-md border border-crt-border-subtle transition-[transform,box-shadow,border-color] duration-200 ease-out "
            + (active ? "-translate-y-1 scale-[1.02] border-crt-border-secondary" : "")}
          style={{ boxShadow: active && glow ? `0 14px 40px -6px rgb(${glow} / 0.45)` : undefined }}
        >
          {/* A lower third slides up over the picture while it plays. */}
          <div
            className={"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10 transition-[opacity,transform] duration-200 "
              + (active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}
          >
            <p className="line-clamp-2 text-sm leading-snug text-crt-text-secondary">{project.description}</p>
          </div>
        </BrowseScreen>
        <span className="mt-3 flex items-baseline justify-between gap-3">
          <span className={"font-display text-lg font-bold tracking-wide transition-colors " + (active ? "text-crt-accent-text" : "text-crt-text")}>
            {project.title}
          </span>
          <span className="shrink-0 font-mono text-xs text-crt-text-tertiary">CH {channelNumber(project)}</span>
        </span>
        <span className="block font-mono text-xs text-crt-text-tertiary">{project.category}</span>
      </button>
    </li>
  );
}

function Shelf({ group, activeId, setActiveId, onOpen, register }: {
  group: BrowseGroup;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onOpen: BrowseDirectionProps["onOpen"];
  register: (id: string) => (element: Element | null) => void;
}) {
  const trackRef = useRef<HTMLUListElement>(null);

  function page(direction: 1 | -1) {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <section className="relative pt-10" aria-labelledby={`shelf-${group.id}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id={`shelf-${group.id}`} data-enter="heading" className="font-display text-2xl font-bold tracking-wide text-crt-text">
          {group.title} <span className="ml-1 font-mono text-sm font-normal text-crt-text-tertiary">{group.projects.length}</span>
        </h2>
        <div className="hidden gap-2 sm:flex">
          {([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => page(direction)}
              aria-label={direction < 0 ? `Previous ${group.title}` : `More ${group.title}`}
              className="grid h-9 w-9 place-items-center border border-crt-border font-mono text-crt-text-secondary transition-colors hover:border-crt-accent hover:text-crt-accent-text"
            >
              {direction < 0 ? "‹" : "›"}
            </button>
          ))}
        </div>
      </div>
      <ul
        ref={trackRef}
        className="browse-shelf -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4 pt-2"
      >
        {group.projects.map((project) => (
          <ShelfCard
            key={project.id}
            project={project}
            active={activeId === project.id}
            onActive={(active) => setActiveId(active ? project.id : null)}
            onOpen={onOpen}
            spotlightRef={register(project.id)}
          />
        ))}
      </ul>
    </section>
  );
}

/** 1 · Shelves (Apple TV): a row per group that slides sideways, the hovered screen lifting and playing. */
export default function ShelvesDirection({ groups, onOpen }: BrowseDirectionProps) {
  const touchOnly = useTouchOnly();
  const { spotlightId, register } = useSpotlight(touchOnly);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = touchOnly ? spotlightId : hoveredId;

  return (
    <div>
      {groups.map((group) => (
        <Shelf key={group.id} group={group} activeId={activeId} setActiveId={setHoveredId} onOpen={onOpen} register={register} />
      ))}
    </div>
  );
}
