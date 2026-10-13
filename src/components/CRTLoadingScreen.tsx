import { useEffect } from "react";
import { PORTFOLIO_CHANNEL_LIST, type PortfolioChannelId } from "../data/channels";
import "./CRTLoadingScreen.css";

interface CRTLoadingScreenProps {
  settled?: number;
  total?: number;
  onSkip?: () => void;
  /** Opens a channel's page straight away, without waiting for the room. */
  onOpen?: (id: PortfolioChannelId) => void;
  /** The room is live: fade the picture into it, then call onFaded. */
  ready?: boolean;
  onFaded?: () => void;
}

const STILL_ROOT = `${import.meta.env.BASE_URL}room/`;

/**
 * CRTLoadingScreen - A photograph of the room shows at once, with the name over the floor, and
 * fades into the live 3D room once it's ready. The channels work from the first frame, so nobody
 * waits on the loader to reach a page.
 */
export default function CRTLoadingScreen({ settled = 0, total = 0, onSkip, onOpen, ready = false, onFaded }: CRTLoadingScreenProps) {
  const progress = total > 0 ? Math.min(1, settled / total) : null;

  // Reduced motion has no fade to wait for.
  useEffect(() => {
    if (ready && window.matchMedia("(prefers-reduced-motion: reduce)").matches) onFaded?.();
  }, [onFaded, ready]);

  return (
    <div
      className={"crt-loading-screen" + (ready ? " is-ready" : "")}
      onTransitionEnd={(event) => {
        if (ready && event.target === event.currentTarget) onFaded?.();
      }}
    >
      <picture className="crt-loading-screen__still" aria-hidden="true">
        {/* Each layout keeps its own camera, so phones get their own photograph. */}
        <source media="(max-aspect-ratio: 719/1000)" srcSet={STILL_ROOT + "overview-tall.jpg"} />
        <img src={STILL_ROOT + "overview-wide.jpg"} alt="" fetchPriority="high" />
      </picture>
      <div className="crt-loading-screen__content">
        <p className="crt-loading-screen__name">Ericsen Semedo</p>
        <p className="crt-loading-screen__role">Software &amp; game developer</p>
        {onOpen && !ready && (
          <nav className="crt-loading-screen__channels" aria-label="Portfolio sections">
            {PORTFOLIO_CHANNEL_LIST.map((channel) => (
              <button key={channel.id} type="button" onClick={() => onOpen(channel.id)}>
                <span>{channel.number}</span>{channel.title}
              </button>
            ))}
          </nav>
        )}
        {!ready && (
          <>
            <div
              className={"crt-loading-screen__bar" + (progress === null ? " is-starting" : "")}
              role="progressbar"
              aria-label="Loading the TV room"
              aria-valuemin={0}
              aria-valuemax={total || 1}
              aria-valuenow={progress === null ? undefined : settled}
              aria-valuetext={progress === null ? "Starting the TV room" : `${settled} of ${total} scene parts ready`}
            >
              <span style={{ transform: `scaleX(${progress ?? 0.08})` }} />
            </div>
            <p className="crt-loading-screen__count" role="status">
              {progress === null ? "Tuning in the room" : `Tuning in the room · ${settled} / ${total}`}
            </p>
            {onSkip && (
              <button type="button" className="crt-loading-screen__skip" onClick={onSkip}>
                Continue without 3D
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
