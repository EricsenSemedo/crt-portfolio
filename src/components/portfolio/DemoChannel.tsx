import { motion } from "framer-motion";
import type { Project } from "../../types";

interface DemoChannelProps {
  project: Project;
}

export default function DemoChannel({ project }: DemoChannelProps) {
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
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="metadata"
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
          
          {/* Overlay for placeholder only */}
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
