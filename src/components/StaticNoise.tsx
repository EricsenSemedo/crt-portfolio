interface StaticNoiseProps {
  intensity?: number;
  className?: string;
}

export default function StaticNoise({ intensity = 1, className = "" }: StaticNoiseProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* CRT static fizz effect */}
      <div
        className="absolute inset-0 mix-blend-screen animate-[fizz_0.5s_steps(6)_infinite]"
        style={{
          opacity: 0.7 * intensity,
          background:
            "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.04) 0deg 10deg, rgba(0,0,0,0.06) 10deg 20deg)",
        }}
      />
      {/* CRT scanline noise */}
      <div
        className="absolute inset-0 animate-[noise_0.6s_steps(8)_infinite]"
        style={{
          opacity: 0.3 * intensity,
          background:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.09) 2px, transparent 2px, transparent 4px)",
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
