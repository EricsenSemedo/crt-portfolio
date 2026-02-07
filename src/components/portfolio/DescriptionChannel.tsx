import { motion } from "framer-motion";
import type { Project } from "../../types";

interface DescriptionChannelProps {
  project: Project;
}

/**
 * DescriptionChannel - Project description tab with Problem/Solution/Impact cards.
 * Uses theme tokens for card backgrounds, borders, semantic colors, and text.
 */
export default function DescriptionChannel({ project }: DescriptionChannelProps) {
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
          <h2 className="text-3xl font-bold text-crt-accent mb-2">{project.title}</h2>
          <p className="text-crt-text-tertiary text-lg">{project.category}</p>
        </div>
        
        <div className="space-y-8">
          {/* Problem/Solution/Impact */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-crt-surface-primary/50 p-6 rounded-lg border border-crt-border">
              <h3 className="text-xl font-bold text-crt-danger mb-3">Problem</h3>
              <p className="text-crt-text-secondary">{project.detailedDescription.problem}</p>
            </div>
            
            <div className="bg-crt-surface-primary/50 p-6 rounded-lg border border-crt-border">
              <h3 className="text-xl font-bold text-crt-warning mb-3">Solution</h3>
              <p className="text-crt-text-secondary">{project.detailedDescription.solution}</p>
            </div>
            
            <div className="bg-crt-surface-primary/50 p-6 rounded-lg border border-crt-border">
              <h3 className="text-xl font-bold text-crt-success mb-3">Impact</h3>
              <p className="text-crt-text-secondary">{project.detailedDescription.impact}</p>
            </div>
          </div>
          
          {/* Key Highlights */}
          <div className="bg-crt-surface-primary/30 p-6 rounded-lg border border-crt-border">
            <h3 className="text-xl font-bold text-crt-accent mb-4">Key Highlights</h3>
            <ul className="space-y-2">
              {project.detailedDescription.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-crt-accent mr-3 mt-1">•</span>
                  <span className="text-crt-text-secondary">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Tech Stack */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-crt-accent mb-4">Technologies Used</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-crt-accent/20 text-crt-accent-hover rounded-lg border border-crt-accent/30"
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
