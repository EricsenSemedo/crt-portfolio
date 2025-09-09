import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import CRTButton from "../components/CRTButton";
import CRTScanlines from "../components/CRTScanlines";

export default function Portfolio({ onNavigate }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentChannel, setCurrentChannel] = useState('demo');

  // Your actual projects based on resume
  const projects = [
    {
      id: "maze-generator",
      title: "Maze Generator",
      category: "C++ / Algorithms",
      description: "Recursive backtracking maze generator with binary-encoded walls",
      tech: ["C++", "OOP", "Algorithms"],
      image: "/api/placeholder/300/200", // Replace with actual screenshots
      demo: {
        type: "video", // video, gif, or image
        src: "/api/placeholder/800/600", // Replace with actual demo
        alt: "Maze generator in action"
      },
      detailedDescription: {
        problem: "Needed to generate random mazes of different sizes",
        solution: "Built a C++ maze generator using iterative backtracking with stack-based approach",
        impact: "Can generate mazes of any specified dimensions (n×m)",
        highlights: [
          "Iterative backtracking algorithm using vector-based stack (histR/histC)",
          "4-bit binary encoding for wall states (N=8, S=4, E=2, W=1)",
          "Command-line interface accepting seed, dimensions, and output filename",
          "OOP design with maze class handling wall removal and visit tracking",
          "File I/O system writing space-separated decimal values per cell"
        ]
      }
    },
    {
      id: "zombies-game",
      title: "Zombies",
      category: "Python / Game Dev", 
      description: "Multiplayer game built with 10-member team using Python/Pygame",
      tech: ["Python", "Pygame", "Team Leadership"],
      image: "/api/placeholder/300/200",
      demo: {
        type: "video",
        src: "/api/placeholder/800/600",
        alt: "Zombies multiplayer gameplay"
      },
      detailedDescription: {
        problem: "Top-down wave-based zombie shooter built as collaborative learning project",
        solution: "Led 10-member team through full game development using Python/Pygame",
        impact: "Successfully delivered complete multiplayer game with modern development workflow",
        highlights: [
          "Led 10-member development team using agile practices",
          "Implemented inventory and weapon systems",
          "Built projectile and collision detection systems",
          "Coordinated team workflow and code integration"
        ]
      }
    },
    {
      id: "project-manager-pro",
      title: "Project Manager Pro",
      category: "Full Stack / Database",
      description: "Project management app with SQL database and web interface", 
      tech: ["SQL", "PHP", "HTML", "CSS"],
      image: "/api/placeholder/300/200",
      github: "https://github.com/EricsenSemedo/project_manager_pro",
      demo: {
        type: "video",
        src: "/api/placeholder/800/600",
        alt: "Project Manager Pro interface"
      },
      detailedDescription: {
        problem: "Need efficient project management tool for team collaboration",
        solution: "Built full-stack project management app with normalized database",
        impact: "Enabled 4-person team to track projects with performance-focused UI",
        highlights: [
          "3NF normalized database design for data integrity",
          "4-person collaborative development project",
          "Performance-focused UI/UX design",
          "Full-stack integration with SQL, PHP, HTML, CSS"
        ]
      }
    },
    {
      id: "roblox-ai-system",
      title: "Roblox AI System",
      category: "Lua / Game AI",
      description: "Reusable NPC/AI system using Simple Path library",
      tech: ["Lua", "Roblox Studio", "AI Logic"],
      image: "/api/placeholder/300/200",
      demo: {
        type: "video", 
        src: "/api/placeholder/800/600",
        alt: "Roblox AI system in action"
      },
      detailedDescription: {
        problem: "Create reusable AI system for multiple Roblox games",
        solution: "Developed modular NPC/AI system using Simple Path library",
        impact: "Delivered for 4+ games with top client reviews on Fiverr",
        highlights: [
          "Delivered Lua programming for 4+ Roblox games",
          "Refactored NPC/AI logic into reusable system",
          "Earned top client reviews on Fiverr platform",
          "Created 3 AI agents within one week using Simple Path"
        ]
      }
    }
  ];

  return (
    <div className="w-full h-full overflow-y-auto text-white bg-black">
      <AnimatePresence>
        {selectedProject ? (
          <ProjectDetailView
            key={selectedProject.id}
            project={selectedProject}
            currentChannel={currentChannel}
            onChannelChange={setCurrentChannel}
            onClose={() => {
              setSelectedProject(null);
              setCurrentChannel('demo');
            }}
          />
        ) : (
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
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </section>

            {/* Footer Navigation */}
            <section className="text-center space-y-4 pb-8">
              <div className="flex justify-center space-x-4">
                <CRTButton 
                  onClick={() => onNavigate?.('home')}
                  variant="secondary"
                >
                  Back to Home
                </CRTButton>
                <CRTButton 
                  onClick={() => onNavigate?.('contact')}
                  variant="primary"
                >
                  Get In Touch
                </CRTButton>
              </div>
            </section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual Project TV Component
function ProjectTV({ project, onClick }) {
  return (
    <motion.div 
      className="group relative cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layoutId={`project-${project.id}`}
    >
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
            <CRTScanlines opacity={0.15} lineHeight={3} lineSpacing={1} />
            {/* Screen curve effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900/10"></div>
          </div>
          
          {/* Hover Static Effect - using lighter scanlines that become more visible on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <CRTScanlines opacity={0.25} lineHeight={2} lineSpacing={1} />
          </div>
        </div>
        
        {/* TV Controls */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex space-x-2">
            <CRTButton
              variant="primary"
              size="sm"
              className="pointer-events-none"
            >
              Tune In
            </CRTButton>
          </div>
          
          {/* Channel Number */}
          <span className="text-gray-500 text-xs font-mono">
            CH {project.id.slice(-2).toUpperCase()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Full-screen Project Detail View with layoutId
function ProjectDetailView({ project, currentChannel, onChannelChange, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Animated TV Card - iOS App Store style */}
      <motion.div
        layoutId={`project-${project.id}`}
        className="absolute inset-4 bg-gray-800 rounded-lg p-4 border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/20 overflow-hidden"
        transition={{ 
          type: "spring", 
          damping: 15, 
          stiffness: 100,
          duration: 2.0 
        }}
      >
        {/* TV Screen Area */}
        <div className="relative bg-black rounded border border-gray-600 overflow-hidden h-full">
          
          {/* Channel Controls */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center"
          >
            <div className="flex space-x-2">
              <CRTButton
                onClick={() => onChannelChange('demo')}
                variant={currentChannel === 'demo' ? 'primary' : 'ghost'}
                size="sm"
              >
                Demo
              </CRTButton>
              <CRTButton
                onClick={() => onChannelChange('description')}
                variant={currentChannel === 'description' ? 'primary' : 'ghost'}
                size="sm"
              >
                Description
              </CRTButton>
            </div>
            
            <CRTButton
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              ✕
            </CRTButton>
          </motion.div>
          
          {/* Channel Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
            className="absolute inset-0 pt-16"
          >
            <AnimatePresence mode="wait">
              {currentChannel === 'demo' ? (
                <motion.div
                  key="demo"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <DemoChannel project={project} />
                </motion.div>
              ) : (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <DescriptionChannel project={project} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* CRT Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <CRTScanlines opacity={0.1} lineHeight={2} lineSpacing={1} />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900/5"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Demo Channel Component
function DemoChannel({ project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyan-400 mb-2">{project.title}</h2>
          <p className="text-gray-400 text-lg">{project.category}</p>
        </div>
        
        {/* Demo Media */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-6">
          {project.demo.type === 'video' ? (
            <video
              src={project.demo.src}
              alt={project.demo.alt}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : project.demo.type === 'gif' ? (
            <img
              src={project.demo.src}
              alt={project.demo.alt}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={project.demo.src}
              alt={project.demo.alt}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Overlay for placeholder */}
          {project.demo.src.includes('placeholder') && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-gray-400">Demo video coming soon</p>
                <p className="text-sm text-gray-500 mt-2">{project.demo.alt}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Tech Stack */}
        <div className="flex flex-wrap justify-center gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-cyan-400/20 text-cyan-300 text-sm rounded border border-cyan-400/30"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Description Channel Component
function DescriptionChannel({ project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyan-400 mb-2">{project.title}</h2>
          <p className="text-gray-400 text-lg">{project.category}</p>
        </div>
        
        <div className="space-y-8">
          {/* Problem/Solution/Impact */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-red-400 mb-3">Problem</h3>
              <p className="text-gray-300">{project.detailedDescription.problem}</p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">Solution</h3>
              <p className="text-gray-300">{project.detailedDescription.solution}</p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-green-400 mb-3">Impact</h3>
              <p className="text-gray-300">{project.detailedDescription.impact}</p>
            </div>
          </div>
          
          {/* Key Highlights */}
          <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Key Highlights</h3>
            <ul className="space-y-2">
              {project.detailedDescription.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-cyan-400 mr-3 mt-1">•</span>
                  <span className="text-gray-300">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Tech Stack */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Technologies Used</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-cyan-400/20 text-cyan-300 rounded-lg border border-cyan-400/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}