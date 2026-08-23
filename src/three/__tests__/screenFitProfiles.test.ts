import { describe, expect, it } from "vitest";
import { getScreenFitProfile, SCREEN_FIT_PROFILES } from "../screenFitProfiles";

describe("calibrated CRT screen profiles", () => {
  it("selects the intended responsive profile", () => {
    expect(getScreenFitProfile(430, 932)).toBe("PHONE PORTRAIT");
    expect(getScreenFitProfile(710, 1358)).toBe("FOLD / TABLET");
    expect(getScreenFitProfile(1440, 900)).toBe("DESKTOP");
  });

  it("preserves the approved phone and foldable calibration", () => {
    expect(SCREEN_FIT_PROFILES["PHONE PORTRAIT"].portfolio).toEqual({
      scale: [1.15, 1.83],
      offset: [0.12, -0.16],
    });
    expect(SCREEN_FIT_PROFILES["FOLD / TABLET"].contact).toEqual({
      scale: [1.45, 2.11],
      offset: [-0.08, 0.05],
    });
  });
});
