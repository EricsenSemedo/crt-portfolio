import { describe, expect, it } from "vitest";
import { getBasketballHorizontalBounds, getSceneLayout } from "../responsiveScene";

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
});
