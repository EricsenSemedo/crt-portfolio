import type { Project } from '../types';

// Centralized projects data used by Portfolio and Home pages
export const projects: Project[] = [
  {
    id: "maze-generator",
    title: "Maze Generator",
    category: "C++ / Algorithms",
    description: "Learning project: Recursive backtracking maze generator with binary-encoded walls",
    status: "Proof of Concept",
    tech: ["C++", "OOP", "Algorithms"],
    image: "/api/placeholder/300/200",
    demo: {
      type: "video",
      src: "/crt-portfolio/videos/maze-generator-demo.mp4",
      alt: "Maze generator in action",
    },
    detailedDescription: {
      problem: "Learning algorithmic thinking and data structure optimization",
      solution:
        "Explored C++ maze generation using iterative backtracking with stack-based approach",
      impact: "Gained deep understanding of recursive algorithms and binary encoding",
      highlights: [
        "Implemented iterative backtracking algorithm using vector-based stack (histR/histC)",
        "Designed 4-bit binary encoding system for wall states (N=8, S=4, E=2, W=1)",
        "Built command-line interface for testing different maze dimensions",
        "Applied OOP principles with maze class for wall removal and visit tracking",
        "Created file I/O system for maze export and visualization integration",
      ],
    },
  },
  {
    id: "zombies-game",
    title: "Zombies",
    category: "Python / Game Dev",
    description: "Learning project: Multiplayer game built with 10-member team using Python/Pygame",
    status: "Learning Experience",
    tech: ["Python", "Pygame", "Team Leadership"],
    image: "/api/placeholder/300/200",
    demo: {
      type: "video",
      src: "/crt-portfolio/videos/zombies-game-demo.mp4",
      alt: "Zombies multiplayer gameplay",
    },
    detailedDescription: {
      problem:
        "Learning game development and team collaboration through hands-on project",
      solution:
        "Led 10-member team through game development using Python/Pygame",
      impact:
        "Gained experience in team leadership, game architecture, and collaborative development",
      highlights: [
        "Led 10-member development team using agile practices",
        "Designed and implemented inventory and weapon systems",
        "Built projectile physics and collision detection systems",
        "Coordinated team workflow and learned code integration challenges",
      ],
    },
  },
  {
    id: "project-manager-pro",
    title: "Project Manager Pro",
    category: "Full Stack / Database",
    description: "Learning project: Project management app with SQL database and web interface",
    status: "Learning Experience",
    tech: ["SQL", "PHP", "HTML", "CSS"],
    image: "/api/placeholder/300/200",
    github: "https://github.com/EricsenSemedo/project_manager_pro",
    demo: {
      type: "video",
      src: "/crt-portfolio/videos/project-manager-pro-demo.mp4",
      alt: "Project Manager Pro interface",
    },
    detailedDescription: {
      problem: "Learning full-stack development and database design principles",
      solution:
        "Built project management app to explore SQL normalization and web development",
      impact:
        "Gained hands-on experience with database design, team collaboration, and full-stack integration",
      highlights: [
        "Designed 3NF normalized database schema for data integrity",
        "Collaborated with 4-person team on full-stack development",
        "Focused on performance and accessibility in UI/UX design",
        "Integrated SQL, PHP, HTML, and CSS in cohesive application",
      ],
    },
  },
  {
    id: "roblox-ai-system",
    title: "Roblox AI System",
    category: "Lua / Game AI",
    description: "Client project: Reusable NPC/AI system using Simple Path library",
    status: "Client Work",
    tech: ["Lua", "Roblox Studio", "AI Logic"],
    image: "/api/placeholder/300/200",
    demo: {
      type: "video",
      src: "/api/placeholder/800/600",
      alt: "Roblox AI system in action",
    },
    detailedDescription: {
      problem: "Create reusable AI system for multiple Roblox games",
      solution: "Developed modular NPC/AI system using Simple Path library",
      impact: "Delivered for 4+ games with top client reviews on Fiverr",
      highlights: [
        "Completed Lua programming projects for 4+ Roblox games",
        "Refactored NPC/AI logic into reusable, modular system",
        "Earned positive client feedback on Fiverr platform",
        "Rapidly prototyped 3 AI agents using Simple Path library",
      ],
    },
  },
];

export default projects;
