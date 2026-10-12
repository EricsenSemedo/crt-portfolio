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
  // A shared link opens its page straight away; the room loads behind it and is waiting at that
  // set, so closing the page still pulls back to the room.
  const [selectedId, setSelectedId] = useState<PortfolioChannelId | null>(channel);
  const [sceneChannel, setSceneChannel] = useState<PortfolioChannelId | null>(channel);
  const [phase, setPhase] = useState<"overview" | "ready" | "focusing" | "open" | "exiting">(channel ? "open" : "overview");
  const [screenEffectActive, setScreenEffectActive] = useState(false);
  const [stageMounted, setStageMounted] = useState(!channel);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Behind an open page the room waits until the page itself has loaded, so its pictures go first.
  useEffect(() => {
    if (stageMounted) return;
    if (phase !== "open") {
      setStageMounted(true);
      return;
    }
    let idle = 0;
    let timer = 0;
    function mountWhenIdle() {
      if (window.requestIdleCallback) idle = window.requestIdleCallback(() => setStageMounted(true), { timeout: 2000 });
      else timer = window.setTimeout(() => setStageMounted(true), 300);
    }
    if (document.readyState === "complete") mountWhenIdle();
    else window.addEventListener("load", mountWhenIdle, { once: true });
    return () => {
      window.removeEventListener("load", mountWhenIdle);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, [phase, stageMounted]);

  // The URL chooses the destination; animation callbacks only advance its presentation.
  useEffect(() => {
    if (phase === "open" && channel && selectedId && selectedId !== channel) {
      // Already inside a set: flip channels on this screen. The camera stays put behind the page,
      // so closing still pulls back to the room.
      setSelectedId(channel);
    } else if (phase === "open" && selectedId !== channel) {
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
    if (id !== channel || selectedId === id) return;
    setScreenEffectActive(true);
    setSelectedId(id);
    setPhase("open");
  }, [channel, selectedId]);

  const byId: Record<string, React.ReactNode> = {
    home: <Home onNavigate={navigateToTV} />,
    portfolio: <Portfolio onNavigate={navigateToTV} selectedProject={project} onOpenProject={openProject} onCloseProject={closeProject} />,
    contact: <Contact onNavigate={navigateToTV} />,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-crt-overlay">
      {redirectTo && <Navigate to={redirectTo} replace />}
      <div ref={backgroundRef}>
        {stageMounted ? (
          <Suspense fallback={<CRTLoadingScreen />}>
            <ThreeCRTStage
              onSelect={navigateToTV}
              requestedChannel={sceneChannel}
              quickTransition={phase === "overview" || phase === "focusing"}
              instantFocus={phase === "open"}
              screenEffectActive={screenEffectActive}
              paused={Boolean(selectedId) && !screenEffectActive}
              onOverviewComplete={handleOverviewComplete}
              onRequestedFocusComplete={handleRequestedFocusComplete}
            />
          </Suspense>
        ) : <CRTLoadingScreen />}
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
