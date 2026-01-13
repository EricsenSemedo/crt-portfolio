import CRTButton from "../components/CRTButton";
import projects from "../data/projects";
import type { NavigateFunction } from "../types";

interface HomeProps {
  onNavigate?: NavigateFunction;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="w-full h-full overflow-y-auto bg-black text-white">
      <div className="min-h-full px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 pt-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Ericsen Semedo
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-300 font-light">
              Computer Science Graduate | Software Developer
            </h2>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Building innovative experiences in software and gaming. 
            Recent CS graduate from University of Rhode Island passionate about creating 
            cutting-edge solutions and immersive digital experiences.
          </p>
        </section>

        {/* Skills Section */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-center text-cyan-400">Skills & Technologies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Python', 'Lua', 'C/C++', 
              'Java', 'AWS', 'OpenTofu',
              'Docker', 'Git', 'Roblox Studio'
            ].map((skill) => (
              <div key={skill} className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/50 hover:border-cyan-400/30 transition-colors">
                <span className="text-sm font-medium text-gray-300">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold text-center text-cyan-400">Experience</h3>
          <div className="space-y-4">
            <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/30">
              <h4 className="text-lg font-semibold text-cyan-300 mb-2">Infrastructure Engineer - PixelMux</h4>
              <p className="text-gray-400 text-sm mb-3">Jan 2025 - Present | Remote</p>
              <p className="text-gray-300 leading-relaxed">
                Designing IAM role architecture across multiple AWS accounts with granular permission boundaries. 
                Developing RBAC strategies and implementing integration testing frameworks for core infrastructure modules.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/30">
              <h4 className="text-lg font-semibold text-cyan-300 mb-2">Freelance Programmer - Fiverr</h4>
              <p className="text-gray-400 text-sm mb-3">Dec 2023 - Jan 2024 | Remote</p>
              <p className="text-gray-300 leading-relaxed">
                Delivered Lua programming for 4 Roblox games with top reviews. Refactored NPC/AI logic 
                using Simple Path library and optimized game functionality through efficient scripting.
              </p>
            </div>
          </div>
        </section>

        {/* Education & Stats */}
        <section className="space-y-4">
          <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/30 text-center">
            <h4 className="text-lg font-semibold text-purple-400 mb-2">Education</h4>
            <p className="text-gray-300">University of Rhode Island</p>
            <p className="text-gray-400 text-sm">Bachelor of Arts in Computer Science</p>
            <p className="text-gray-400 text-sm">Graduated: May 2025</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div className="text-2xl font-bold text-cyan-400">1+</div>
              <div className="text-sm text-gray-400">Years Professional</div>
            </div>
            <div className="text-center p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div className="text-2xl font-bold text-purple-400">{projects.length}+</div>
              <div className="text-sm text-gray-400">Projects Built</div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-4 pb-8">
          <h3 className="text-xl font-semibold text-gray-200">Let's Build Something Amazing</h3>
          <p className="text-gray-400">
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
