import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import CRTButton from "../CRTButton";
import CRTScanlines from "../CRTScanlines";
import DemoChannel from "./DemoChannel";
import DescriptionChannel from "./DescriptionChannel";

export default function ProjectDetailView({ project, currentChannel, onChannelChange, onClose }) {
  // Lock body scroll when project detail is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Animated TV Card - iOS App Store style */}
      <motion.div
        layoutId={`project-${project.id}`}
        className="absolute inset-4 bg-gray-800 rounded-lg p-4 border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/20 overflow-hidden"
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 300
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
