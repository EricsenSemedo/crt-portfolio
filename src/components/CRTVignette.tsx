interface CRTVignetteProps {
  intensity?: number;
  innerRadius?: number;
  className?: string;
}

/**
 * CRTVignette - Subtle vignette effect that mimics CRT monitor darkening at edges.
 * Uses --crt-vignette-color token (always dark, even in light mode).
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
        background: `radial-gradient(circle at center, transparent ${innerRadius}%, rgb(var(--crt-vignette-color) / ${intensity}) 100%)`
      }}
    />
  );
}
