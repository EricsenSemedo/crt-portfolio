import type { ReactNode } from 'react';

interface TVShellProps {
  children?: ReactNode;
  className?: string;
  brightness?: number;
  intensity?: number;
  frameClassName?: string;
}

/**
 * TVShell - The physical CRT television hardware: plastic body, bezel, screen, vents, indicators.
 * All colors use theme tokens so the shell adapts to dark/light mode.
 */
export default function TVShell({
  children,
  className = "",
  brightness = 1,
  intensity = 1,
  frameClassName = ""
}: TVShellProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer CRT body */}
      <div className={`relative h-full rounded-[18px] shadow-2xl ${frameClassName} bg-crt-shell border border-crt-border-subtle overflow-hidden`}> 
        {/* Painted plastic shell thickness */}
        <div className="p-3 sm:p-4 h-full">
          <div className="flex items-stretch gap-3 h-full">
            {/* Screen with bezel */}
            <div
              className="relative flex-1 rounded-[14px] bg-crt-shell-screen overflow-hidden"
              style={{
                borderWidth: "8px",
                borderStyle: "solid",
                borderColor: "rgb(var(--crt-shell-bezel) / 0.8)",
                boxShadow: "inset 0 0 40px rgb(var(--crt-vignette-color) / 0.7)",
              }}
              data-pan-target
            >
              {/* Actual screen content */}
              <div 
                className="relative w-full h-full bg-crt-shell-screen"
                style={{ filter: `brightness(${brightness})`}}
              >
                {children}
              </div>

              {/* Glass curvature highlight */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(120% 100% at 50% 50%, rgb(var(--crt-glow-color) / 0.18), rgb(var(--crt-glow-color) / 0) 60%)",
                  mixBlendMode: "screen",
                  opacity: 0.6,
                }}
              />

              {/* Vignette inside screen */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(120% 100% at 50% 50%, rgb(var(--crt-glow-color) / 0.66), rgb(var(--crt-vignette-color) / 0.15) 60%, rgb(var(--crt-vignette-color) / 0.65) 100%)",
                  mixBlendMode: "overlay",
                  opacity: .9 * intensity,
                }}
              />

              {/* Scanlines */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "repeating-linear-gradient(180deg, rgb(var(--crt-scanline-color) / 0.04) 0px, rgb(var(--crt-scanline-color) / 0.04) 1px, transparent 2px, transparent 3px)",
                  opacity: .2 * intensity,
                }}
              />

              {/* Bloom line */}
              <div
                className="pointer-events-none absolute inset-x-0 top-12 h-[2px] blur-[2px]"
                style={{ backgroundColor: "rgb(var(--crt-glow-color) / 0.1)" }}
              />

            </div>

            {/* Integrated bezel controls along screen edges */}
            <div className="pointer-events-none absolute inset-0">
              {/* Right-edge vents */}
              <div className="absolute right-1 top-4 bottom-4 flex flex-col justify-between">
                {Array.from({length: 7}).map((_, i) => (
                  <div key={i} className="w-[3px] h-3 bg-crt-shell-detail rounded-sm" style={{ opacity: 0.8 }} />
                ))}
              </div>

              {/* Bottom-edge flush indicators */}
              <div className="absolute inset-x-6 bottom-1 flex items-center justify-center gap-2">
                {Array.from({length: 5}).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-crt-shell-indicator"
                    style={{
                      opacity: 0.9,
                      boxShadow: "0 0 0 1px rgb(var(--crt-shell-detail))",
                    }}
                  />
                ))}
              </div>

              {/* Bezel bevel highlights */}
              <div
                className="absolute inset-x-0 top-0 h-3"
                style={{ background: "linear-gradient(to bottom, rgb(var(--crt-glow-color) / 0.1), transparent)" }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-3"
                style={{ background: "linear-gradient(to top, rgb(var(--crt-vignette-color) / 0.4), transparent)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
