/**
 * CRTAmbient — Decorative background layer for the main stage.
 *
 * Renders a subtle dot-grid pattern, radial vignette, and a slow-moving
 * horizontal "refresh line" to evoke the look of an idle CRT monitor.
 * All intensities scale with the theme's CRT effect opacity tokens so
 * dark mode gets the full effect while light mode stays subtle.
 */
export default function CRTAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgb(var(--crt-glow-accent) / calc(0.07 * var(--crt-glow-opacity))) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgb(var(--crt-vignette-color) / calc(0.35 * var(--crt-vignette-opacity))) 100%)",
        }}
      />

      {/* Slow horizontal refresh line */}
      <div
        className="absolute inset-x-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgb(var(--crt-glow-accent) / calc(0.12 * var(--crt-glow-opacity))), transparent)`,
          animation: "ambientSweep 8s linear infinite",
        }}
      />

      <style>{`
        @keyframes ambientSweep {
          0%   { top: -1px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
