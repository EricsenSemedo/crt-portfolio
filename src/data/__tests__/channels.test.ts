import { describe, expect, it } from "vitest";
import { PORTFOLIO_CHANNEL_LIST, PORTFOLIO_CHANNELS } from "../channels";

describe("portfolio channels", () => {
  it("keeps channel order, numbers, and titles in one canonical list", () => {
    expect(PORTFOLIO_CHANNEL_LIST).toEqual([
      PORTFOLIO_CHANNELS.home,
      PORTFOLIO_CHANNELS.portfolio,
      PORTFOLIO_CHANNELS.contact,
    ]);
    expect(PORTFOLIO_CHANNEL_LIST.map(({ number, title }) => ({ number, title }))).toEqual([
      { number: "01", title: "Profile" },
      { number: "02", title: "Projects" },
      { number: "03", title: "Contact" },
    ]);
  });
});
