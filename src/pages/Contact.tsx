import CRTButton from "../components/CRTButton";
import type { NavigateFunction } from "../types";

interface ContactProps {
  onNavigate?: NavigateFunction;
}

export default function Contact({ onNavigate }: ContactProps) {
  return (
    <div className="w-full h-full overflow-y-auto bg-black text-white">
      <div className="min-h-full px-6 py-8 space-y-8">
        {/* Header */}
        <section className="text-center space-y-4 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Let's Connect
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Ready to collaborate, discuss opportunities, or just chat about technology? 
            I'd love to hear from you!
          </p>
        </section>

        {/* Contact Links */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-cyan-400">Get In Touch</h2>
          
          <div className="max-w-md mx-auto space-y-4">
            {/* LinkedIn */}
            <a 
              href="https://linkedin.com/in/ericsen-semedo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700/30 hover:border-blue-400/50 hover:bg-gray-800/40 transition-all duration-300 group"
            >
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  LinkedIn
                </h3>
                <p className="text-gray-400 text-sm">
                  Professional network & experience
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            {/* GitHub */}
            <a 
              href="https://github.com/EricsenSemedo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700/30 hover:border-purple-400/50 hover:bg-gray-800/40 transition-all duration-300 group"
            >
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  GitHub
                </h3>
                <p className="text-gray-400 text-sm">
                  Projects, code & contributions
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          </div>
        </section>

        {/* Professional Info */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-center text-cyan-400">Professional Focus</h3>
          <div className="max-w-md mx-auto bg-gray-900/30 rounded-lg p-6 border border-gray-700/30">
            <div className="text-center space-y-3">
              <div className="text-gray-300">
                <strong>Currently Open To:</strong>
                <div className="text-gray-400 mt-1">Full-time opportunities, freelance projects, collaboration</div>
              </div>
              <div className="text-gray-300">
                <strong>Preferred Contact:</strong>
                <div className="text-gray-400 mt-1">LinkedIn for professional inquiries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-4 pb-8">
          <h3 className="text-xl font-semibold text-gray-200">Ready to Start Something Great?</h3>
          <p className="text-gray-400 max-w-lg mx-auto">
            Whether you have a project in mind, want to discuss opportunities, 
            or just want to connect with a fellow developer, I'm always excited to meet new people.
          </p>
          <div className="flex justify-center space-x-4 pt-4">
            <CRTButton 
              onClick={() => onNavigate?.('home')}
              variant="secondary"
            >
              Back to Home
            </CRTButton>
            <div className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg font-medium text-xs sm:text-base text-white flex items-center">
              Let's build something amazing!
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
