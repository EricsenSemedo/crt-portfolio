import { useMemo, useRef, useState } from "react";
import PanStage from "./components/PanStage";
import ParallaxBackground from "./components/ParallaxBackground";
import StaticNoise from "./components/StaticNoise";
import TVShell from "./components/TVShell";
import TVZoomOverlay from "./components/TVZoomOverlay";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";

// Predetermined TVs (center-anchored). Width is percentage of stage width; height derives from aspect.
const SLOTS = [
  { id: 'home', title: 'HOME', cxPct: 25, cyPct: 55, wPct: 26 },
  { id: 'portfolio', title: 'PORTFOLIO', cxPct: 50, cyPct: 35, wPct: 28 },
  { id: 'contact', title: 'CONTACT', cxPct: 75, cyPct: 58, wPct: 24 },
];

export default function App(){
  const [panState, setPanState] = useState({ selectedId: null, scale: 1, isAnimating: false });
  const TVs = useMemo(() => ([
    { id: 'home', title: 'HOME', width: 340 },
    { id: 'portfolio', title: 'PORTFOLIO', width: 340 },
    { id: 'contact', title: 'CONTACT', width: 340 },
  ]), []);
  
  const panRef = useRef(null);
  
  // Navigation function to smoothly transition between TVs
  const navigateToTV = (targetId) => {
    if (!panRef.current || targetId === panState.selectedId) return;
    
    // First close current overlay (triggers zoom-out)
    panRef.current.reset();
    
    // After zoom-out completes, zoom into target TV
    setTimeout(() => {
      panRef.current.centerOn(targetId);
    }, 500); // Match the zoom-out duration
  };
  
  const byId = {
    home: <Home onNavigate={navigateToTV} />,
    portfolio: <Portfolio onNavigate={navigateToTV} />,
    contact: <Contact onNavigate={navigateToTV} />,
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <ParallaxBackground
        panState={panState}
      >
        <PanStage ref={panRef} onStateChange={setPanState} className="mx-auto min-h-screen flex items-center justify-center">
            {TVs.map(tv => (
              <div key={tv.id} panId={tv.id} className="aspect-square w-[clamp(12rem,24vw,20rem)]">
                <TVShell className="w-full h-full cursor-pointer">
                  <div className="h-full flex items-center justify-center">
                    <StaticNoise intensity={1} />
                    <div className="text-white font-semibold text-center text-sm sm:text-base">{tv.title}</div>
                  </div>
                </TVShell>
                </div>
              ))}
        </PanStage>

        {panState.selectedId && !panState.isAnimating && (
          <TVZoomOverlay
            selectedItem={{id: panState.selectedId, title: panState.selectedId.toUpperCase()}}
            onClose = {() =>{panRef.current?.reset()}}
          >
            {byId[panState.selectedId] ?? null}
          </TVZoomOverlay>
        )
        }
      </ParallaxBackground>
    </div>
  )
}