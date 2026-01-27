import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import CRTScanlines from "./CRTScanlines";
import CRTVignette from "./CRTVignette";
import Navbar from "./Navbar";

interface SelectedItem {
  id: string;
  title: string;
}

interface TVZoomOverlayProps {
  selectedItem: SelectedItem | null;
  onClose?: () => void;
  children?: ReactNode;
}

/**
 * TVZoomOverlay - True full-screen overlay that displays TV content with CRT effects
 */
export default function TVZoomOverlay({ selectedItem, onClose, children }: TVZoomOverlayProps) {
  // ========================================
  // State Management
  // ========================================
  const [showContent, setShowContent] = useState(false);
  const [sweepVisible, setSweepVisible] = useState(false);

  // ========================================
  // Event Handlers
  // ========================================
  
  /**
   * Handle keyboard events (Escape key to close)
   */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    
    if (selectedItem) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedItem, onClose]);

  /**
   * Handle content visibility and sweep animation timing
   */
  useEffect(() => {
    if (!selectedItem) {
      setShowContent(false);
      setSweepVisible(false);
      return;
    }
    
    // Reset states when new item selected via timers to avoid cascading renders
    const resetTimer = setTimeout(() => {
      setShowContent(false);
      setSweepVisible(false);
    }, 0);
    
    // Show content immediately (no static noise delay)
    const contentTimer = setTimeout(() => {
      setShowContent(true);
      setSweepVisible(true);
    }, 50);
    
    // Hide sweep after animation completes
    const sweepTimer = setTimeout(() => {
      setSweepVisible(false);
    }, 50 + 400);
    
    return () => {
      clearTimeout(resetTimer);
      clearTimeout(contentTimer);
      clearTimeout(sweepTimer);
    };
  }, [selectedItem]);

  return (
    <AnimatePresence>
      {selectedItem && (
        <motion.div 
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
        >
          {/* Full-screen content container with CRT effects */}
          <motion.div 
            className="w-full h-full bg-black relative overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* CRT Effects */}
            <CRTVignette intensity={0.3} innerRadius={40} />
            <CRTScanlines opacity={0.2} lineHeight={4} lineSpacing={2} />
            
            {/* Content */}
            <motion.div 
              className="relative w-full h-full" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }}
            >
                {/* Content phase - no static noise, direct transition */}
                {showContent && (
                  <div className="absolute inset-0">
                    {/* Navigation bar with title and close button */}
                    <Navbar title={selectedItem.title} onClose={onClose} />
                    
                    {/* Page content - initially blurry */}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        filter: sweepVisible ? "blur(2px) brightness(0.8)" : "none"
                      }}
                    >
                      {children}
                    </div>
                    
                    {/* Clear content revealed by sweep */}
                    {sweepVisible && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          clipPath: "inset(0 0 100% 0)",
                          animation: "revealClear 0.4s linear forwards"
                        }}
                      >
                        <div className="absolute inset-0">{children}</div>
                      </div>
                    )}
                    
                    {/* CRT sweep line */}
                    {sweepVisible && (
                      <div
                        className="pointer-events-none absolute inset-x-0 h-8 -top-8"
                        style={{
                          background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05), transparent)",
                          boxShadow: "0 0 20px rgba(255,255,255,0.3)",
                          mixBlendMode: "screen",
                          animation: "sweepLine 0.4s linear forwards",
                        }}
                      />
                    )}
                    
                    {/* Static noise overlay in unswept area */}
                    {sweepVisible && (
                      <div
                        className="pointer-events-none absolute inset-0 opacity-40"
                        style={{
                          background: `
                            repeating-linear-gradient(
                              0deg,
                              rgba(255,255,255,0.02) 0px,
                              rgba(0,0,0,0.02) 1px,
                              transparent 2px,
                              transparent 3px
                            ),
                            repeating-linear-gradient(
                              90deg,
                              rgba(255,255,255,0.01) 0px,
                              rgba(0,0,0,0.01) 1px,
                              transparent 2px,
                              transparent 4px
                            )
                          `,
                          clipPath: "inset(0 0 0% 0)",
                          animation: "hideNoise 0.4s linear forwards"
                        }}
                      />
                    )}
                    
                    {/* Animation keyframes */}
                    <style>{`
                      @keyframes sweepLine {
                        0% { transform: translateY(-150%); }
                        100% { transform: translateY(calc(100vh + 150%)); }
                      }
                      
                      @keyframes revealClear {
                        0% { clip-path: inset(0 0 100% 0); }
                        100% { clip-path: inset(0 0 0% 0); }
                      }
                      
                      @keyframes hideNoise {
                        0% { clip-path: inset(0% 0 0 0); }
                        100% { clip-path: inset(100% 0 0 0); }
                      }
                    `}</style>
                  </div>
                )}
              </motion.div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
