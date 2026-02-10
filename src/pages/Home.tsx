import CRTButton from "../components/CRTButton";
import projects from "../data/projects";
import type { NavigateFunction } from "../types";

interface HomeProps {
  onNavigate?: NavigateFunction;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="w-full h-full overflow-y-auto bg-crt-base text-crt-text">
      <div className="min-h-full px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 pt-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-display font-bold bg-linear-to-r from-crt-gradient-from to-crt-gradient-to bg-clip-text text-transparent tracking-wide">
              Ericsen Semedo
            </h1>
            <h2 className="text-xl md:text-2xl text-crt-text-secondary font-light tracking-wide">
              Computer Science Graduate | Software Developer
            </h2>
          </div>
          <p className="text-crt-text-tertiary max-w-2xl mx-auto leading-relaxed">
            Building innovative experiences in software and gaming. 
            Recent CS graduate from University of Rhode Island passionate about creating 
            cutting-edge solutions and immersive digital experiences.
          </p>
        </section>

        {/* Skills Section */}
        <section className="space-y-6">
          <h3 className="text-2xl font-display font-semibold text-center text-crt-accent tracking-wide">Skills & Technologies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Python', 'Lua', 'C/C++', 
              'Java', 'AWS', 'OpenTofu',
              'Docker', 'Git', 'Roblox Studio'
            ].map((skill) => (
              <div key={skill} className="bg-crt-surface-primary/50 rounded-lg p-3 text-center border border-crt-border/50 hover:border-crt-accent/30 transition-colors">
                <span className="text-sm font-mono font-medium text-crt-text-secondary">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="space-y-4">
          <h3 className="text-2xl font-display font-semibold text-center text-crt-accent tracking-wide">Experience</h3>
          <div className="space-y-4">
            <div className="bg-crt-surface-primary/30 rounded-lg p-6 border border-crt-border/30">
              <h4 className="text-lg font-semibold text-crt-accent-hover mb-2">Infrastructure Engineer - PixelMux</h4>
              <p className="text-crt-text-tertiary text-sm mb-3">Jan 2025 - Present | Remote</p>
              <p className="text-crt-text-secondary leading-relaxed">
                Designing IAM role architecture across multiple AWS accounts with granular permission boundaries. 
                Developing RBAC strategies and implementing integration testing frameworks for core infrastructure modules.
              </p>
            </div>
            <div className="bg-crt-surface-primary/30 rounded-lg p-6 border border-crt-border/30">
              <h4 className="text-lg font-semibold text-crt-accent-hover mb-2">Freelance Programmer - Fiverr</h4>
              <p className="text-crt-text-tertiary text-sm mb-3">Dec 2023 - Jan 2024 | Remote</p>
              <p className="text-crt-text-secondary leading-relaxed">
                Delivered Lua programming for 4 Roblox games with top reviews. Refactored NPC/AI logic 
                using Simple Path library and optimized game functionality through efficient scripting.
              </p>
            </div>
          </div>
        </section>

        {/* Education & Stats */}
        <section className="space-y-4">
          <div className="bg-crt-surface-primary/30 rounded-lg p-6 border border-crt-border/30 text-center">
            <h4 className="text-lg font-display font-semibold text-crt-secondary mb-2 tracking-wide">Education</h4>
            <p className="text-crt-text-secondary">University of Rhode Island</p>
            <p className="text-crt-text-tertiary text-sm">Bachelor of Arts in Computer Science</p>
            <p className="text-crt-text-tertiary text-sm">Graduated: May 2025</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-crt-surface-primary/30 rounded-lg border border-crt-border/30">
              <div className="text-2xl font-display font-bold text-crt-accent">1+</div>
              <div className="text-sm text-crt-text-tertiary">Years Professional</div>
            </div>
            <div className="text-center p-4 bg-crt-surface-primary/30 rounded-lg border border-crt-border/30">
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
