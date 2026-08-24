import { describe, expect, it } from "vitest";
import { getScrollRevealState, hasScrollableOverflow, shouldUseDesktopSmoothScroll } from "../scrollMotion";

describe("shouldUseDesktopSmoothScroll", () => {
  it("enables Lenis only for a desktop pointer without touch input", () => {
    expect(shouldUseDesktopSmoothScroll({
      hasFinePointer: true,
      canHover: true,
      maxTouchPoints: 0,
      reducedMotion: false,
      viewportWidth: 1440,
    })).toBe(true);
  });

  it("keeps native scrolling for phones, tablets, and reduced motion", () => {
    expect(shouldUseDesktopSmoothScroll({
      hasFinePointer: false,
      canHover: false,
      maxTouchPoints: 5,
      reducedMotion: false,
      viewportWidth: 430,
    })).toBe(false);
    expect(shouldUseDesktopSmoothScroll({
      hasFinePointer: true,
      canHover: true,
      maxTouchPoints: 1,
      reducedMotion: false,
      viewportWidth: 1366,
    })).toBe(false);
    expect(shouldUseDesktopSmoothScroll({
      hasFinePointer: true,
      canHover: true,
      maxTouchPoints: 0,
      reducedMotion: true,
      viewportWidth: 1440,
    })).toBe(false);
  });
});

describe("getScrollRevealState", () => {
  it("stays completely sharp until the row reaches the top five percent", () => {
    expect(getScrollRevealState(41, 800, false)).toEqual({
      opacity: 1,
      blur: 0,
    });
    expect(getScrollRevealState(40, 800, false)).toEqual({
      opacity: 1,
      blur: 0,
    });
  });

  it("links fade and blur to the row moving from five to minus thirty percent", () => {
    expect(getScrollRevealState(-100, 800, false)).toEqual({
      opacity: 0.5,
      blur: 10,
    });
    expect(getScrollRevealState(-240, 800, false)).toEqual({
      opacity: 0,
      blur: 20,
    });
  });

  it("leaves content sharp when reduced motion is enabled", () => {
    expect(getScrollRevealState(-240, 800, true)).toEqual({
      opacity: 1,
      blur: 0,
    });
  });
});

describe("hasScrollableOverflow", () => {
  it("disables reveal motion when the TV screen has no vertical scroll range", () => {
    expect(hasScrollableOverflow(800, 800)).toBe(false);
    expect(hasScrollableOverflow(799, 800)).toBe(false);
    expect(hasScrollableOverflow(801, 800)).toBe(true);
  });
});
