import { useMemo, useState } from "react";
import PanStage from "./components/PanStage";
import ParallaxBackground from "./components/ParallaxBackground";
import StaticNoise from "./components/StaticNoise";
import TVShell from "./components/TVShell";

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

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <ParallaxBackground
        panState={panState}
      >
        <PanStage onStateChange={setPanState} className="mx-auto min-h-screen flex items-center justify-center">
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
      </ParallaxBackground>
      {/* App center red debug dot */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"/>
      </div>
    </div>
  )
}