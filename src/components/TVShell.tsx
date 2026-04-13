import type { CSSProperties, ReactNode } from 'react';

export type TVVariant = "boxy-80s" | "rounded-60s" | "monitor-90s";

interface TVShellProps {
  children?: ReactNode;
  className?: string;
  brightness?: number;
  intensity?: number;
  frameClassName?: string;
  variant?: TVVariant;
  shellStyle?: CSSProperties;
}

const VARIANT_CONFIG = {
  "boxy-80s": {
    bodyRadius: "24px",
    screenRadius: "16px",
    bezelWidth: "10px",
    padding: "p-4 sm:p-5",
  },
  "rounded-60s": {
    bodyRadius: "18px",
    screenRadius: "14px",
    bezelWidth: "8px",
    padding: "p-3 sm:p-4",
  },
  "monitor-90s": {
    bodyRadius: "18px",
    screenRadius: "14px",
    bezelWidth: "8px",
    padding: "p-3 sm:p-4",
  },
} as const;

/**
 * TVShell - The physical CRT television hardware.
 * Supports era-specific variants that change the shape and decorative details.
 * Per-TV shell colors can be scoped via the shellStyle prop (sets --crt-shell-* overrides).
 */
export default function TVShell({
  children,
  className = "",
  brightness = 1,
  intensity = 1,
  frameClassName = "",
  variant,
  shellStyle,
}: TVShellProps) {
  const config = variant ? VARIANT_CONFIG[variant] : VARIANT_CONFIG["rounded-60s"];
  const isBoxy = variant === "boxy-80s";

  return (
    <div className={`relative ${className}`} style={shellStyle}>
      {/* Stubby legs — boxy-80s only */}
      {isBoxy && (
        <div className="absolute -bottom-3 inset-x-6 flex justify-between pointer-events-none">
          <div className="w-6 h-3 rounded-b-md bg-crt-shell" style={{ opacity: 0.85 }} />
          <div className="w-6 h-3 rounded-b-md bg-crt-shell" style={{ opacity: 0.85 }} />
        </div>
      )}

      {/* Outer CRT body */}
      <div
        className={`relative h-full shadow-2xl ${frameClassName} bg-crt-shell border border-crt-border-subtle overflow-hidden`}
        style={{ borderRadius: config.bodyRadius }}
      >
        <div className={`${config.padding} h-full`}>
          <div className="flex items-stretch gap-3 h-full">
            {/* Screen with bezel */}
            <div
              className="relative flex-1 bg-crt-shell-screen overflow-hidden"
              style={{
                borderRadius: config.screenRadius,
                borderWidth: config.bezelWidth,
                borderStyle: "solid",
                borderColor: "rgb(var(--crt-shell-bezel) / 0.8)",
                boxShadow: "inset 0 0 40px rgb(var(--crt-vignette-color) / 0.7)",
              }}
              data-pan-target
            >
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
                  opacity: `calc(0.6 * var(--crt-glow-opacity))`,
                }}
              />

              {/* Vignette inside screen */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(120% 100% at 50% 50%, rgb(var(--crt-glow-color) / 0.66), rgb(var(--crt-vignette-color) / 0.15) 60%, rgb(var(--crt-vignette-color) / 0.65) 100%)",
                  mixBlendMode: "overlay",
                  opacity: `calc(${.9 * intensity} * var(--crt-vignette-opacity))`,
                }}
              />

              {/* Scanlines */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "repeating-linear-gradient(180deg, rgb(var(--crt-scanline-color) / 0.04) 0px, rgb(var(--crt-scanline-color) / 0.04) 1px, transparent 2px, transparent 3px)",
                  opacity: `calc(${.2 * intensity} * var(--crt-scanline-opacity))`,
                }}
              />

              {/* Bloom line */}
              <div
                className="pointer-events-none absolute inset-x-0 top-12 h-[2px] blur-[2px]"
                style={{
                  backgroundColor: "rgb(var(--crt-glow-color) / 0.1)",
                  opacity: `var(--crt-bloom-opacity)`,
                }}
              />
            </div>

            {/* Channel knobs — boxy-80s only */}
            {isBoxy && (
              <div className="flex flex-col items-center justify-center gap-3 w-8 shrink-0">
                <div
                  className="w-5 h-5 rounded-full bg-crt-shell-detail border-2"
                  style={{ borderColor: "rgb(var(--crt-shell-indicator))" }}
                />
                <div
                  className="w-4 h-4 rounded-full bg-crt-shell-detail border-2"
                  style={{ borderColor: "rgb(var(--crt-shell-indicator))" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Decorative details overlay */}
        <div className="pointer-events-none absolute inset-0">
          {/* Right-edge vents (non-boxy variants) */}
          {!isBoxy && (
            <div className="absolute right-1 top-4 bottom-4 flex flex-col justify-between">
              {Array.from({length: 7}).map((_, i) => (
                <div key={i} className="w-[3px] h-3 bg-crt-shell-detail rounded-sm" style={{ opacity: 0.8 }} />
              ))}
            </div>
          )}

          {/* Bottom-edge indicators */}
          <div className="absolute inset-x-6 bottom-1 flex items-center justify-center gap-2">
            {Array.from({length: isBoxy ? 3 : 5}).map((_, i) => (
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
  );
}
