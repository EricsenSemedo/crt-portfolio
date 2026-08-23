import { describe, expect, it } from "vitest";
import { getScreenTransitionDuration, getScreenTransitionKind } from "../screenTransition";

describe("physical CRT screen transitions", () => {
  it("assigns one comparison treatment to each television", () => {
    expect(getScreenTransitionKind("home")).toBe("pinch");
    expect(getScreenTransitionKind("portfolio")).toBe("signal-acquisition");
    expect(getScreenTransitionKind("contact")).toBe("vertical-sync-roll");
  });

  it("keeps every interruption shorter than half a second", () => {
    expect(getScreenTransitionDuration("pinch")).toBeLessThan(500);
    expect(getScreenTransitionDuration("signal-acquisition")).toBeLessThan(500);
    expect(getScreenTransitionDuration("vertical-sync-roll")).toBeLessThan(500);
  });
});
