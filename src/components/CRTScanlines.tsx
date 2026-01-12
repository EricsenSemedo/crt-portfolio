interface CRTScanlinesProps {
  opacity?: number;
  lineHeight?: number;
  lineSpacing?: number;
  className?: string;
}

/**
 * CRTScanlines - Horizontal scanlines effect that mimics CRT display technology
 */
export default function CRTScanlines({ 
  opacity = 0.2, 
  lineHeight = 4, 
  lineSpacing = 2,
  className = "" 
}: CRTScanlinesProps) {
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
