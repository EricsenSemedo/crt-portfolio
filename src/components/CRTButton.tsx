import type { ReactNode, MouseEvent, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CRTButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

/**
 * CRTButton - Button component with nostalgic CRT TV-themed hover and click animations.
 * Uses theme tokens for colors so variants adapt to dark/light mode.
 */
export default function CRTButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = "",
  disabled = false,
  ...props 
}: CRTButtonProps) {
  // Size variants
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-base',
    lg: 'px-6 py-3 text-base sm:text-lg'
  };

  // Color variants using theme tokens
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-crt-accent-muted hover:bg-crt-accent-deep text-crt-text',
    secondary: 'bg-transparent border border-crt-border-secondary hover:border-crt-border text-crt-text',
    ghost: 'bg-transparent hover:bg-crt-surface-secondary/30 text-crt-text'
  };

  const baseClasses = `
    font-medium rounded-lg transition-all duration-200 cursor-pointer
    relative overflow-hidden group
    focus:outline-none focus:ring-2 focus:ring-crt-accent/50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    // CRT scanline effect - subtle brightness and contrast boost
    e.currentTarget.style.filter = 'contrast(1.1) brightness(1.1) saturate(1.1)';
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.filter = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    // CRT static/glitch effect on click
    e.currentTarget.style.filter = 'contrast(1.3) brightness(1.2) saturate(1.3) hue-rotate(5deg)';
    e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
    
    // Reset after short delay
    setTimeout(() => {
      e.currentTarget.style.filter = 'contrast(1.1) brightness(1.1) saturate(1.1)';
      e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
    }, 100);
  };

  const handleMouseUp = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {/* CRT scanline overlay effect - scales with theme scanline intensity */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            opacity: "var(--crt-scanline-opacity)",
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              rgb(var(--crt-scanline-color) / 0.1) 2px,
              rgb(var(--crt-scanline-color) / 0.1) 3px
            )`
          }}
        />
      </div>
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
