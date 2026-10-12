import { useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { browseLineup, channelNumber } from "../../data/browse";
import type { Project } from "../../types";
import ChannelFlip from "../ChannelFlip";
import CRTButton from "../CRTButton";
import BrowseScreen from "./BrowseScreen";
import { useTouchOnly } from "./browseHooks";
import type { BrowseDirectionProps } from "./types";

// Resting on a programme tunes the monitor; a short pause keeps a passing pointer from flipping every channel.
const TUNE_DELAY_MS = 140;

/**
 * 2 · Guide (Pluto TV): the monitor plays the tuned channel above a programme guide,
 * one row per group. Hover tunes, click watches; on phones the first tap tunes and the second watches.
 */
export default function GuideDirection({ groups, onOpen }: BrowseDirectionProps) {
  const reduceMotion = useReducedMotion();
  const touchOnly = useTouchOnly();
  const [tuned, setTuned] = useState<Project>(browseLineup[0]);
  const tuneTimer = useRef(0);
  const monitorRef = useRef<HTMLDivElement>(null);

  function tuneSoon(project: Project) {
    window.clearTimeout(tuneTimer.current);
    tuneTimer.current = window.setTimeout(() => setTuned(project), TUNE_DELAY_MS);
  }

  function choose(project: Project, cell: HTMLElement) {
    window.clearTimeout(tuneTimer.current);
    if (touchOnly && tuned.id !== project.id) {
      setTuned(project);
      return;
    }
    onOpen(project, project.id === tuned.id ? monitorRef.current?.querySelector("[data-crt-screen]") : cell.querySelector("[data-crt-screen]"));
  }

  return (
    <div className="pt-8">
      {/* On phones the monitor stays pinned while the guide scrolls beneath it. */}
      <div className="sticky top-0 z-20 -mx-2 bg-crt-base/95 px-2 pb-4 pt-2 backdrop-blur-sm md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(15rem,1fr)] md:gap-8">
          <div ref={monitorRef} data-enter="media" className="relative overflow-hidden border-[8px] border-crt-shell bg-black shadow-[0_0_0_1px_rgb(var(--crt-border-subtle)),0_0_60px_-10px_rgb(var(--crt-glow-accent)/0.35)] md:border-[10px]">
            <BrowseScreen key={tuned.id} project={tuned} active className="aspect-[16/10]" />
            {!reduceMotion && (
              <ChannelFlip flipKey={tuned.id} number={channelNumber(tuned)} title={tuned.title} osdClassName="right-3 top-2 text-xl! md:right-4 md:top-3 md:text-2xl!" />
            )}
          </div>
          <div aria-live="polite" className="flex flex-col">
            <div className="flex items-center justify-between gap-3 md:block">
              <h2 className="font-display text-xl font-bold tracking-wide text-crt-text md:text-3xl">{tuned.title}</h2>
              <p className="shrink-0 font-mono text-xs text-crt-text-tertiary md:mt-2 md:text-sm">{tuned.category}</p>
            </div>
            <p className="mt-3 hidden leading-relaxed text-crt-text-secondary md:block">{tuned.description}</p>
            <ul className="mt-4 hidden flex-wrap gap-2 md:flex">
              {tuned.tech.slice(0, 4).map((tech) => (
                <li key={tech} className="border border-crt-accent/30 bg-crt-accent/15 px-2 py-0.5 font-mono text-xs text-crt-accent-text">{tech}</li>
              ))}
            </ul>
            <CRTButton className="mt-3 self-start md:mt-6" onClick={() => onOpen(tuned, monitorRef.current?.querySelector("[data-crt-screen]"))}>
              Watch {tuned.title}
            </CRTButton>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-crt-border" role="list" aria-label="Programme guide">
        {groups.map((group) => (
          <div key={group.id} role="listitem" className="grid border-b border-crt-border-subtle md:grid-cols-[11rem_minmax(0,1fr)]">
            <h3 className="flex items-center gap-2 px-1 pb-1 pt-3 font-display text-base font-bold tracking-wide text-crt-text md:border-r md:border-crt-border-subtle md:px-4 md:py-3">
              {group.title}
            </h3>
            <ul className="browse-shelf flex gap-px overflow-x-auto py-2 md:flex-wrap md:overflow-visible">
              {group.projects.map((project) => {
                const isTuned = project.id === tuned.id;
                return (
                  <li key={project.id} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={isTuned}
                      onPointerEnter={(event) => event.pointerType === "mouse" && tuneSoon(project)}
                      onPointerLeave={() => window.clearTimeout(tuneTimer.current)}
                      onFocus={(event) => event.currentTarget.matches(":focus-visible") && setTuned(project)}
                      onClick={(event) => choose(project, event.currentTarget)}
                      className={"flex min-h-14 w-56 items-center gap-3 px-2 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crt-accent "
                        + (isTuned ? "bg-crt-surface-secondary shadow-[inset_3px_0_0_rgb(var(--crt-accent-primary))]" : "hover:bg-crt-surface-primary")}
                    >
                      <BrowseScreen project={project} active={false} className="aspect-[16/10] w-16 shrink-0 rounded-sm" />
                      <span className="min-w-0">
                        <span className={"block font-mono text-xs " + (isTuned ? "text-crt-accent-text" : "text-crt-text-tertiary")}>
                          CH {channelNumber(project)}{isTuned ? " · ON NOW" : ""}
                        </span>
                        <span className="block truncate text-sm text-crt-text">{project.title}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
