export const PORTFOLIO_CHANNELS = {
  home: { id: "home", number: "01", title: "Profile" },
  portfolio: { id: "portfolio", number: "02", title: "Projects" },
  contact: { id: "contact", number: "03", title: "Contact" },
} as const;

export type PortfolioChannelId = keyof typeof PORTFOLIO_CHANNELS;

export const PORTFOLIO_CHANNEL_LIST = Object.values(PORTFOLIO_CHANNELS);

/** Every channel the screen can show. Websites has no set in the room: prospects arrive by link, so it opens without the room. */
export const SCREEN_CHANNELS = {
  ...PORTFOLIO_CHANNELS,
  websites: { id: "websites", number: "04", title: "Websites" },
} as const;

export type ScreenChannelId = keyof typeof SCREEN_CHANNELS;

export function roomChannel(id: ScreenChannelId | null): PortfolioChannelId | null {
  return id === "websites" ? null : id;
}
