import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { channelNumber } from "../../data/browse";
import type { Project } from "../../types";
import BrowseScreen from "./BrowseScreen";
import { useSpotlight, useTouchOnly } from "./browseHooks";
import type { BrowseDirectionProps } from "./types";

const PEEK_DELAY_MS = 260;

interface Peek {
  project: Project;
  side: "left" | "right";
}

/**
 * 3 · Store (Steam): every project shows at once in a wrapping grid per group. Resting on one opens
 * a peek card beside it with the clip, the one-liner and the stack, so you can judge it before clicking.
 */
export default function StoreDirection({ groups, onOpen }: BrowseDirectionProps) {
  const reduceMotion = useReducedMotion();
  const touchOnly = useTouchOnly();
  const { spotlightId, register } = useSpotlight(touchOnly);
  const [peek, setPeek] = useState<Peek | null>(null);
  const peekTimer = useRef(0);

  function peekSoon(project: Project, card: HTMLElement) {
    window.clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(() => {
      const rect = card.getBoundingClientRect();
      const page = card.closest(".crt-content-container")?.getBoundingClientRect();
      const roomRight = (page?.right ?? window.innerWidth) - rect.right;
      setPeek({ project, side: roomRight > 300 ? "right" : "left" });
    }, PEEK_DELAY_MS);
  }

  function endPeek() {
    window.clearTimeout(peekTimer.current);
    setPeek(null);
  }

  return (
    <div>
      {groups.map((group) => (
        <section key={group.id} className="relative pt-10" aria-labelledby={`store-${group.id}`}>
          <h2 id={`store-${group.id}`} data-enter="heading" className="mb-4 font-display text-2xl font-bold tracking-wide text-crt-text">
            {group.title}
          </h2>
          <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {group.projects.map((project) => {
              const peeking = peek?.project.id === project.id;
              return (
                <li key={project.id} ref={register(project.id)} className={"relative " + (peeking ? "z-30" : "")}>
                  <button
                    type="button"
                    onClick={(event) => onOpen(project, event.currentTarget.querySelector("[data-crt-screen]"))}
                    onPointerEnter={(event) => event.pointerType === "mouse" && peekSoon(project, event.currentTarget)}
                    onPointerLeave={endPeek}
                    onFocus={(event) => event.currentTarget.matches(":focus-visible") && peekSoon(project, event.currentTarget)}
                    onBlur={endPeek}
                    className={"group block w-full border bg-crt-surface-primary text-left transition-[border-color,background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-crt-accent "
                      + (peeking ? "border-crt-accent/70 bg-crt-surface-secondary" : "border-crt-border-subtle hover:border-crt-border-secondary")}
                  >
                    <BrowseScreen project={project} active={spotlightId === project.id} className="aspect-[16/10]" />
                    <span className="flex items-center justify-between gap-2 px-3 py-2.5">
                      <span className="truncate text-sm font-semibold text-crt-text md:text-base">{project.title}</span>
                      <span className="shrink-0 font-mono text-[0.7rem] text-crt-text-tertiary">CH {channelNumber(project)}</span>
                    </span>
                  </button>

                  <AnimatePresence>
                    {peeking && peek && (
                      <motion.aside
                        aria-hidden="true"
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: peek.side === "right" ? -8 : 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className={"pointer-events-none absolute top-0 hidden w-72 border border-crt-border-secondary bg-crt-elevated shadow-[0_18px_50px_rgb(0_0_0/0.6)] md:block "
                          + (peek.side === "right" ? "left-full ml-3" : "right-full mr-3")}
                      >
                        <BrowseScreen key={project.id} project={project} active className="aspect-[16/10]" />
                        <div className="p-4">
                          <p className="font-display text-lg font-bold tracking-wide text-crt-text">{project.title}</p>
                          <p className="font-mono text-xs text-crt-accent-text">{project.status}</p>
                          <p className="mt-2 text-sm leading-relaxed text-crt-text-secondary">{project.description}</p>
                          <ul className="mt-3 flex flex-wrap gap-1.5">
                            {project.tech.slice(0, 4).map((tech) => (
                              <li key={tech} className="bg-crt-surface-tertiary px-2 py-0.5 font-mono text-[0.7rem] text-crt-text-secondary">{tech}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.aside>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
