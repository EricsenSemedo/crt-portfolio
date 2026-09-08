import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { containBasketball, GARAGE_BOUNDS } from "../garageBounds";

describe("garage basketball boundary", () => {
  it("keeps the whole ball inside the open doorway even after a fast step", () => {
    const position = new Vector3(0, -0.68, -8);
    const velocity = new Vector3(1, 2, -14);
    containBasketball(position, velocity, 0.41);
    expect(position.z - 0.41).toBeCloseTo(GARAGE_BOUNDS.doorwayZ);
    expect(velocity.z).toBeGreaterThan(0);
    expect(velocity.x).toBe(1);
    expect(velocity.y).toBe(2);
  });
  it("does not turn an already returning ball back outside", () => {
    const position = new Vector3(0, -0.68, -4);
    const velocity = new Vector3(0, 0, 3);
    containBasketball(position, velocity, 0.41);
    expect(velocity.z).toBe(3);
  });
});
