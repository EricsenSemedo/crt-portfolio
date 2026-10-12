import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { channelNumber } from "../../data/browse";
import type { Project } from "../../types";
import BrowseScreen from "./BrowseScreen";
import { useSpotlight, useTouchOnly } from "./browseHooks";
import type { BrowseDirectionProps } from "./types";

const FLOAT_WIDTH = 320;
// Keeps the floating screen clear of the category column on the right.
const RIGHT_COLUMN = 288;

/**
 * 5 · Index (Rauno Freiberg's Craft, editorial portfolios): a typographic list per group. A screen
 * floats beside the pointer and plays whichever title it's over; on phones each row carries its own
 * small screen, and the row nearest the middle plays.
 */
export default function IndexDirection({ groups, onOpen }: BrowseDirectionProps) {
  const reduceMotion = useReducedMotion();
  const touchOnly = useTouchOnly();
  const { spotlightId, register } = useSpotlight(touchOnly);
  const [hovered, setHovered] = useState<Project | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  // The floating screen eases toward the pointer, trailing it slightly like a picture on a string.
  useEffect(() => {
    if (!hovered || touchOnly) return;
    let frame = 0;
    function step() {
      const ease = reduceMotion ? 1 : 0.18;
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;
      if (floatRef.current) floatRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      frame = window.requestAnimationFrame(step);
    }
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [hovered, reduceMotion, touchOnly]);

  function follow(event: PointerEvent<HTMLDivElement>) {
    const list = listRef.current?.getBoundingClientRect();
    if (!list) return;
    const x = Math.min(event.clientX - list.left + 28, list.width - RIGHT_COLUMN - FLOAT_WIDTH);
    const y = event.clientY - list.top - FLOAT_WIDTH * 0.31;
    const firstMove = target.current.x === 0 && target.current.y === 0;
    target.current = { x, y };
    if (firstMove) current.current = { x, y };
  }

  return (
    <div ref={listRef} className="relative pt-4" onPointerMove={touchOnly ? undefined : follow}>
      {groups.map((group) => (
        <section key={group.id} className="relative pt-10" aria-labelledby={`index-${group.id}`}>
          <h2 id={`index-${group.id}`} data-enter="heading" className="mb-2 font-display text-2xl font-bold tracking-wide text-crt-text">
            {group.title}
          </h2>
          <ul className="border-t border-crt-border">
            {group.projects.map((project) => {
              const lit = touchOnly ? spotlightId === project.id : hovered?.id === project.id;
              return (
                <li key={project.id} ref={register(project.id)}>
                  <button
                    type="button"
                    onClick={(event) => onOpen(project, event.currentTarget.querySelector("[data-crt-screen]") ?? floatRef.current?.querySelector("[data-crt-screen]"))}
                    onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(project)}
                    onPointerLeave={() => setHovered(null)}
                    onFocus={(event) => event.currentTarget.matches(":focus-visible") && setHovered(project)}
                    onBlur={() => setHovered(null)}
                    className="group grid w-full grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 border-b border-crt-border-subtle py-3 text-left focus:outline-none focus-visible:bg-crt-surface-primary md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,16rem)] md:py-4"
                  >
                    {touchOnly ? (
                      <BrowseScreen project={project} active={lit} className="aspect-[16/10] w-24 rounded-sm" />
                    ) : (
                      <span className={"font-mono text-sm transition-colors " + (lit ? "text-crt-accent-text" : "text-crt-text-tertiary")}>
                        {channelNumber(project)}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span
                        className={"block font-display text-xl font-bold tracking-wide transition-[color,transform] duration-200 ease-out md:text-3xl "
                          + (lit ? "translate-x-1.5 text-crt-accent-text" : "text-crt-text")}
                      >
                        {project.title}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-crt-text-tertiary md:hidden">{project.category}</span>
                    </span>
                    <span className="hidden text-right font-mono text-sm text-crt-text-tertiary md:block">
                      {project.category}
                      <span className="block text-xs">{project.status}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {!touchOnly && (
        <div
          ref={floatRef}
          aria-hidden="true"
          className={"pointer-events-none absolute left-0 top-0 z-30 transition-opacity duration-150 " + (hovered ? "opacity-100" : "opacity-0")}
          style={{ width: FLOAT_WIDTH }}
        >
          {hovered && (
            <BrowseScreen
              key={hovered.id}
              project={hovered}
              active
              className="aspect-[16/10] border-[6px] border-crt-shell shadow-[0_20px_60px_rgb(0_0_0/0.7),0_0_40px_-8px_rgb(var(--crt-glow-accent)/0.45)]"
            />
          )}
        </div>
      )}
    </div>
  );
}
