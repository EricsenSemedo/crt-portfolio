import ScrambleHeading from "../components/ScrambleHeading";
import projects from "../data/projects";

const skills = [
  "Java", "Python", "C++", "C#", "JavaScript", "TypeScript", "Luau", "Go",
  "MySQL", "SQL", "PostgreSQL", "JDBC", "REST APIs", "Spring", "Spring Boot", "Spring Data JPA",
  "Maven", "Javalin", "JUnit", "Mockito", "Logback", "Git", "Docker", "Kubernetes", "AWS", "OpenTofu",
  "CI/CD", "Linux", "Hadoop", "Agile",
];

const experience = [
  {
    title: "Java Intern",
    company: "Revature",
    role: "Pre-Employment Program | Back-end Developer",
    dates: "Jun 2026 - Aug 2026",
    details: [
      "Built functional REST APIs with Java, SQL, Spring, and test-driven development.",
      "Completed 108 coding activities and demonstrated proficiency through 14 evaluations.",
    ],
  },
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

export default function Home() {
  return (
    <div className="crt-page bg-page-tint w-full h-full overflow-y-auto text-crt-text">
      <div className="bg-page-tint min-h-full px-5 py-8 sm:px-6">
        {/* Hero Section */}
        <section className="space-y-5 border-b border-crt-border pb-12 pt-16 text-center md:pt-20">
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
        <section className="py-12">
          <h3 className="mb-7 text-center font-display text-2xl font-semibold tracking-wide text-crt-accent">Skills &amp; Technologies</h3>
          <div className="grid grid-cols-2 border-t border-crt-border md:grid-cols-3">
            {skills.map((skill) => (
              <div key={skill} className="crt-scroll-reveal border-b border-crt-border px-2 py-3 text-center">
                <span className="text-sm font-mono font-medium text-crt-text-secondary">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="pb-12">
          <h3 className="mb-7 text-center font-display text-2xl font-semibold tracking-wide text-crt-accent">Experience</h3>
          <div className="border-t border-crt-border">
            {experience.map((item) => (
              <article key={item.title} className="grid gap-5 border-b border-crt-border py-8 md:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)] md:gap-10">
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
        <section className="grid border-y border-crt-border md:grid-cols-3">
          <div className="crt-scroll-reveal py-8 md:pr-8">
            <h4 className="font-display text-lg font-semibold tracking-wide text-crt-accent">Education</h4>
            <p className="mt-4 text-crt-text-secondary">University of Rhode Island</p>
            <p className="mt-1 text-sm text-crt-text-tertiary">Bachelor of Arts in Computer Science</p>
            <p className="mt-1 text-sm text-crt-text-tertiary">Graduated May 2025</p>
          </div>
          <div className="crt-scroll-reveal border-t border-crt-border py-8 md:border-l md:border-t-0 md:px-8">
            <div className="font-display text-3xl font-bold text-crt-accent">1+</div>
            <div className="mt-3 text-sm uppercase tracking-[0.16em] text-crt-text-tertiary">Years Professional</div>
          </div>
          <div className="crt-scroll-reveal border-t border-crt-border py-8 md:border-l md:border-t-0 md:pl-8">
            <div className="font-display text-3xl font-bold text-crt-secondary">{projects.length}+</div>
            <div className="mt-3 text-sm uppercase tracking-[0.16em] text-crt-text-tertiary">Projects Built</div>
          </div>
        </section>

        <div className="h-10" aria-hidden="true" />
      </div>
    </div>
  );
}
