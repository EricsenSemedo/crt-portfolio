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
 * CRTButton - Button component with nostalgic CRT TV-themed hover and click animations
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

  // Color variants
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    secondary: 'bg-transparent border border-gray-600 hover:border-gray-500 text-white',
    ghost: 'bg-transparent hover:bg-gray-800/30 text-white'
  };

  const baseClasses = `
    font-medium rounded-lg transition-all duration-200 cursor-pointer
    relative overflow-hidden group
    focus:outline-none focus:ring-2 focus:ring-cyan-400/50
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
      {/* CRT scanline overlay effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 3px
            )`
          }}
        />
      </div>
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
