import type { MouseEvent } from 'react';

interface NavbarProps {
  title: string;
  onClose?: () => void;
}

/**
 * Navbar - Top bar overlay inside TVZoomOverlay with title and close button.
 * Uses theme tokens for gradient background and text colors.
 */
export default function Navbar({ title, onClose }: NavbarProps) {
  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.filter = 'contrast(1.1) brightness(1.1)';
  };

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.filter = 'none';
  };

  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.filter = 'contrast(1.3) brightness(1.2) saturate(1.2)';
    setTimeout(() => {
      e.currentTarget.style.filter = 'contrast(1.1) brightness(1.1)';
    }, 100);
  };

  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pointer-events-none"
      style={{ background: "linear-gradient(to bottom, rgb(var(--crt-bg-overlay) / 0.6), transparent)" }}
    >
      <div className="text-crt-text font-display font-semibold text-lg tracking-wider pointer-events-auto">
        {title}
      </div>
      <button
        onClick={onClose}
        className="text-crt-text/80 hover:text-crt-text transition-all duration-200 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-crt-text/50 rounded p-1 cursor-pointer group relative overflow-hidden"
        aria-label="Close"
        style={{
          filter: 'none',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
