import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { HashRouter, Navigate } from "react-router";
import usePortfolioNavigation from "./hooks/usePortfolioNavigation";
import crtLensMatte from "./assets/crt-lens-matte.svg";
import CRTLoadingScreen from "./components/CRTLoadingScreen";
import TVZoomOverlay from "./components/TVZoomOverlay";
import { roomChannel, type PortfolioChannelId, type ScreenChannelId } from "./data/channels";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Websites from "./pages/Websites";

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
  // A Websites link opens straight onto its screen; the room only loads once the visitor leaves for it.
  const opensWithoutRoom = channel === "websites";
  const [selectedId, setSelectedId] = useState<ScreenChannelId | null>(opensWithoutRoom ? "websites" : null);
  const [sceneChannel, setSceneChannel] = useState<PortfolioChannelId | null>(roomChannel(channel));
  const [phase, setPhase] = useState<"overview" | "ready" | "focusing" | "open" | "exiting">(
    opensWithoutRoom ? "open" : channel ? "focusing" : "overview",
  );
  const [screenEffectActive, setScreenEffectActive] = useState(Boolean(channel) && !opensWithoutRoom);
  const [roomMounted, setRoomMounted] = useState(!opensWithoutRoom);
  if (!roomMounted && channel !== "websites") setRoomMounted(true);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // The URL chooses the destination; animation callbacks only advance its presentation.
  useEffect(() => {
    if (phase === "open" && channel && selectedId && selectedId !== channel) {
      // Already inside a TV: flip channels on this screen; the room catches up behind it.
      setSelectedId(channel);
      if (channel !== "websites") setSceneChannel(channel);
    } else if (phase === "open" && selectedId !== channel) {
      setScreenEffectActive(true);
      setSelectedId(null);
      setPhase("exiting");
    } else if (phase === "ready" && channel) {
      if (channel === "websites") {
        // No set to zoom into: the screen powers on over the room.
        setSelectedId(channel);
        setPhase("open");
        return;
      }
      setScreenEffectActive(true);
      setSceneChannel(channel);
      setPhase("focusing");
    } else if (phase === "focusing" && sceneChannel !== roomChannel(channel)) {
      const nextScene = roomChannel(channel);
      setSceneChannel(nextScene);
      if (!nextScene) setPhase("overview");
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
    if (id !== channel || selectedId === id) return;
    setScreenEffectActive(true);
    setSelectedId(id);
    setPhase("open");
  }, [channel, selectedId]);

  const byId: Record<string, React.ReactNode> = {
    home: <Home onNavigate={navigateToTV} />,
    portfolio: <Portfolio onNavigate={navigateToTV} selectedProject={project} onOpenProject={openProject} onCloseProject={closeProject} />,
    contact: <Contact onNavigate={navigateToTV} />,
    websites: <Websites onNavigate={navigateToTV} />,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-crt-overlay">
      {redirectTo && <Navigate to={redirectTo} replace />}
      <div ref={backgroundRef}>
        {roomMounted && <Suspense fallback={<CRTLoadingScreen />}>
          <ThreeCRTStage
            onSelect={navigateToTV}
            requestedChannel={sceneChannel}
            quickTransition={phase === "overview" || phase === "focusing"}
            screenEffectActive={screenEffectActive}
            paused={Boolean(selectedId) && !screenEffectActive}
            onOverviewComplete={handleOverviewComplete}
            onRequestedFocusComplete={handleRequestedFocusComplete}
          />
        </Suspense>}
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
