import { useEffect, useMemo, useRef, useState } from "react";
import PanStage from "./components/PanStage";
import ParallaxBackground from "./components/ParallaxBackground";
import StaticNoise from "./components/StaticNoise";
import TVShell from "./components/TVShell";
import TVZoomOverlay from "./components/TVZoomOverlay";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";

/**
 * App - Main application component for CRT Portfolio
 * 
 * Features:
 * - Multiple clickable CRT TVs in overview mode
 * - Smooth zoom in/out animations between TVs
 * - Full-screen overlay for TV content display
 * - Navigation between TVs via CTA buttons
 * - Parallax background effect
 */

// ========================================
// Constants & Configuration
// ========================================

// TV layout positions (currently unused but kept for future positioning)
const SLOTS = [
  { id: 'home', title: 'HOME', cxPct: 25, cyPct: 55, wPct: 26 },
  { id: 'portfolio', title: 'PORTFOLIO', cxPct: 50, cyPct: 35, wPct: 28 },
  { id: 'contact', title: 'CONTACT', cxPct: 75, cyPct: 58, wPct: 24 },
];

export default function App() {
  // ========================================
  // State Management
  // ========================================
  
  // Main state for camera position and TV selection
  const [panState, setPanState] = useState({ 
    selectedId: null,    // Which TV is currently selected/zoomed
    scale: 1,            // Current zoom level
    isAnimating: false   // Whether camera is currently animating
  });
  
  // Tracks which TV to navigate to after zoom-out completes
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  // ========================================
  // Memoized Values & Refs
  // ========================================
  
  // TV configuration - memoized since it never changes
  const TVs = useMemo(() => ([
    { id: 'home', title: 'HOME', width: 340 },
    { id: 'portfolio', title: 'PORTFOLIO', width: 340 },
    { id: 'contact', title: 'CONTACT', width: 340 },
  ]), []);
  
  // Reference to PanStage component for imperative camera control
  const panRef = useRef(null);
  
  // ========================================
  // Navigation Logic
  // ========================================
  
  /**
   * Effect: Handle pending navigation after zoom-out completes
   * Watches for when animation completes and selectedId is null,
   * then automatically navigates to the pending target TV
   */
  useEffect(() => {
    if (pendingNavigation && 
        panState.selectedId === null && 
        !panState.isAnimating && 
        panRef.current) {
      // Zoom-out animation is complete, now navigate to target TV
      panRef.current.selectTV(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [panState.selectedId, panState.isAnimating, pendingNavigation]);
  
  /**
   * Function: Navigate between TVs with smooth animations
   * Handles both direct navigation and TV-to-TV transitions
   * 
   * @param {string} targetId - ID of the TV to navigate to
   */
  const navigateToTV = (targetId) => {
    // Guard clauses
    if (!panRef.current || targetId === panState.selectedId) return;
    
    if (panState.selectedId) {
      // Currently viewing a TV - need to zoom out first
      setPendingNavigation(targetId);
      panRef.current.reset();
    } else {
      // No TV selected - directly navigate to target
      panRef.current.selectTV(targetId);
    }
  };
  
  // ========================================
  // Page Content Mapping
  // ========================================
  
  // Maps TV IDs to their respective page components
  const byId = {
    home: <Home onNavigate={navigateToTV} />,
    portfolio: <Portfolio onNavigate={navigateToTV} />,
    contact: <Contact onNavigate={navigateToTV} />,
  };

  // ========================================
  // Render
  // ========================================
  
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Parallax background effect */}
      <ParallaxBackground panState={panState}>
        
        {/* Main TV selection stage with camera controls */}
        <PanStage 
          ref={panRef} 
          onStateChange={setPanState} 
          className="mx-auto min-h-screen flex items-center justify-center"
        >
          {TVs.map(tv => (
            <div 
              key={tv.id} 
              panId={tv.id} 
              className="aspect-square w-[clamp(12rem,24vw,20rem)]"
            >
              <TVShell className="w-full h-full cursor-pointer">
                <div className="h-full flex items-center justify-center">
                  <StaticNoise intensity={1} />
                  <div className="text-white font-semibold text-center text-sm sm:text-base">
                    {tv.title}
                  </div>
                </div>
              </TVShell>
            </div>
          ))}
        </PanStage>

        {/* Full-screen TV content overlay (shown when TV is selected and not animating) */}
        {panState.selectedId && !panState.isAnimating && (
          <TVZoomOverlay
            selectedItem={{
              id: panState.selectedId, 
              title: panState.selectedId.toUpperCase()
            }}
            onClose={() => panRef.current?.reset()}
          >
            {byId[panState.selectedId] ?? null}
          </TVZoomOverlay>
        )}
        
      </ParallaxBackground>
    </div>
  );
}