export interface SmartHeaderVisualState {
  transform: string;
  opacity: string;
  filter: string;
}

export function getSmartHeaderVisualState(offset: number, height: number): SmartHeaderVisualState {
  const clampedOffset = Math.min(Math.max(offset, 0), Math.max(height, 0));
  const progress = height > 0 ? clampedOffset / height : 0;
  return {
    transform: `translateY(${-clampedOffset}px)`,
    opacity: String(1 - progress),
    filter: `blur(${progress * 20}px)`,
  };
}
