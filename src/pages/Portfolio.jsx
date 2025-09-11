import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import CRTButton from "../components/CRTButton";
import { ProjectDetailView, ProjectTV } from "../components/portfolio";

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
        src: "/crt-portfolio/videos/maze-generator-demo.mp4", // Actual demo video
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
      {/* Header */}
      <section className="text-center space-y-4 pt-8 px-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent leading-tight pb-2">
          Project Gallery
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Browse through my project channels. Click any TV to tune in and explore the details.
        </p>
      </section>

      {/* TV Grid - Channel Browser Style */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 py-8">
        {projects.map((project) => (
          <ProjectTV 
            key={project.id} 
            project={project} 
            onClick={() => setSelectedProject(project)}
            isSelected={selectedProject?.id === project.id}
          />
        ))}
      </section>

      {/* Footer Navigation */}
      <section className="text-center space-y-4 pb-8 px-6">
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
      
      {/* Project Detail Overlay */}
      <AnimatePresence>
        {selectedProject && (
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
        )}
      </AnimatePresence>
    </div>
  );
}