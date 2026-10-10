import { useEffect, useRef, useState } from "react";
import type { Project } from "../../types";
import CRTButton from "../CRTButton";
import StaticNoise from "../StaticNoise";

interface NowShowingProps {
  projects: Project[];
  onWatch: (project: Project, source?: Element | null) => void;
}

// Each headline project holds the screen for this much scrolling, in screen heights.
const SCREENS_PER_PROJECT = 0.7;

/**
 * NowShowing - A pinned set that changes channel as you scroll, one headline project per channel.
 * The page releases once the last channel has played; the full gallery follows.
 */
export default function NowShowing({ projects, onWatch }: NowShowingProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = section?.closest<HTMLElement>(".crt-page");
    if (!section || !scroller) return;
    let frame = 0;

    function update() {
      frame = 0;
      if (!section || !scroller) return;
      const travel = section.offsetHeight - scroller.clientHeight;
      const progress = Math.min(1, Math.max(0, (scroller.scrollTop - section.offsetTop) / travel));
      const position = progress * projects.length;
      setIndex(Math.min(projects.length - 1, Math.floor(position)));
      // Within a channel, the picture slowly pushes in, and backs out when scrolling up.
      imageRef.current?.style.setProperty("--now-showing-push", (position % 1).toFixed(3));
    }

    function request() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    scroller.addEventListener("scroll", request, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", request);
      cancelAnimationFrame(frame);
    };
  }, [projects.length]);

  const project = projects[index];
  if (!project) return null;

  return (
    <section
      ref={sectionRef}
      className="now-showing relative"
      style={{ height: `${100 + projects.length * SCREENS_PER_PROJECT * 100}svh` }}
      aria-label="Now showing"
    >
      <div className="sticky top-0 flex h-[100svh] items-center px-2 pt-16 sm:px-6">
        <div className="grid w-full items-center gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(16rem,1fr)] md:gap-10">
          <button
            type="button"
            className="group relative aspect-video overflow-hidden border-2 border-crt-border bg-black text-left focus-visible:outline-2 focus-visible:outline-crt-accent-text"
            onClick={(event) => onWatch(project, event.currentTarget)}
            aria-label={"Watch the " + project.title + " demo"}
          >
            <img
              ref={imageRef}
              key={project.id}
              src={project.image}
              alt=""
              className="now-showing__image absolute inset-0 h-full w-full object-cover"
            />
            <div className="screen-carry__lines absolute inset-0" />
            <div key={"static-" + index} className="now-showing__static absolute inset-0 bg-black" aria-hidden="true">
              <StaticNoise intensity={8} />
            </div>
            <p className="channel-osd absolute right-4 top-3 font-mono text-2xl font-bold">
              CH {String(index + 1).padStart(2, "0")}
            </p>
          </button>

          <div key={project.id} className="now-showing__copy">
            <h2 className="font-display text-4xl font-bold leading-tight tracking-wide text-crt-text md:text-5xl">{project.title}</h2>
            <p className="mt-4 leading-relaxed text-crt-text-secondary">{project.description}</p>
            <CRTButton className="mt-6 min-h-11" variant="primary" onClick={() => onWatch(project, sectionRef.current?.querySelector("button"))}>Watch the demo</CRTButton>
            <ol className="mt-8 flex gap-2" aria-label="Channels">
              {projects.map((item, itemIndex) => (
                <li
                  key={item.id}
                  aria-current={itemIndex === index ? "true" : undefined}
                  className={"h-1.5 w-8 " + (itemIndex === index ? "bg-crt-accent-text" : "bg-crt-border")}
                >
                  <span className="sr-only">{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
