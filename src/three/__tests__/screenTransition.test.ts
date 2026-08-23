import { describe, expect, it } from "vitest";
import { getScreenTransitionDuration, getScreenTransitionKind } from "../screenTransition";

describe("physical CRT screen transitions", () => {
  it("assigns one comparison treatment to each television", () => {
    expect(getScreenTransitionKind("home")).toBe("pinch");
    expect(getScreenTransitionKind("portfolio")).toBe("channel-static");
    expect(getScreenTransitionKind("contact")).toBe("vertical-lock");
  });

  it("keeps every interruption shorter than half a second", () => {
    expect(getScreenTransitionDuration("pinch")).toBeLessThan(500);
    expect(getScreenTransitionDuration("channel-static")).toBeLessThan(500);
    expect(getScreenTransitionDuration("vertical-lock")).toBeLessThan(500);
  });
});
