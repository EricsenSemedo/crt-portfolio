import type { PortfolioChannelId, ScreenFit } from "./createPortfolioScene";

export type ScreenFitProfile = "PHONE PORTRAIT" | "FOLD / TABLET" | "DESKTOP";

export const SCREEN_FIT_PROFILES: Record<ScreenFitProfile, Record<PortfolioChannelId, ScreenFit>> = {
  "PHONE PORTRAIT": {
    home: { scale: [1.21, 1.58], offset: [0.08, -0.1] },
    portfolio: { scale: [1.15, 1.83], offset: [0.12, -0.16] },
    contact: { scale: [1.44, 2.11], offset: [-0.12, 0.05] },
  },
  "FOLD / TABLET": {
    home: { scale: [1.25, 1.58], offset: [0.07, -0.11] },
    portfolio: { scale: [1.15, 1.83], offset: [0.14, -0.16] },
    contact: { scale: [1.45, 2.11], offset: [-0.08, 0.05] },
  },
  DESKTOP: {
    home: { scale: [1.19, 1.58], offset: [0.12, -0.1] },
    portfolio: { scale: [1.25, 1.83], offset: [0.08, -0.16] },
    contact: { scale: [1.44, 2.11], offset: [-0.12, 0.05] },
  },
};

export function getScreenFitProfile(width: number, height: number): ScreenFitProfile {
  if (width < height && width <= 600) return "PHONE PORTRAIT";
  if (width <= 1100) return "FOLD / TABLET";
  return "DESKTOP";
}

export function cloneScreenFitProfile(profile: ScreenFitProfile) {
  return structuredClone(SCREEN_FIT_PROFILES[profile]);
}
