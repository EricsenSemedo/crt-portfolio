import { describe, expect, it } from "vitest";
import { getTVSignalTransition } from "../tvSignalTransition";

describe("TV signal transition demos", () => {
  it("assigns a distinct treatment to every portfolio channel", () => {
    expect(getTVSignalTransition("home")).toBe("pinch");
    expect(getTVSignalTransition("portfolio")).toBe("channel-static");
    expect(getTVSignalTransition("contact")).toBe("vertical-lock");
  });
});
