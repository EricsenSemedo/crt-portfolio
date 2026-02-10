interface StaticNoiseProps {
  intensity?: number;
  className?: string;
}

/**
 * StaticNoise - Animated TV static with fizz and noise layers.
 * Uses --crt-noise-light/dark tokens so noise adapts to theme.
 * Scales with --crt-noise-opacity for theme-aware intensity.
 */
export default function StaticNoise({ intensity = 1, className = "" }: StaticNoiseProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity: `var(--crt-noise-opacity)` }}
    >
      {/* CRT static fizz effect */}
      <div
        className="absolute inset-0 mix-blend-screen animate-[fizz_0.5s_steps(6)_infinite]"
        style={{
          opacity: 0.7 * intensity,
          background:
            "repeating-conic-gradient(from 0deg, rgb(var(--crt-noise-light) / 0.04) 0deg 10deg, rgb(var(--crt-noise-dark) / 0.06) 10deg 20deg)",
        }}
      />
      {/* CRT scanline noise */}
      <div
        className="absolute inset-0 animate-[noise_0.6s_steps(8)_infinite]"
        style={{
          opacity: 0.3 * intensity,
          background:
            "repeating-linear-gradient(180deg, rgb(var(--crt-noise-light) / 0.09) 0px, rgb(var(--crt-noise-light) / 0.09) 2px, transparent 2px, transparent 4px)",
        }}
      />
      <style>{`
        @keyframes fizz {
          to {
            transform: translate3d(0, 0.1%, 0);
            filter: hue-rotate(15deg);
          }
        }
        @keyframes noise {
          to {
            transform: translate3d(0, 1%, 0);
          }
        }
      `}</style>
    </div>
  );
}
