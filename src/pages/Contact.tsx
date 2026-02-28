import { motion } from "framer-motion";
import CRTButton from "../components/CRTButton";
import type { NavigateFunction } from "../types";

interface ContactProps {
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

export default function Contact({ onNavigate }: ContactProps) {
  return (
    <div className="w-full h-full overflow-y-auto bg-crt-base text-crt-text">
      <div className="min-h-full px-6 py-8 space-y-6 max-w-3xl mx-auto">

        {/* Terminal header */}
        <motion.section
          className="pt-6 space-y-3"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <div className="font-mono text-xs text-crt-text-muted tracking-wider uppercase">
            sys://network/connect <span className="inline-block w-1.5 h-3.5 bg-crt-accent ml-1 animate-pulse align-middle" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-display font-bold tracking-wide"
            style={{
              color: "rgb(var(--crt-accent-primary))",
              textShadow:
                "0 0 8px rgb(var(--crt-glow-accent) / calc(0.5 * var(--crt-glow-opacity))), 0 0 20px rgb(var(--crt-glow-accent) / calc(0.25 * var(--crt-glow-opacity)))",
            }}
          >
            Let's Connect
          </h1>
          <p className="text-crt-text-tertiary leading-relaxed text-sm max-w-xl">
            Ready to collaborate, discuss opportunities, or just chat about technology?
            I'd love to hear from you.
          </p>
        </motion.section>

        <Divider />

        {/* Contact channels */}
        <motion.section
          className="space-y-3"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel label="Channels" />

          <div className="max-w-md mx-auto space-y-3">
            <ChannelLink
              href="https://linkedin.com/in/ericsen-semedo"
              label="LinkedIn"
              desc="Professional network & experience"
              icon={
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              }
              accentVar="--crt-accent-info"
            />

            <ChannelLink
              href="https://github.com/EricsenSemedo"
              label="GitHub"
              desc="Projects, code & contributions"
              icon={
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              }
              accentVar="--crt-accent-secondary"
            />
          </div>
        </motion.section>

        <Divider />

        {/* Status */}
        <motion.section
          className="space-y-3"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel label="Status" />
          <div className="max-w-md mx-auto border border-crt-border-subtle rounded-lg p-4 bg-crt-surface-primary/30 space-y-3">
            <StatusRow label="Availability" value="Open to opportunities" />
            <StatusRow label="Looking for" value="Full-time, freelance, collaboration" />
            <StatusRow label="Preferred contact" value="LinkedIn" />
          </div>
        </motion.section>

        <Divider />

        {/* CTA */}
        <motion.section
          className="text-center space-y-3 pb-8"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <p className="font-mono text-xs text-crt-text-muted tracking-wider uppercase">
            &gt; navigate
          </p>
          <div className="flex justify-center gap-3">
            <CRTButton onClick={() => onNavigate?.("home")} variant="secondary">
              Back to Home
            </CRTButton>
            <CRTButton onClick={() => onNavigate?.("portfolio")} variant="primary">
              View Portfolio
            </CRTButton>
          </div>
        </motion.section>
      </div>
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

interface ChannelLinkProps {
  href: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  accentVar: string;
}

function ChannelLink({ href, label, desc, icon, accentVar }: ChannelLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 border border-crt-border-subtle rounded-lg bg-crt-surface-primary/30 hover:bg-crt-surface-secondary/40 transition-all duration-200 group"
      style={{
        ["--ch-accent" as string]: `rgb(var(${accentVar}))`,
      }}
    >
      <svg
        className="w-7 h-7 flex-shrink-0 transition-colors"
        style={{ color: "var(--ch-accent)" }}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {icon}
      </svg>

      <div className="flex-1 min-w-0">
        <h4 className="font-mono text-sm font-semibold text-crt-text group-hover:text-crt-accent-hover transition-colors">
          {label}
        </h4>
        <p className="font-mono text-xs text-crt-text-muted truncate">{desc}</p>
      </div>

      <svg
        className="w-4 h-4 flex-shrink-0 text-crt-text-muted group-hover:text-crt-accent-hover transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-xs text-crt-text-muted shrink-0">{label}:</span>
      <span className="font-mono text-xs text-crt-text-secondary">{value}</span>
    </div>
  );
}
