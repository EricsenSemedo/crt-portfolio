import { useEffect, useMemo, useRef, useState } from "react";
import PanStage, { type PanStageRef } from "./components/PanStage";
import ParallaxBackground from "./components/ParallaxBackground";
import StaticNoise from "./components/StaticNoise";
import ThemeToggle from "./components/ThemeToggle";
import TVShell from "./components/TVShell";
import TVZoomOverlay from "./components/TVZoomOverlay";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import type { PanState, TVConfig } from "./types";

/**
 * App - Main application component for CRT Portfolio
 */

export default function App() {
  // ========================================
  // State Management
  // ========================================
  
  const [panState, setPanState] = useState<PanState>({ 
    selectedId: null,
    scale: 1,
    isAnimating: false
  });
  
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // ========================================
  // Memoized Values & Refs
  // ========================================
  
  const TVs: TVConfig[] = useMemo(() => ([
    { id: 'home', title: 'HOME', width: 340 },
    { id: 'portfolio', title: 'PORTFOLIO', width: 340 },
    { id: 'contact', title: 'CONTACT', width: 340 },
  ]), []);
  
  const panRef = useRef<PanStageRef>(null);
  
  // ========================================
  // Navigation Logic
  // ========================================
  
  useEffect(() => {
    if (pendingNavigation && 
        panState.selectedId === null && 
        !panState.isAnimating && 
        panRef.current) {
      panRef.current.selectTV(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [panState.selectedId, panState.isAnimating, pendingNavigation]);
  
  const navigateToTV = (targetId: string) => {
    if (!panRef.current || targetId === panState.selectedId) return;
    
    if (panState.selectedId) {
      setPendingNavigation(targetId);
      panRef.current.reset();
    } else {
      panRef.current.selectTV(targetId);
    }
  };
  
  // ========================================
  // Page Content Mapping
  // ========================================
  
  const byId: Record<string, React.ReactNode> = {
    home: <Home onNavigate={navigateToTV} />,
    portfolio: <Portfolio onNavigate={navigateToTV} />,
    contact: <Contact onNavigate={navigateToTV} />,
  };

  // ========================================
  // Render
  // ========================================
  
  return (
    <div className="relative min-h-screen bg-crt-base overflow-hidden">
      <ThemeToggle />
      <ParallaxBackground panState={panState}>
        
        <PanStage 
          ref={panRef} 
          onStateChange={setPanState} 
          className="mx-auto min-h-screen flex items-center justify-center"
        >
          {TVs.map(tv => (
            <div 
              key={tv.id} 
              data-pan-id={tv.id} 
              className="aspect-square w-[clamp(12rem,24vw,20rem)]"
            >
              <TVShell className="w-full h-full cursor-pointer">
                <div className="h-full flex items-center justify-center">
                  <StaticNoise intensity={1} />
                  <div className="text-crt-text font-semibold text-center text-sm sm:text-base">
                    {tv.title}
                  </div>
                </div>
              </TVShell>
            </div>
          ))}
        </PanStage>

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
