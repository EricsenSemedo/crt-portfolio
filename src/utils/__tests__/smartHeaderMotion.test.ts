import { describe, expect, it } from "vitest";
import { getSmartHeaderVisualState } from "../smartHeaderMotion";

describe("getSmartHeaderVisualState", () => {
  it("links translation, fade, and blur to the same scroll progress", () => {
    expect(getSmartHeaderVisualState(0, 64)).toEqual({
      transform: "translateY(0px)",
      opacity: "1",
      filter: "blur(0px)",
    });
    expect(getSmartHeaderVisualState(32, 64)).toEqual({
      transform: "translateY(-32px)",
      opacity: "0.5",
      filter: "blur(10px)",
    });
    expect(getSmartHeaderVisualState(64, 64)).toEqual({
      transform: "translateY(-64px)",
      opacity: "0",
      filter: "blur(20px)",
    });
  });
});
