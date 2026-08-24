import type { PortfolioChannelId } from "../data/channels";
import type { ScreenFit } from "./createPortfolioScene";

type ScreenFitProfile = "PHONE PORTRAIT" | "FOLD / TABLET" | "DESKTOP";

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

const SCREEN_FIT_ANCHORS = [
  { aspect: 430 / 932, fits: SCREEN_FIT_PROFILES["PHONE PORTRAIT"] },
  { aspect: 710 / 1358, fits: SCREEN_FIT_PROFILES["FOLD / TABLET"] },
  { aspect: 1440 / 900, fits: SCREEN_FIT_PROFILES.DESKTOP },
] as const;

export function getResponsiveScreenFits(width: number, height: number) {
  const aspect = width / Math.max(height, 1);
  const upperIndex = SCREEN_FIT_ANCHORS.findIndex((anchor) => aspect <= anchor.aspect);
  if (upperIndex <= 0) return structuredClone(SCREEN_FIT_ANCHORS[0].fits);
  if (upperIndex === -1) return structuredClone(SCREEN_FIT_ANCHORS[SCREEN_FIT_ANCHORS.length - 1].fits);

  const lower = SCREEN_FIT_ANCHORS[upperIndex - 1];
  const upper = SCREEN_FIT_ANCHORS[upperIndex];
  const linearProgress = (aspect - lower.aspect) / (upper.aspect - lower.aspect);
  const easedProgress = linearProgress * linearProgress * (3 - 2 * linearProgress);

  return Object.fromEntries((Object.keys(lower.fits) as PortfolioChannelId[]).map((id) => [
    id,
    interpolateScreenFit(lower.fits[id], upper.fits[id], easedProgress),
  ])) as Record<PortfolioChannelId, ScreenFit>;
}

function interpolateScreenFit(from: ScreenFit, to: ScreenFit, progress: number): ScreenFit {
  const mix = (start: number, end: number) => start + (end - start) * progress;
  return {
    scale: [mix(from.scale[0], to.scale[0]), mix(from.scale[1], to.scale[1])],
    offset: [mix(from.offset[0], to.offset[0]), mix(from.offset[1], to.offset[1])],
  };
}
