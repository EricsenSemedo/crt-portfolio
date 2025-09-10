import { motion } from "framer-motion";
import CRTButton from "../CRTButton";
import CRTScanlines from "../CRTScanlines";

export default function ProjectTV({ project, onClick, isSelected }) {
  // Don't render the card if it's selected (it's now in the detail view)
  if (isSelected) return null;
  
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
                <div 
                  className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${(project.id.charCodeAt(0) % 5) * 0.5}s`,
                    animationDuration: `${1.5 + (project.id.charCodeAt(1) % 3) * 0.5}s`
                  }}
                ></div>
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
