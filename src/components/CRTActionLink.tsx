import type { PointerEvent, ReactNode } from "react";
import useDirectionalFill from "../hooks/useDirectionalFill";
import useScrambleText from "../hooks/useScrambleText";

interface CRTActionLinkProps {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  primary?: boolean;
}

export default function CRTActionLink({ href, label, description, icon, primary = false }: CRTActionLinkProps) {
  const { visibleLabel, scramble } = useScrambleText(label);
  const fill = useDirectionalFill<HTMLAnchorElement>();

  function handlePointerEnter(event: PointerEvent<HTMLAnchorElement>) {
    if (fill.handlePointerEnter(event)) scramble();
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onPointerEnter={handlePointerEnter} onPointerLeave={fill.handlePointerLeave}
      onFocus={(event) => {
        if (!event.currentTarget.matches(":focus-visible")) return;
        fill.handleFocus();
        scramble();
      }} onBlur={fill.handleBlur}
      className="crt-action-shell group relative block overflow-hidden border border-crt-border-secondary bg-transparent p-4 font-mono focus:outline-none focus:ring-2 focus:ring-crt-accent/50">
      <span className={"absolute inset-0 bg-white transition-transform duration-200 ease-out " + (fill.fillOrigin === "top" ? "origin-top " : "origin-bottom ") + (fill.fillVisible ? "scale-y-100" : "scale-y-0")} aria-hidden="true" />
      <span className="crt-action-content relative z-10 flex w-full items-center gap-4">
        <span className={"shrink-0 transition-colors " + (fill.fillVisible ? "text-[#111]" : "text-crt-text")}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className={"flex items-center gap-2 text-lg font-semibold transition-colors " + (fill.fillVisible ? "text-[#111]" : "text-crt-text")}>
            {primary && <span className="h-2 w-2 rounded-full bg-[#00ff66] shadow-[0_0_10px_#00ff66]" aria-hidden="true" />}
            {visibleLabel}
          </span>
          <span className={"block text-sm transition-colors " + (fill.fillVisible ? "text-[#333]" : "text-crt-text-tertiary")}>{description}</span>
        </span>
        <svg className={"h-5 w-5 shrink-0 transition-colors " + (fill.fillVisible ? "text-[#111]" : "text-crt-text-tertiary")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </span>
    </a>
  );
}
