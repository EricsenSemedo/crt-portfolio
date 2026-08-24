export const PORTFOLIO_CHANNELS = {
  home: { id: "home", number: "01", title: "Profile" },
  portfolio: { id: "portfolio", number: "02", title: "Projects" },
  contact: { id: "contact", number: "03", title: "Contact" },
} as const;

export type PortfolioChannelId = keyof typeof PORTFOLIO_CHANNELS;

export const PORTFOLIO_CHANNEL_LIST = Object.values(PORTFOLIO_CHANNELS);
