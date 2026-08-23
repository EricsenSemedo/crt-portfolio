import type { PortfolioChannelId } from "./createPortfolioScene";

export type ScreenTransitionKind = "pinch" | "channel-static" | "vertical-lock";

export function getScreenTransitionKind(id: PortfolioChannelId): ScreenTransitionKind {
  if (id === "home") return "pinch";
  if (id === "portfolio") return "channel-static";
  return "vertical-lock";
}

export function getScreenTransitionDuration(kind: ScreenTransitionKind) {
  if (kind === "pinch") return 320;
  if (kind === "channel-static") return 240;
  return 340;
}
