interface CRTScanlinesProps {
  opacity?: number;
  lineHeight?: number;
  lineSpacing?: number;
  className?: string;
}

/**
 * CRTScanlines - Horizontal scanlines effect that mimics CRT display technology.
 * Uses --crt-scanline-color token so lines adapt to dark/light theme.
 * Opacity scales with --crt-scanline-opacity for theme-aware intensity.
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
        opacity: `calc(${opacity} * var(--crt-scanline-opacity))`,
        background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent ${lineSpacing}px,
          rgb(var(--crt-scanline-color) / 0.03) ${lineSpacing}px,
          rgb(var(--crt-scanline-color) / 0.03) ${lineHeight}px
        )`
      }}
    />
  );
}
