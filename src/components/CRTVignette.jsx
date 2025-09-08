/**
 * CRTVignette - Subtle vignette effect that mimics CRT monitor darkening at edges
 * 
 * Props:
 * - intensity: Controls how strong the vignette effect is (0-1, default: 0.3)
 * - innerRadius: How far from center the effect starts (0-100, default: 40)
 * - className: Additional CSS classes
 */
export default function CRTVignette({ 
  intensity = 0.3, 
  innerRadius = 40, 
  className = "" 
}) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(circle at center, transparent ${innerRadius}%, rgba(0,0,0,${intensity}) 100%)`
      }}
    />
  );
}
