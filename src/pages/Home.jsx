export default function Home(){
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
              'React', 'TypeScript', 'Node.js', 
              'Python', 'JavaScript', 'Tailwind CSS',
              'Next.js', 'MongoDB', 'PostgreSQL'
            ].map((skill) => (
              <div key={skill} className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/50 hover:border-cyan-400/30 transition-colors">
                <span className="text-sm font-medium text-gray-300">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold text-center text-cyan-400">About Me</h3>
          <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-700/30">
            <p className="text-gray-300 leading-relaxed mb-4">
              I'm a passionate developer who loves creating intuitive and efficient web applications. 
              With a strong foundation in both frontend and backend technologies, I enjoy tackling 
              complex problems and turning ideas into reality.
            </p>
            <p className="text-gray-300 leading-relaxed">
              When I'm not coding, you can find me exploring new technologies, contributing to open source, 
              or working on personal projects that push the boundaries of what's possible on the web.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-cyan-400">2+</div>
            <div className="text-sm text-gray-400">Years Experience</div>
          </div>
          <div className="text-center p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-purple-400">3</div>
            <div className="text-sm text-gray-400">Projects Built</div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-4 pb-8">
          <h3 className="text-xl font-semibold text-gray-200">Let's Build Something Amazing</h3>
          <p className="text-gray-400">
            Ready to bring your ideas to life? Let's connect and discuss your next project.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition-colors">
              View Portfolio
            </button>
            <button className="px-6 py-2 bg-transparent border border-gray-600 hover:border-gray-500 rounded-lg font-medium transition-colors">
              Contact Me
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}


