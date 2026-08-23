import type { KeyboardEvent, PointerEvent } from "react";
import useDirectionalFill from "../../hooks/useDirectionalFill";
import useScrambleText from "../../hooks/useScrambleText";
import type { Project } from "../../types";
import CRTButton from "../CRTButton";
import CRTScanlines from "../CRTScanlines";

interface ProjectTVProps {
  project: Project;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * ProjectTV - Individual project card styled as a mini CRT TV.
 * Uses theme tokens for bezel, screen, and accent colors.
 */
export default function ProjectTV({ project, onClick, isSelected }: ProjectTVProps) {
  const fill = useDirectionalFill<HTMLDivElement>("all");
  const title = useScrambleText(project.title);

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    fill.handlePointerEnter(event);
    title.scramble();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onClick?.();
  }

  // Don't render the card if it's selected (it's now in the detail view)
  if (isSelected) return null;
  
  return (
    <div
      className="group relative cursor-pointer"
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={fill.handlePointerLeave}
      onFocus={() => { fill.handleFocus(); title.scramble(); }}
      onBlur={fill.handleBlur}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={"View " + project.title}
    >
      {/* CRT TV Bezel */}
      <div className="relative overflow-hidden rounded-lg border-2 border-crt-border bg-crt-surface-secondary p-4 transition-colors duration-200">
        <span className={"absolute inset-0 bg-white transition-transform duration-200 ease-out " + (
          fill.fillOrigin === "top" ? "origin-top " :
          fill.fillOrigin === "right" ? "origin-right " :
          fill.fillOrigin === "left" ? "origin-left " : "origin-bottom "
        ) + (fill.fillOrigin === "left" || fill.fillOrigin === "right"
          ? (fill.fillVisible ? "scale-x-100" : "scale-x-0")
          : (fill.fillVisible ? "scale-y-100" : "scale-y-0")
        )} aria-hidden="true" />
        <div className="relative z-10">
        
        {/* TV Screen */}
        <div className="relative bg-crt-shell-screen rounded border border-crt-border-secondary overflow-hidden aspect-[4/3]">
          
          {/* Screen Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            
            {/* Project Preview "Channel" */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-crt-accent text-sm font-mono">{project.category}</span>
                <div 
                  className="h-2 w-2 rounded-full bg-crt-success shadow-[0_0_10px_rgb(var(--crt-accent-success))]"
                ></div>
              </div>
              
              <h3 className="text-xl font-display font-bold text-crt-text transition-colors tracking-wide">
                {title.visibleLabel}
              </h3>
              
              <p className="text-crt-text-secondary text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
            
            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-1">
              {project.tech.slice(0, 3).map((tech) => (
                <span 
                  key={tech} 
                  className="px-2 py-1 bg-crt-surface-primary/80 text-xs font-mono rounded border border-crt-border-secondary text-crt-text-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          {/* CRT Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanlines */}
            <CRTScanlines opacity={0.15} lineHeight={3} lineSpacing={1} />
            {/* Screen curve effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-crt-surface-primary/10"></div>
          </div>
          
          {/* Hover Static Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <CRTScanlines opacity={0.25} lineHeight={2} lineSpacing={1} />
          </div>
        </div>
        
        {/* TV Controls */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex space-x-2">
            <CRTButton
              variant="primary"
              size="sm"
              className="pointer-events-none"
              tabIndex={-1}
            >
              Tune In
            </CRTButton>
          </div>
          
          {/* Channel Number */}
          <span className={"text-xs font-mono transition-colors " + (fill.fillVisible ? "text-[#333]" : "text-crt-text-muted")}>
            CH {project.id.slice(-2).toUpperCase()}
          </span>
        </div>
        </div>
      </div>
    </div>
  );
}
