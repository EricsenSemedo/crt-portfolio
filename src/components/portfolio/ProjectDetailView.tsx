import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type RefObject } from "react";
import { useModalAccessibility } from "../../hooks/useModalAccessibility";
import type { Project } from "../../types";
import ChannelFlip from "../ChannelFlip";
import CRTIconButton from "../CRTIconButton";
import CRTScanlines from "../CRTScanlines";
import ProjectChannel from "./ProjectChannel";

interface ProjectDetailViewProps {
  project: Project;
  /** Ordered channel lineup; the project's place in it gives its number and neighbours. */
  lineup: Project[];
  onOpenProject: (project: Project) => void;
  onContact?: () => void;
  onClose?: () => void;
  /** A gallery screen is flying in, so the panel fades instead of expanding. */
  carried?: boolean;
  backgroundRef?: RefObject<HTMLElement | null>;
}

function channelNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

/**
 * ProjectDetailView - Expanded project view as a full-screen CRT modal.
 * Uses theme tokens for backdrop, bezel, screen, and accent colors.
 */
export default function ProjectDetailView({
  project,
  lineup,
  onOpenProject,
  onContact,
  onClose,
  carried = false,
  backgroundRef,
}: ProjectDetailViewProps) {
  const reduceMotion = useReducedMotion();
  const index = Math.max(0, lineup.findIndex((item) => item.id === project.id));
  const previousProject = lineup[(index - 1 + lineup.length) % lineup.length];
  const nextProject = lineup[(index + 1) % lineup.length];
  // AnimatePresence passes `custom` on exit, so a screen carried back to its card closes with a fade too.
  const panelVariants = {
    hidden: (carry: boolean) => ({ opacity: 0, scaleX: reduceMotion || carry ? 1 : 0.18 }),
    shown: { opacity: 1, scaleX: 1 },
  };
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: true,
    dialogRef,
    backgroundRef,
    onClose,
  });

  // Lock body scroll when project detail is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-crt-base/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      tabIndex={-1}
    >
      {/* Fast center-expansion without spring or bounce; a fade when a screen is carried in or out. */}
      <motion.div
        className="absolute inset-2 bg-crt-surface-secondary rounded-lg p-2 sm:inset-4 sm:p-4 border-2 border-crt-accent/50 shadow-lg shadow-crt-accent/20 overflow-hidden"
        variants={panelVariants}
        custom={carried}
        initial="hidden"
        animate="shown"
        exit="hidden"
        transition={{ duration: carried ? 0.28 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* TV Screen Area */}
        <div className="relative bg-crt-shell-screen rounded border border-crt-border-secondary overflow-hidden h-full">

          {/* Channel Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="absolute top-0 left-0 right-0 z-10 flex h-16 items-center gap-1 sm:gap-2 border-b border-white/30 bg-crt-base"
          >
            <CRTIconButton
              onClick={onClose}
              variant="accent"
              text="Back"
              className="h-full shrink-0 px-2 sm:px-5"
              label="Back to project gallery"
            >
              <svg className="block h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </CRTIconButton>
            <p className="flex-1 truncate text-center font-mono text-sm text-crt-text-tertiary sm:text-base" aria-live="polite">
              <span className="text-crt-accent-text">CH {channelNumber(index)}</span>
              <span className="hidden sm:inline"> / {channelNumber(lineup.length - 1)}</span>
            </p>
            <div className="flex h-full shrink-0">
              {[{ label: "Previous", target: previousProject, path: "m15 18-6-6 6-6" }, { label: "Next", target: nextProject, path: "m9 6 6 6-6 6" }].map(({ label, target, path }) => (
                <CRTIconButton
                  key={label}
                  onClick={() => target && onOpenProject(target)}
                  variant="accent"
                  className="h-full px-3 sm:px-4"
                  label={`${label} channel: ${target?.title ?? ""}`}
                >
                  <svg className="block h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={path} strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                </CRTIconButton>
              ))}
            </div>
          </motion.div>

          {/* Channel Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: carried ? 0.08 : 0.2, duration: 0.2 }}
            className="absolute inset-0 overflow-hidden"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={project.id}
                className="absolute inset-0 pt-16"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-4%", scaleY: 1.06 }}
                animate={{ opacity: 1, y: "0%", scaleY: 1 }}
                exit={reduceMotion
                  ? { opacity: 0, transition: { duration: 0.01 } }
                  : { opacity: 0, scaleY: 0.97, transition: { duration: 0.1, ease: "easeIn" } }}
                transition={reduceMotion ? { duration: 0.01 } : { delay: 0.12, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectChannel
                  project={project}
                  nextProject={nextProject}
                  onNextProject={() => onOpenProject(nextProject)}
                  onContact={onContact}
                />
              </motion.div>
            </AnimatePresence>
            {!reduceMotion && (
              <ChannelFlip flipKey={project.id} number={channelNumber(index)} title={project.title} osdClassName="right-5 top-20 sm:right-8" />
            )}
          </motion.div>

          {/* CRT Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <CRTScanlines opacity={0.1} lineHeight={2} lineSpacing={1} />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-crt-surface-primary/5"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
