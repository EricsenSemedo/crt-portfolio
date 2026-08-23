import type { PortfolioChannelId } from "./createPortfolioScene";

export type ScreenTransitionKind = "pinch" | "signal-acquisition" | "vertical-sync-roll";

export function getScreenTransitionKind(id: PortfolioChannelId): ScreenTransitionKind {
  if (id === "home") return "pinch";
  if (id === "portfolio") return "signal-acquisition";
  return "vertical-sync-roll";
}

export function getScreenTransitionDuration(kind: ScreenTransitionKind) {
  if (kind === "pinch") return 320;
  if (kind === "signal-acquisition") return 240;
  return 460;
}
