import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import crtLensMatte from "./assets/crt-lens-matte.svg";
import TVZoomOverlay from "./components/TVZoomOverlay";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import type { PortfolioChannelId } from "./three/createPortfolioScene";

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

  return <PortfolioApp />;
}

function PortfolioApp() {
  const [selectedId, setSelectedId] = useState<PortfolioChannelId | null>(null);
  const [sceneChannel, setSceneChannel] = useState<PortfolioChannelId | null>(null);
  const [pendingId, setPendingId] = useState<PortfolioChannelId | null>(null);
  const [overlayExited, setOverlayExited] = useState(false);
  const [overviewReady, setOverviewReady] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const navigateToTV = (targetId: string) => {
    const target = targetId as PortfolioChannelId;
    if (target === selectedId) return;
    setPendingId(target);
    setOverlayExited(false);
    setOverviewReady(false);
    setSelectedId(null);
  };

  useEffect(() => {
    if (!pendingId || !overlayExited || !overviewReady) return;
    setSceneChannel(pendingId);
  }, [overlayExited, overviewReady, pendingId]);

  function closeTV() {
    setPendingId(null);
    setSelectedId(null);
    setOverlayExited(false);
    setOverviewReady(false);
  }

  const handleOverviewComplete = useCallback(() => setOverviewReady(true), []);
  const handleOverlayExitComplete = useCallback(() => {
    setOverlayExited(true);
    setSceneChannel(null);
  }, []);
  const handleRequestedFocusComplete = useCallback((id: PortfolioChannelId) => {
    if (id !== pendingId) return;
    setSelectedId(id);
    setPendingId(null);
  }, [pendingId]);

  const byId: Record<string, React.ReactNode> = {
    home: <Home onNavigate={navigateToTV} />,
    portfolio: <Portfolio onNavigate={navigateToTV} />,
    contact: <Contact onNavigate={navigateToTV} />,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111111]">
      <div ref={backgroundRef}>
        <Suspense fallback={<div className="min-h-screen bg-[#111111]" />}>
          <ThreeCRTStage
            onSelect={(id) => {
              setSceneChannel(id);
              setSelectedId(id);
            }}
            requestedChannel={sceneChannel}
            quickTransition={Boolean(pendingId)}
            onOverviewComplete={handleOverviewComplete}
            onRequestedFocusComplete={handleRequestedFocusComplete}
          />
        </Suspense>
      </div>

      <TVZoomOverlay
        selectedItem={selectedId ? {
          id: selectedId,
          title: selectedId === "home" ? "PROFILE" : selectedId === "portfolio" ? "PROJECTS" : "CONTACT",
        } : null}
        onClose={closeTV}
        onExitComplete={handleOverlayExitComplete}
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
