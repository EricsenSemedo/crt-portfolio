import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { HashRouter, Navigate } from "react-router";
import usePortfolioNavigation from "./hooks/usePortfolioNavigation";
import crtLensMatte from "./assets/crt-lens-matte.svg";
import CRTLoadingScreen from "./components/CRTLoadingScreen";
import TVZoomOverlay from "./components/TVZoomOverlay";
import type { PortfolioChannelId } from "./data/channels";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";

const AssetViewer = lazy(() => import("./pages/AssetViewer"));
const ThreeCRTStage = lazy(() => import("./components/ThreeCRTStage"));

/**
 * App - Main application component for CRT Portfolio
 */

export default function App() {
  if (window.location.pathname.endsWith("/assets")) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-crt-base" />}>
        <AssetViewer />
      </Suspense>
    );
  }

  return <HashRouter><PortfolioApp /></HashRouter>;
}

function PortfolioApp() {
  const { channel, project, redirectTo, navigateToTV, openProject, closeProject, closeTV } = usePortfolioNavigation();
  const [selectedId, setSelectedId] = useState<PortfolioChannelId | null>(null);
  const [sceneChannel, setSceneChannel] = useState<PortfolioChannelId | null>(channel);
  const [phase, setPhase] = useState<"overview" | "ready" | "focusing" | "open" | "exiting">(channel ? "focusing" : "overview");
  const [screenEffectActive, setScreenEffectActive] = useState(Boolean(channel));
  const backgroundRef = useRef<HTMLDivElement>(null);

  // The URL chooses the destination; animation callbacks only advance its presentation.
  useEffect(() => {
    if (phase === "open" && selectedId !== channel) {
      setScreenEffectActive(true);
      setSelectedId(null);
      setPhase("exiting");
    } else if (phase === "ready" && channel) {
      setScreenEffectActive(true);
      setSceneChannel(channel);
      setPhase("focusing");
    } else if (phase === "focusing" && sceneChannel !== channel) {
      setSceneChannel(channel);
      if (!channel) setPhase("overview");
    }
  }, [channel, phase, sceneChannel, selectedId]);

  const handleOverviewComplete = useCallback(() => {
    setPhase("ready");
    setScreenEffectActive(false);
  }, []);
  const handleOverlayExitComplete = useCallback(() => {
    setSceneChannel(null);
    setPhase("overview");
  }, []);
  const handleOverlayEnterComplete = useCallback(() => setScreenEffectActive(false), []);
  const handleRequestedFocusComplete = useCallback((id: PortfolioChannelId) => {
    if (id !== channel) return;
    setScreenEffectActive(true);
    setSelectedId(id);
    setPhase("open");
  }, [channel]);

  const byId: Record<string, React.ReactNode> = {
    home: <Home onNavigate={navigateToTV} />,
    portfolio: <Portfolio onNavigate={navigateToTV} selectedProject={project} onOpenProject={openProject} onCloseProject={closeProject} />,
    contact: <Contact onNavigate={navigateToTV} />,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111111]">
      {redirectTo && <Navigate to={redirectTo} replace />}
      <div ref={backgroundRef}>
        <Suspense fallback={<CRTLoadingScreen />}>
          <ThreeCRTStage
            onSelect={navigateToTV}
            requestedChannel={sceneChannel}
            quickTransition={phase === "overview" || phase === "focusing"}
            screenEffectActive={screenEffectActive}
            paused={Boolean(selectedId) && !screenEffectActive}
            onOverviewComplete={handleOverviewComplete}
            onRequestedFocusComplete={handleRequestedFocusComplete}
          />
        </Suspense>
      </div>

      <TVZoomOverlay
        selectedItem={selectedId ? { id: selectedId } : null}
        onClose={closeTV}
        onExitComplete={handleOverlayExitComplete}
        onEnterComplete={handleOverlayEnterComplete}
        hideHeader={Boolean(project)}
        backgroundRef={backgroundRef}
      >
        {selectedId ? byId[selectedId] ?? null : null}
      </TVZoomOverlay>

      <div className="global-crt-overlay" aria-hidden="true">
        <div className="global-crt-overlay__gloom" />
        <div className="global-crt-overlay__scan-beam" />
        <img className="global-crt-overlay__vignette" src={crtLensMatte} alt="" />
      </div>
    </div>
  );
}
