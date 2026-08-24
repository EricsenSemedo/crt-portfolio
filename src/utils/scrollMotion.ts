export interface SmoothScrollEnvironment {
  hasFinePointer: boolean;
  canHover: boolean;
  maxTouchPoints: number;
  reducedMotion: boolean;
  viewportWidth: number;
}

export interface ScrollRevealState {
  opacity: number;
  blur: number;
}

const DESKTOP_MIN_WIDTH = 1024;
// NOTE: Desktop smoothing starts at a laptop-sized viewport; the reveal ratios mirror PX Push's sharp-at-5%, gone-at-minus-30% exit window.
const REVEAL_START_RATIO = 0.05;
const REVEAL_END_RATIO = -0.3;

export function shouldUseDesktopSmoothScroll(environment: SmoothScrollEnvironment) {
  return environment.viewportWidth >= DESKTOP_MIN_WIDTH
    && environment.hasFinePointer
    && environment.canHover
    && environment.maxTouchPoints === 0
    && !environment.reducedMotion;
}

export function hasScrollableOverflow(scrollHeight: number, clientHeight: number) {
  return scrollHeight > clientHeight;
}

export function getScrollRevealState(
  rowTop: number,
  viewportHeight: number,
  reducedMotion: boolean,
): ScrollRevealState {
  if (reducedMotion || viewportHeight <= 0) {
    return { opacity: 1, blur: 0 };
  }

  const start = viewportHeight * REVEAL_START_RATIO;
  const end = viewportHeight * REVEAL_END_RATIO;
  const progress = Math.min(1, Math.max(0, (start - rowTop) / (start - end)));

  if (progress === 0) return { opacity: 1, blur: 0 };

  return {
    opacity: 1 - progress,
    blur: progress * 20,
  };
}
