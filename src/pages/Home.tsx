import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import projects from "../data/projects";
import type { NavigateFunction } from "../types";

interface HomeProps {
  onNavigate?: NavigateFunction;
}

const skills = [
  "Java", "Python", "C++", "C#", "JavaScript", "TypeScript", "Luau", "Go",
  "MySQL", "SQL", "PostgreSQL", "REST APIs", "Git", "Docker", "Kubernetes", "AWS", "OpenTofu",
  "CI/CD", "Linux", "Hadoop", "Agile",
];

const experience = [
  {
    title: "Infrastructure Engineer",
    company: "PixelMux",
    role: "Remote",
    dates: "Jan 2025 - Dec 2025",
    details: [
      "Designed granular IAM roles across multiple AWS accounts and implemented RBAC policies for secure collaboration.",
      "Developed CI/CD integration-testing pipelines for core infrastructure modules.",
    ],
  },
  {
    title: "Freelance Programmer",
    company: "Fiverr",
    role: "Remote",
    dates: "Dec 2023 - Jan 2024",
    details: [
      "Delivered Luau scripts for Roblox games and refactored reusable NPC and AI systems.",
      "Added features, resolved bugs, and improved game performance.",
    ],
  },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="crt-page bg-page-tint w-full h-full overflow-y-auto text-crt-text">
      <div className="crt-content-container min-h-full py-8">
        {/* Hero Section */}
        <section className="space-y-5 pb-12 pt-16 text-center md:pt-20">
          <div className="space-y-2">
            <ScrambleHeading className="text-4xl font-display font-bold tracking-wide text-white md:text-6xl">
              Ericsen Semedo
            </ScrambleHeading>
            <h2 className="text-xl md:text-2xl text-crt-text-secondary font-light tracking-wide">
              Computer Science Graduate | Software Developer
            </h2>
          </div>
          <p className="crt-reading-width mx-auto leading-relaxed text-crt-text-tertiary">
            Computer science graduate and software developer working across cloud infrastructure,
            full-stack applications, AI systems, and games.
          </p>
        </section>

        {/* Skills Section */}
        <section className="py-12">
          <h3 className="mb-7 text-center font-display text-2xl font-semibold tracking-wide text-crt-accent">Skills &amp; Technologies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3">
            {skills.map((skill, index) => (
              <div key={skill} className={"crt-scroll-reveal px-2 py-3 text-center" + (index < skills.length - 2 ? " border-b border-crt-border" : "") + (index === skills.length - 3 ? " md:border-b-0" : "")}>
                <span className="text-sm font-mono font-medium text-crt-text-secondary">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="pb-12">
          <h3 className="mb-7 text-center font-display text-2xl font-semibold tracking-wide text-crt-accent">Experience</h3>
          <div>
            {experience.map((item) => (
              <article key={item.title} className="grid gap-5 py-8 md:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)] md:gap-10">
                <div className="crt-scroll-reveal">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-crt-text-tertiary">{item.dates}</p>
                  <h4 className="mt-3 text-xl font-semibold text-crt-accent-hover">{item.title}</h4>
                  <p className="mt-1 text-crt-text-secondary">{item.company}</p>
                </div>
                <div className="space-y-4 md:pt-1">
                  <p className="crt-scroll-reveal font-mono text-sm text-crt-accent">{item.role}</p>
                  {item.details.map((detail) => (
                    <p key={detail} className="crt-scroll-reveal max-w-3xl leading-relaxed text-crt-text-secondary">{detail}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Education & Stats */}
        <section className="grid md:grid-cols-3">
          <div className="crt-scroll-reveal py-8 md:pr-8">
            <h4 className="font-display text-lg font-semibold tracking-wide text-crt-accent">Education</h4>
            <p className="mt-4 text-crt-text-secondary">University of Rhode Island</p>
            <p className="mt-1 text-sm text-crt-text-tertiary">Bachelor of Arts in Computer Science</p>
            <p className="mt-1 text-sm text-crt-text-tertiary">Graduated May 2025</p>
          </div>
          <div className="crt-scroll-reveal py-8 md:px-8">
            <div className="font-display text-3xl font-bold text-crt-accent">1+</div>
            <div className="mt-3 text-sm uppercase tracking-[0.16em] text-crt-text-tertiary">Years Professional</div>
          </div>
          <div className="crt-scroll-reveal py-8 md:pl-8">
            <div className="font-display text-3xl font-bold text-crt-secondary">{projects.length}+</div>
            <div className="mt-3 text-sm uppercase tracking-[0.16em] text-crt-text-tertiary">Projects Built</div>
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap justify-center gap-4 py-10" aria-label="Profile navigation">
          <CRTButton onClick={() => onNavigate?.('portfolio')} variant="primary">View Projects</CRTButton>
          <CRTButton onClick={() => onNavigate?.('contact')} variant="secondary">Contact Me</CRTButton>
        </footer>
      </div>
    </div>
  );
}
