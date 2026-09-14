import "./CRTLoadingScreen.css";

interface CRTLoadingScreenProps {
  settled?: number;
  total?: number;
  onSkip?: () => void;
}

export default function CRTLoadingScreen({ settled = 0, total = 0, onSkip }: CRTLoadingScreenProps) {
  const progress = total > 0 ? Math.min(1, settled / total) : null;

  return (
    <div className="crt-loading-screen">
      <div className="crt-loading-screen__content">
        <p className="crt-loading-screen__title">WARMING UP</p>
        <p className="crt-loading-screen__message" role="status">Setting the scene. You’ll be right in.</p>
        <div
          className={"crt-loading-screen__bar" + (progress === null ? " is-starting" : "")}
          role="progressbar"
          aria-label="Loading the TV room"
          aria-valuemin={0}
          aria-valuemax={total || 1}
          aria-valuenow={progress === null ? undefined : settled}
          aria-valuetext={progress === null ? "Starting the TV room" : `${settled} of ${total} scene parts ready`}
        >
          {Array.from({ length: 20 }, (_, index) => (
            <span key={index} className={progress !== null && index < Math.floor(progress * 20) ? "is-filled" : progress !== null && index === Math.floor(progress * 20) ? "is-active" : ""} />
          ))}
        </div>
        <p className="crt-loading-screen__count" aria-hidden="true">
          {progress === null ? "PLEASE WAIT" : `${settled} / ${total} READY`}
        </p>
        {onSkip && (
          <button type="button" className="crt-loading-screen__skip" onClick={onSkip}>
            Continue without 3D
          </button>
        )}
      </div>
    </div>
  );
}
