import { describe, expect, it } from "vitest";
import {
  getBasketballHorizontalBounds,
  getCameraCoverDistance,
  getCameraFitDistance,
  getSceneLayout,
  scaleCoordinateAroundPivot,
} from "../responsiveScene";

describe("responsive scene layout", () => {
  it("uses a tighter, wider portrait composition", () => {
    const layout = getSceneLayout(430, 932);

    expect(layout.portrait).toBe(true);
    expect(layout.fov).toBeGreaterThan(50);
    expect(layout.channelX[2] - layout.channelX[0]).toBeLessThan(3);
    expect(layout.tvScale).toBeLessThan(1);
  });

  it("keeps the basketball inside the portrait camera frustum", () => {
    const width = 430;
    const height = 932;
    const layout = getSceneLayout(width, height);
    const bounds = getBasketballHorizontalBounds(layout, width / height, 0.42, 0.41);

    expect(layout.ballStartX).toBeGreaterThan(bounds.min);
    expect(layout.ballStartX).toBeLessThan(bounds.max);
    expect(bounds.min).toBeGreaterThan(-1.5);
  });

  it("preserves the wider desktop arrangement", () => {
    const layout = getSceneLayout(1440, 900);

    expect(layout.portrait).toBe(false);
    expect(layout.channelX).toEqual([-1.82, 0, 1.84]);
    expect(layout.tvScale).toBe(1);
    expect(layout.ballStartX).toBe(-2.88);
  });

  it("preserves the desktop vertical framing on an ultrawide viewport", () => {
    const desktop = getSceneLayout(1440, 900);
    const ultrawide = getSceneLayout(3440, 1440);

    expect(ultrawide.fov).toBe(desktop.fov);
    expect(ultrawide.camera[2]).toBe(desktop.camera[2]);
    expect(ultrawide.promptY).toBe(desktop.promptY);
  });

  it("scales separate TV layers around the same responsive pivot", () => {
    const pivot = 0.11;
    const scale = 0.8;
    const screenOrigin = 1.08;
    const modelOrigin = 0.2;

    expect(scaleCoordinateAroundPivot(screenOrigin, pivot, scale)).toBeCloseTo(0.886);
    expect(scaleCoordinateAroundPivot(modelOrigin, pivot, scale)).toBeCloseTo(0.182);
  });

  it("backs the camera away when a portrait viewport narrows the horizontal field of view", () => {
    const unfolded = getCameraFitDistance(1.4, 1, 1.2, 60);
    const coverScreen = getCameraFitDistance(1.4, 1, 0.46, 60);

    expect(coverScreen).toBeGreaterThan(unfolded * 2);
  });

  it("moves close enough for the physical screen to cover every viewport ratio", () => {
    const portraitCover = getCameraCoverDistance(1.4, 1, 0.46, 60);
    const landscapeCover = getCameraCoverDistance(1.4, 1, 1.6, 38);
    const portraitContain = getCameraFitDistance(1.4, 1, 0.46, 60);
    const landscapeContain = getCameraFitDistance(1.4, 1, 1.6, 38);

    expect(portraitCover).toBeLessThan(portraitContain);
    expect(landscapeCover).toBeLessThan(landscapeContain);
  });
});
