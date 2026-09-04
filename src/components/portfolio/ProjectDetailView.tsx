import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type RefObject } from "react";
import { useModalAccessibility } from "../../hooks/useModalAccessibility";
import type { Project } from "../../types";
import CRTButton from "../CRTButton";
import CRTIconButton from "../CRTIconButton";
import CRTScanlines from "../CRTScanlines";
import DemoChannel from "./DemoChannel";
import DescriptionChannel from "./DescriptionChannel";

type ChannelType = 'demo' | 'description';

interface ProjectDetailViewProps {
  project: Project;
  currentChannel: ChannelType;
  onChannelChange: (channel: ChannelType) => void;
  onClose?: () => void;
  backgroundRef?: RefObject<HTMLElement | null>;
}

/**
 * ProjectDetailView - Expanded project view as a full-screen CRT modal.
 * Uses theme tokens for backdrop, bezel, screen, and accent colors.
 */
export default function ProjectDetailView({
  project,
  currentChannel,
  onChannelChange,
  onClose,
  backgroundRef,
}: ProjectDetailViewProps) {
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
      {/* Fast center-expansion transition without spring or bounce motion. */}
      <motion.div
        className="absolute inset-4 bg-crt-surface-secondary rounded-lg p-4 border-2 border-crt-accent/50 shadow-lg shadow-crt-accent/20 overflow-hidden"
        initial={{ opacity: 0, scaleX: 0.18 }}
        animate={{ opacity: 1, scaleX: 1 }}
        exit={{ opacity: 0, scaleX: 0.18 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* TV Screen Area */}
        <div className="relative bg-crt-shell-screen rounded border border-crt-border-secondary overflow-hidden h-full">

          {/* Channel Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center"
          >
            <div className="flex space-x-2">
              <CRTButton
                onClick={() => onChannelChange('demo')}
                variant={currentChannel === 'demo' ? 'primary' : 'ghost'}
                size="sm"
              >
                Demo
              </CRTButton>
              <CRTButton
                onClick={() => onChannelChange('description')}
                variant={currentChannel === 'description' ? 'primary' : 'ghost'}
                size="sm"
              >
                Description
              </CRTButton>
            </div>

            <CRTIconButton
              onClick={onClose}
              className="h-10 w-10 shrink-0 p-0"
              label="Back to project gallery"
            >
              <svg className="block h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </CRTIconButton>
          </motion.div>

          {/* Channel Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
            className="absolute inset-0 overflow-hidden pt-16"
          >
            <AnimatePresence mode="wait">
              {currentChannel === 'demo' ? (
                <motion.div
                  key="demo"
                  className="h-full min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DemoChannel project={project} />
                </motion.div>
              ) : (
                <motion.div
                  key="description"
                  className="h-full min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DescriptionChannel project={project} />
                </motion.div>
              )}
            </AnimatePresence>
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
