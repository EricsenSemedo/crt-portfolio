interface NavbarProps {
  title: string;
  onClose?: () => void;
}

/**
 * Navbar — Top bar inside TVZoomOverlay.
 * Shows a signal indicator, page title with phosphor glow, keyboard hint, and close button.
 */
export default function Navbar({ title, onClose }: NavbarProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 pointer-events-none"
      style={{
        background: "linear-gradient(to bottom, rgb(var(--crt-bg-overlay) / 0.7), transparent)",
      }}
    >
      {/* Left: signal dot + title */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <span
          className="block w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: "rgb(var(--crt-accent-success))",
            boxShadow: "0 0 6px rgb(var(--crt-accent-success) / 0.6)",
          }}
          aria-hidden="true"
        />
        <span
          className="font-display font-semibold text-base tracking-wider"
          style={{
            color: "rgb(var(--crt-text-primary))",
            textShadow:
              "0 0 6px rgb(var(--crt-glow-accent) / calc(0.3 * var(--crt-glow-opacity)))",
          }}
        >
          {title}
        </span>
      </div>

      {/* Right: keyboard hint + close */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <span className="hidden sm:inline font-mono text-[10px] text-crt-text-muted tracking-wider select-none">
          ESC to close &middot; &larr;&rarr; switch
        </span>

        <button
          type="button"
          onClick={onClose}
          className="text-crt-text-muted hover:text-crt-text transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-crt-accent/40 rounded p-1 cursor-pointer"
          aria-label="Close"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
