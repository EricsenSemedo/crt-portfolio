import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import CRTButton from "../components/CRTButton";
import { ProjectDetailView, ProjectTV } from "../components/portfolio";
import projects from "../data/projects";
import type { NavigateFunction, Project } from "../types";

type ChannelType = 'demo' | 'description';

interface PortfolioProps {
  onNavigate?: NavigateFunction;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" },
  }),
};

export default function Portfolio({ onNavigate }: PortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentChannel, setCurrentChannel] = useState<ChannelType>('demo');

  return (
    <div className="w-full h-full overflow-y-auto text-crt-text bg-crt-base">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Terminal header */}
        <motion.section
          className="pt-4 space-y-3"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <div className="font-mono text-xs text-crt-text-muted tracking-wider uppercase">
            sys://media/channels <span className="inline-block w-1.5 h-3.5 bg-crt-accent ml-1 animate-pulse align-middle" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-display font-bold tracking-wide"
            style={{
              color: "rgb(var(--crt-accent-primary))",
              textShadow:
                "0 0 8px rgb(var(--crt-glow-accent) / calc(0.5 * var(--crt-glow-opacity))), 0 0 20px rgb(var(--crt-glow-accent) / calc(0.25 * var(--crt-glow-opacity)))",
            }}
          >
            Project Gallery
          </h1>
          <p className="text-crt-text-tertiary text-sm max-w-xl">
            Browse through my project channels. Click any TV to tune in and explore the details.
          </p>
        </motion.section>

        <Divider />

        {/* TV Grid */}
        <motion.section
          className="space-y-3"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel label={`${projects.length} Channels Available`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectTV
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
                isSelected={selectedProject?.id === project.id}
              />
            ))}
          </div>
        </motion.section>

        <Divider />

        {/* Footer */}
        <motion.section
          className="text-center space-y-3 pb-8"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <p className="font-mono text-xs text-crt-text-muted tracking-wider uppercase">
            &gt; navigate
          </p>
          <div className="flex justify-center gap-3">
            <CRTButton onClick={() => onNavigate?.('home')} variant="secondary">
              Back to Home
            </CRTButton>
            <CRTButton onClick={() => onNavigate?.('contact')} variant="primary">
              Get In Touch
            </CRTButton>
          </div>
        </motion.section>
      </div>

      {/* Project Detail Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailView
            key={selectedProject.id}
            project={selectedProject}
            currentChannel={currentChannel}
            onChannelChange={setCurrentChannel}
            onClose={() => {
              setSelectedProject(null);
              setCurrentChannel('demo');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub-components ── */

function SectionLabel({ label }: { label: string }) {
  return (
    <h3
      className="font-display text-sm font-semibold tracking-widest uppercase"
      style={{
        color: "rgb(var(--crt-accent-primary))",
        textShadow: "0 0 6px rgb(var(--crt-glow-accent) / calc(0.3 * var(--crt-glow-opacity)))",
      }}
    >
      <span className="font-mono text-crt-text-muted mr-1.5">&gt;</span>
      {label}
    </h3>
  );
}

function Divider() {
  return (
    <div
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgb(var(--crt-accent-primary) / 0.25) 20%, rgb(var(--crt-accent-primary) / 0.25) 80%, transparent)",
      }}
    />
  );
}
