import { motion } from "framer-motion";
import CRTButton from "../components/CRTButton";
import projects from "../data/projects";
import type { NavigateFunction } from "../types";

interface HomeProps {
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

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="w-full h-full overflow-y-auto bg-crt-base text-crt-text">
      <div className="min-h-full px-6 py-8 space-y-6 max-w-3xl mx-auto">

        {/* Terminal boot header */}
        <motion.section
          className="pt-6 space-y-3"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <div className="font-mono text-xs text-crt-text-muted tracking-wider uppercase">
            sys://user/profile <span className="inline-block w-1.5 h-3.5 bg-crt-accent ml-1 animate-pulse align-middle" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-display font-bold tracking-wide"
            style={{
              color: "rgb(var(--crt-accent-primary))",
              textShadow:
                "0 0 8px rgb(var(--crt-glow-accent) / calc(0.5 * var(--crt-glow-opacity))), 0 0 20px rgb(var(--crt-glow-accent) / calc(0.25 * var(--crt-glow-opacity)))",
            }}
          >
            Ericsen Semedo
          </h1>
          <p className="font-mono text-sm text-crt-text-secondary tracking-wide">
            Computer Science Graduate &middot; Software Developer
          </p>
          <p className="text-crt-text-tertiary leading-relaxed text-sm max-w-xl">
            Building innovative experiences in software and gaming.
            Recent CS graduate from University of Rhode Island passionate about creating
            cutting-edge solutions and immersive digital experiences.
          </p>
        </motion.section>

        <Divider />

        {/* Skills */}
        <motion.section
          className="space-y-3"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel label="Skills & Technologies" />
          <div className="grid grid-cols-3 gap-2">
            {[
              "Python", "Lua", "C/C++",
              "Java", "AWS", "OpenTofu",
              "Docker", "Git", "Roblox Studio",
            ].map((skill) => (
              <div
                key={skill}
                className="font-mono text-xs text-crt-text-secondary px-3 py-2 border border-crt-border-subtle rounded bg-crt-surface-primary/40 hover:border-crt-accent/40 transition-colors text-center"
              >
                {skill}
              </div>
            ))}
          </div>
        </motion.section>

        <Divider />

        {/* Experience */}
        <motion.section
          className="space-y-4"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel label="Experience" />

          <ExperienceEntry
            title="Infrastructure Engineer"
            org="PixelMux"
            period="Jan 2025 - Present"
            location="Remote"
            description="Designing IAM role architecture across multiple AWS accounts with granular permission boundaries. Developing RBAC strategies and implementing integration testing frameworks for core infrastructure modules."
          />

          <ExperienceEntry
            title="Freelance Programmer"
            org="Fiverr"
            period="Dec 2023 - Jan 2024"
            location="Remote"
            description="Delivered Lua programming for 4 Roblox games with top reviews. Refactored NPC/AI logic using Simple Path library and optimized game functionality through efficient scripting."
          />
        </motion.section>

        <Divider />

        {/* Education & Stats */}
        <motion.section
          className="space-y-4"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel label="Education" />
          <div className="border border-crt-border-subtle rounded-lg p-4 bg-crt-surface-primary/30 space-y-1">
            <p className="font-mono text-sm text-crt-text-secondary">University of Rhode Island</p>
            <p className="font-mono text-xs text-crt-text-tertiary">B.A. Computer Science &middot; May 2025</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatBlock value="1+" label="Years Professional" accent="primary" />
            <StatBlock value={`${projects.length}+`} label="Projects Built" accent="secondary" />
          </div>
        </motion.section>

        <Divider />

        {/* CTA */}
        <motion.section
          className="text-center space-y-3 pb-8"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <p className="font-mono text-xs text-crt-text-muted tracking-wider uppercase">
            &gt; ready to connect?
          </p>
          <div className="flex justify-center gap-3">
            <CRTButton onClick={() => onNavigate?.("portfolio")} variant="primary">
              View Portfolio
            </CRTButton>
            <CRTButton onClick={() => onNavigate?.("contact")} variant="secondary">
              Contact Me
            </CRTButton>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

/* ── Reusable sub-components ── */

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

interface ExperienceEntryProps {
  title: string;
  org: string;
  period: string;
  location: string;
  description: string;
}

function ExperienceEntry({ title, org, period, location, description }: ExperienceEntryProps) {
  return (
    <div className="border border-crt-border-subtle rounded-lg p-4 bg-crt-surface-primary/30 space-y-2">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h4 className="font-mono text-sm font-semibold text-crt-accent-hover">
          {title} <span className="text-crt-text-muted font-normal">@ {org}</span>
        </h4>
        <span className="font-mono text-[11px] text-crt-text-muted whitespace-nowrap">
          {period} &middot; {location}
        </span>
      </div>
      <p className="text-crt-text-tertiary text-sm leading-relaxed">{description}</p>
    </div>
  );
}

interface StatBlockProps {
  value: string;
  label: string;
  accent: "primary" | "secondary";
}

function StatBlock({ value, label, accent }: StatBlockProps) {
  const color = accent === "primary" ? "--crt-accent-primary" : "--crt-accent-secondary";
  return (
    <div className="text-center p-3 border border-crt-border-subtle rounded-lg bg-crt-surface-primary/30">
      <div
        className="text-2xl font-display font-bold"
        style={{
          color: `rgb(var(${color}))`,
          textShadow: `0 0 8px rgb(var(${color}) / calc(0.4 * var(--crt-glow-opacity)))`,
        }}
      >
        {value}
      </div>
      <div className="text-[11px] font-mono text-crt-text-muted mt-0.5">{label}</div>
    </div>
  );
}
