export default function Portfolio({ onNavigate }) {
  // Your actual projects based on resume
  const projects = [
    {
      id: "maze-generator",
      title: "Maze Generator",
      category: "C++ / Algorithms",
      description: "Recursive backtracking maze generator with binary-encoded walls",
      tech: ["C++", "OOP", "Algorithms"],
      image: "/api/placeholder/300/200", // Replace with actual screenshots
      github: "https://github.com/yourusername/maze-generator",
      demo: null,
      highlights: [
        "Recursive backtracking algorithm",
        "Binary-encoded wall states",
        "Modular file I/O system"
      ]
    },
    {
      id: "zombies-game",
      title: "Zombies",
      category: "Python / Game Dev",
      description: "Multiplayer game built with 10-member team using Python/Pygame",
      tech: ["Python", "Pygame", "Team Leadership"],
      image: "/api/placeholder/300/200",
      github: "https://github.com/yourusername/zombies-game",
      demo: null,
      highlights: [
        "Led 10-member development team",
        "Inventory & weapon systems",
        "Agile development practices"
      ]
    },
    {
      id: "project-manager-pro",
      title: "Project Manager Pro",
      category: "Full Stack / Database",
      description: "Project management app with SQL database and web interface",
      tech: ["SQL", "PHP", "HTML", "CSS"],
      image: "/api/placeholder/300/200",
      github: "https://github.com/yourusername/project-manager-pro",
      demo: "https://your-demo-link.com",
      highlights: [
        "3NF normalized database design",
        "4-person collaborative project",
        "Performance-focused UI/UX"
      ]
    },
    {
      id: "roblox-ai-system",
      title: "Roblox AI System",
      category: "Lua / Game AI",
      description: "Reusable NPC/AI system using Simple Path library",
      tech: ["Lua", "Roblox Studio", "AI Logic"],
      image: "/api/placeholder/300/200",
      github: null, // Client work
      demo: "https://roblox.com/games/your-game-id",
      highlights: [
        "Delivered for 4+ games",
        "Reusable AI agent system",
        "Top client reviews on Fiverr"
      ]
    }
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-black text-white">
      <div className="min-h-full px-6 py-8 space-y-8">
        
        {/* Header */}
        <section className="text-center space-y-4 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Project Gallery
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse through my project channels. Click any TV to tune in and explore the details.
          </p>
        </section>

        {/* TV Grid - Channel Browser Style */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <ProjectTV 
              key={project.id} 
              project={project} 
              onNavigate={onNavigate}
            />
          ))}
        </section>

        {/* Footer Navigation */}
        <section className="text-center space-y-4 pb-8">
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => onNavigate?.('home')}
              className="px-4 py-2 bg-transparent border border-gray-600 hover:border-gray-500 rounded-lg font-medium text-xs sm:text-base transition-colors"
            >
              Back to Home
            </button>
            <button 
              onClick={() => onNavigate?.('contact')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium text-xs sm:text-base transition-colors"
            >
              Get In Touch
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// Individual Project TV Component
function ProjectTV({ project, onNavigate }) {
  return (
    <div className="group relative">
      {/* CRT TV Bezel */}
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-400/20">
        
        {/* TV Screen */}
        <div className="relative bg-black rounded border border-gray-600 overflow-hidden aspect-[4/3]">
          
          {/* Screen Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            
            {/* Project Preview "Channel" */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 text-sm font-mono">{project.category}</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {project.title}
              </h3>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
            
            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-1">
              {project.tech.slice(0, 3).map((tech) => (
                <span 
                  key={tech} 
                  className="px-2 py-1 bg-gray-900/80 text-xs rounded border border-gray-600 text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          {/* CRT Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanlines */}
            <div className="absolute inset-0 bg-scanlines opacity-20"></div>
            {/* Screen curve effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900/10"></div>
          </div>
          
          {/* Hover Static Effect */}
          <div className="absolute inset-0 bg-static opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
        </div>
        
        {/* TV Controls/Links */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex space-x-2">
            {project.github && (
              <a 
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Code
              </a>
            )}
            {project.demo && (
              <a 
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-xs rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Demo
              </a>
            )}
          </div>
          
          {/* Channel Number */}
          <span className="text-gray-500 text-xs font-mono">
            CH {project.id.slice(-2).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}