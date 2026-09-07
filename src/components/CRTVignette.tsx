interface CRTVignetteProps {
  intensity?: number;
  innerRadius?: number;
  className?: string;
}

/**
 * CRTVignette - Subtle vignette effect that mimics CRT monitor darkening at edges.
 * Uses --crt-vignette-color for the darkened edges.
 * Scales with --crt-vignette-opacity for the effect intensity.
 */
export default function CRTVignette({ 
  intensity = 0.3, 
  innerRadius = 40, 
  className = "" 
}: CRTVignetteProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity: `var(--crt-vignette-opacity)`,
        background: `radial-gradient(circle at center, transparent ${innerRadius}%, rgb(var(--crt-vignette-color) / ${intensity}) 100%)`
      }}
    />
  );
}
