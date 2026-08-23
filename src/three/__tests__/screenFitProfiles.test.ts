import { describe, expect, it } from "vitest";
import { getResponsiveScreenFits, SCREEN_FIT_PROFILES } from "../screenFitProfiles";

describe("calibrated CRT screen profiles", () => {
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

  it("eases between exact aspect-ratio calibration anchors", () => {
    expect(getResponsiveScreenFits(430, 932)).toEqual(SCREEN_FIT_PROFILES["PHONE PORTRAIT"]);
    expect(getResponsiveScreenFits(710, 1358)).toEqual(SCREEN_FIT_PROFILES["FOLD / TABLET"]);

    const between = getResponsiveScreenFits(600, 1220).home;
    expect(between.scale[0]).toBeGreaterThan(1.21);
    expect(between.scale[0]).toBeLessThan(1.25);
    expect(between.offset[0]).toBeGreaterThan(0.07);
    expect(between.offset[0]).toBeLessThan(0.08);
  });
});
