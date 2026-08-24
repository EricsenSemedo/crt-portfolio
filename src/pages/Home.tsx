import CRTButton from "../components/CRTButton";
import ScrambleHeading from "../components/ScrambleHeading";
import projects from "../data/projects";
import type { NavigateFunction } from "../types";

interface HomeProps {
  onNavigate?: NavigateFunction;
}

const skills = [
  "Java", "Python", "C++", "C#", "JavaScript", "TypeScript", "Luau", "Go",
  "MySQL", "SQL", "PostgreSQL", "JDBC", "REST APIs", "Spring", "Spring Boot", "Spring Data JPA",
  "Maven", "Javalin", "JUnit", "Mockito", "Logback", "Git", "Docker", "Kubernetes", "AWS", "OpenTofu",
  "CI/CD", "Linux", "Hadoop", "Agile",
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="crt-page bg-page-tint w-full h-full overflow-y-auto text-crt-text">
      <div className="bg-page-tint min-h-full px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 pt-16 md:pt-20">
          <div className="space-y-2">
            <ScrambleHeading className="text-4xl font-display font-bold tracking-wide text-white md:text-6xl">
              Ericsen Semedo
            </ScrambleHeading>
            <h2 className="text-xl md:text-2xl text-crt-text-secondary font-light tracking-wide">
              Computer Science Graduate | Software Developer
            </h2>
          </div>
          <p className="text-crt-text-tertiary max-w-2xl mx-auto leading-relaxed">
            Computer science graduate and software developer working across cloud infrastructure,
            full-stack applications, AI systems, and games.
          </p>
        </section>

        {/* Skills Section */}
        <section className="space-y-6">
          <h3 className="text-2xl font-display font-semibold text-center text-crt-accent tracking-wide">Skills & Technologies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div key={skill} className="crt-scroll-reveal bg-crt-surface-primary/50 p-3 text-center border border-crt-border/50 hover:border-crt-accent/30 transition-colors">
                <span className="text-sm font-mono font-medium text-crt-text-secondary">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="space-y-4">
          <h3 className="text-2xl font-display font-semibold text-center text-crt-accent tracking-wide">Experience</h3>
          <div className="space-y-4">
            <div className="crt-scroll-reveal bg-crt-surface-primary/30 p-6 border border-crt-border/30">
              <h4 className="text-lg font-semibold text-crt-accent-hover mb-1">Java Intern - Revature</h4>
              <p className="mb-2 font-mono text-sm text-crt-accent">Pre-Employment Program | Back-end Developer</p>
              <p className="text-crt-text-tertiary text-sm mb-3">Jun 2026 - Aug 2026</p>
              <p className="text-crt-text-secondary leading-relaxed">
                Built functional REST APIs with Java, SQL, Spring, and test-driven development.
                Completed 108 coding activities and demonstrated proficiency through 14 evaluations.
              </p>
            </div>
            <div className="crt-scroll-reveal bg-crt-surface-primary/30 p-6 border border-crt-border/30">
              <h4 className="text-lg font-semibold text-crt-accent-hover mb-2">Infrastructure Engineer - PixelMux</h4>
              <p className="text-crt-text-tertiary text-sm mb-3">Jan 2025 - Dec 2025 | Remote</p>
              <p className="text-crt-text-secondary leading-relaxed">
                Designed granular IAM role architecture across multiple AWS accounts, implemented RBAC policies for secure collaboration,
                and developed CI/CD integration-testing pipelines for core infrastructure modules.
              </p>
            </div>
            <div className="crt-scroll-reveal bg-crt-surface-primary/30 p-6 border border-crt-border/30">
              <h4 className="text-lg font-semibold text-crt-accent-hover mb-2">Freelance Programmer - Fiverr</h4>
              <p className="text-crt-text-tertiary text-sm mb-3">Dec 2023 - Jan 2024 | Remote</p>
              <p className="text-crt-text-secondary leading-relaxed">
                Delivered Luau scripts for Roblox games, refactored reusable NPC and AI systems,
                added features, resolved bugs, and improved game performance.
              </p>
            </div>
          </div>
        </section>

        {/* Education & Stats */}
        <section className="space-y-4">
          <div className="crt-scroll-reveal bg-crt-surface-primary/30 p-6 border border-crt-border/30 text-center">
            <h4 className="text-lg font-display font-semibold text-crt-secondary mb-2 tracking-wide">Education</h4>
            <p className="text-crt-text-secondary">University of Rhode Island</p>
            <p className="text-crt-text-tertiary text-sm">Bachelor of Arts in Computer Science</p>
            <p className="text-crt-text-tertiary text-sm">Graduated: May 2025</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="crt-scroll-reveal text-center p-4 bg-crt-surface-primary/30 border border-crt-border/30">
              <div className="text-2xl font-display font-bold text-crt-accent">1+</div>
              <div className="text-sm text-crt-text-tertiary">Years Professional</div>
            </div>
            <div className="crt-scroll-reveal text-center p-4 bg-crt-surface-primary/30 border border-crt-border/30">
              <div className="text-2xl font-display font-bold text-crt-secondary">{projects.length}+</div>
              <div className="text-sm text-crt-text-tertiary">Projects Built</div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-4 pb-8">
          <h3 className="text-xl font-display font-semibold text-crt-text-secondary tracking-wide">Let's Build Something Amazing</h3>
          <p className="text-crt-text-tertiary">
            Ready to bring your ideas to life? Let's connect and discuss your next project.
          </p>
          <div className="flex justify-center space-x-4">
            <CRTButton 
              onClick={() => onNavigate?.('portfolio')}
              variant="primary"
            >
              View Portfolio
            </CRTButton>
            <CRTButton 
              onClick={() => onNavigate?.('contact')}
              variant="secondary"
            >
              Contact Me
            </CRTButton>
          </div>
        </section>
      </div>
    </div>
  );
}
