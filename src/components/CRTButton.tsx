import type { ReactNode, ButtonHTMLAttributes } from 'react';
import useScrambleText from '../hooks/useScrambleText';

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
  const label = typeof children === "string" ? children : null;
  const { visibleLabel, scramble } = useScrambleText(label ?? "", disabled);
  // Size variants
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-base',
    lg: 'px-6 py-3 text-base sm:text-lg'
  };

  // Color variants using theme tokens
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-crt-accent text-white border border-crt-accent',
    secondary: 'bg-transparent border border-crt-border-secondary text-crt-text',
    ghost: 'bg-transparent border border-transparent text-crt-text'
  };

  const baseClasses = `
    font-mono font-medium rounded-none transition-colors duration-150 cursor-pointer
    relative overflow-hidden group
    focus:outline-none focus:ring-2 focus:ring-crt-accent/50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      onMouseEnter={scramble}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) scramble();
      }}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {variant === "primary" && <span className="h-2 w-2 rounded-full bg-[#00ff66] shadow-[0_0_10px_#00ff66]" aria-hidden="true" />}
        {label ? visibleLabel : children}
      </span>
    </button>
  );
}
