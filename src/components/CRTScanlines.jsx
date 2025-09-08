/**
 * CRTScanlines - Horizontal scanlines effect that mimics CRT display technology
 * 
 * Props:
 * - opacity: Controls scanline visibility (0-1, default: 0.2)
 * - lineHeight: Height of each scanline in pixels (default: 4)
 * - lineSpacing: Space between scanlines in pixels (default: 2)
 * - className: Additional CSS classes
 */
export default function CRTScanlines({ 
  opacity = 0.2, 
  lineHeight = 4, 
  lineSpacing = 2,
  className = "" 
}) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity,
        background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent ${lineSpacing}px,
          rgba(255,255,255,0.03) ${lineSpacing}px,
          rgba(255,255,255,0.03) ${lineHeight}px
        )`
      }}
    />
  );
}
