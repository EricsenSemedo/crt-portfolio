import type { PortfolioChannelId } from "../three/createPortfolioScene";

export type TVSignalTransitionKind = "pinch" | "channel-static" | "vertical-lock";

export function getTVSignalTransition(id: PortfolioChannelId): TVSignalTransitionKind {
  if (id === "home") return "pinch";
  if (id === "portfolio") return "channel-static";
  return "vertical-lock";
}
