import { type KeyboardEvent, type PointerEvent } from "react";
import useDirectionalFill from "../../hooks/useDirectionalFill";
import useScrambleText from "../../hooks/useScrambleText";
import { type Project } from "../../types";

interface AdditionalProjectRowProps {
  project: Project;
  onClick: () => void;
}

export default function AdditionalProjectRow({ project, onClick }: AdditionalProjectRowProps) {
  const fill = useDirectionalFill<HTMLDivElement>("vertical");
  const title = useScrambleText(project.title);

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (fill.handlePointerEnter(event)) title.scramble();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onClick();
  }

  return (
    <div
      className="crt-scroll-reveal additional-project-row group relative cursor-pointer overflow-hidden border-b border-crt-border"
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={fill.handlePointerLeave}
      onFocus={(event) => {
        if (!event.currentTarget.matches(":focus-visible")) return;
        fill.handleFocus();
        title.scramble();
      }}
      onBlur={fill.handleBlur}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={"View " + project.title}
    >
      <span
        className={"absolute inset-0 bg-white transition-transform duration-200 ease-out "
          + (fill.fillOrigin === "top" ? "origin-top " : "origin-bottom ")
          + (fill.fillVisible ? "scale-y-100" : "scale-y-0")}
        aria-hidden="true"
      />
      <div className="additional-project-row__content relative z-10 grid gap-5 px-1 py-6 md:grid-cols-[minmax(0,0.8fr)_minmax(18rem,1.2fr)] md:items-center md:px-4">
        <div>
          <p className={"font-mono text-xs uppercase tracking-[0.2em] transition-colors " + (fill.fillVisible ? "text-[#444]" : "text-crt-text-tertiary")}>{project.category}</p>
          <h3 className={"mt-2 font-display text-2xl font-bold tracking-wide transition-colors md:text-3xl " + (fill.fillVisible ? "text-[#111]" : "text-crt-text")}>{title.visibleLabel}</h3>
        </div>
        <p className={"leading-relaxed transition-colors md:text-right " + (fill.fillVisible ? "text-[#222]" : "text-crt-text-secondary")}>{project.description}</p>
      </div>
    </div>
  );
}
