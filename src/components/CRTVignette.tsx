interface CRTVignetteProps {
  intensity?: number;
  innerRadius?: number;
  className?: string;
}

/**
 * CRTVignette - Subtle vignette effect that mimics CRT monitor darkening at edges
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
        background: `radial-gradient(circle at center, transparent ${innerRadius}%, rgba(0,0,0,${intensity}) 100%)`
      }}
    />
  );
}
