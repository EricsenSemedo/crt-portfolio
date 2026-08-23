import { describe, expect, it } from "vitest";
import { getRandomScreenTransitionKind, getScreenTransitionDuration } from "../screenTransition";

describe("physical CRT screen transitions", () => {
  it("gives every television interaction an equal chance of each treatment", () => {
    expect(getRandomScreenTransitionKind(() => 0)).toBe("pinch");
    expect(getRandomScreenTransitionKind(() => 0.34)).toBe("signal-acquisition");
    expect(getRandomScreenTransitionKind(() => 0.99)).toBe("vertical-sync-roll");
  });

  it("keeps every interruption shorter than half a second", () => {
    expect(getScreenTransitionDuration("pinch")).toBeLessThan(500);
    expect(getScreenTransitionDuration("signal-acquisition")).toBeLessThan(500);
    expect(getScreenTransitionDuration("vertical-sync-roll")).toBeLessThan(500);
  });
});
