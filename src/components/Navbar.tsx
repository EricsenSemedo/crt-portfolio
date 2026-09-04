import { useEffect, useRef } from "react";
import useScrambleText from "../hooks/useScrambleText";
import { getSmartHeaderVisualState } from "../utils/smartHeaderMotion";
import CRTIconButton from "./CRTIconButton";

interface NavbarProps {
  title: string;
  onClose?: () => void;
}

/**
 * Navbar - Top bar overlay inside TVZoomOverlay with title and close button.
 * Uses theme tokens for gradient background and text colors.
 */
export default function Navbar({ title, onClose }: NavbarProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const marqueeLabel = useScrambleText(title, false, { autoPlay: "touch", delay: 300 });
  const marqueeItems = Array.from({ length: 12 }, (_, index) => (
    <span key={index}>{marqueeLabel.visibleLabel}</span>
  ));

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(".crt-page");
    if (!scroller) return;
    const scrollContainer = scroller;

    let lastScrollTop = scrollContainer.scrollTop;
    let touchActive = false;
    let frameRequested = false;
    let snapTimer: number | undefined;

    function applyScrollProgress(header: HTMLDivElement, offset: number) {
      Object.assign(header.style, getSmartHeaderVisualState(offset, header.offsetHeight));
    }

    function setPosition(nextOffset: number, animate = false) {
      const header = headerRef.current;
      if (!header) return;
      const offset = Math.min(header.offsetHeight, Math.max(0, nextOffset));
      offsetRef.current = offset;
      header.classList.toggle("is-snapping", animate);
      applyScrollProgress(header, offset);
    }

    function stopSnap() {
      const header = headerRef.current;
      if (!header?.classList.contains("is-snapping")) return;
      const transform = window.getComputedStyle(header).transform;
      try {
        offsetRef.current = Math.max(0, -new DOMMatrixReadOnly(transform).m42);
      } catch {
        // Retain the last measured offset if transform parsing is unavailable.
      }
      header.classList.remove("is-snapping");
      applyScrollProgress(header, offsetRef.current);
    }

    function settle() {
      const header = headerRef.current;
      if (!header || touchActive) return;
      setPosition(offsetRef.current < header.offsetHeight / 2 ? 0 : header.offsetHeight, true);
    }

    function update() {
      const currentScrollTop = scrollContainer.scrollTop;
      const movement = currentScrollTop - lastScrollTop;
      lastScrollTop = currentScrollTop;
      if (currentScrollTop <= 0) setPosition(0);
      else if (movement !== 0) {
        stopSnap();
        setPosition(offsetRef.current + movement);
        if (!touchActive) {
          window.clearTimeout(snapTimer);
          snapTimer = window.setTimeout(settle, 130);
        }
      }
      frameRequested = false;
    }

    function handleScroll() {
      if (!frameRequested) {
        requestAnimationFrame(update);
        frameRequested = true;
      }
    }

    function handleTouchStart() {
      touchActive = true;
      window.clearTimeout(snapTimer);
      stopSnap();
    }

    function handleTouchEnd() {
      touchActive = false;
      settle();
    }

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    scrollContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
    scrollContainer.addEventListener("touchend", handleTouchEnd, { passive: true });
    scrollContainer.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(snapTimer);
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.removeEventListener("touchstart", handleTouchStart);
      scrollContainer.removeEventListener("touchend", handleTouchEnd);
      scrollContainer.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  return (
    <div ref={headerRef} className="smart-header pointer-events-none absolute left-0 right-0 top-0 flex h-16 items-center border-b border-white/30 bg-[#1a1a1a]/95">
      <div id="tv-overlay-title" className="channel-marquee pointer-events-auto h-full flex-1 overflow-hidden font-display text-3xl font-bold uppercase leading-none tracking-[.08em] text-crt-text md:text-4xl" role="heading" aria-level={2} aria-label={title}>
        <div className="channel-marquee__track h-full items-center" aria-hidden="true">
          <div className="channel-marquee__group h-full items-center">{marqueeItems}</div>
          <div className="channel-marquee__group h-full items-center">{marqueeItems}</div>
        </div>
      </div>
      <CRTIconButton
        onClick={onClose}
        className="pointer-events-auto h-full border-l border-white/30 px-5"
        label="Return to TV room"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.7 2.5 10.5l1.3 1.6 1.2-1v9.4h5.5v-5.7h3v5.7H19v-9.4l1.2 1 1.3-1.6L12 2.7Z" />
        </svg>
      </CRTIconButton>
    </div>
  );
}
