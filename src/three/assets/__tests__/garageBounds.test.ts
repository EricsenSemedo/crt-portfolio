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
  it("bounces a fast upward throw below the raised garage door", () => {
    const position = new Vector3(0, 6, 0);
    const velocity = new Vector3(1, 18, 0);
    containBasketball(position, velocity, 0.41);
    expect(position.y + 0.41).toBeCloseTo(3.9);
    expect(velocity.y).toBeLessThan(0);
  });
  it("bounces below the roof behind the raised door without reversing a falling ball", () => {
    const position = new Vector3(0, 6, 2);
    const velocity = new Vector3(0, -2, 0);
    containBasketball(position, velocity, 0.41);
    expect(position.y + 0.41).toBeCloseTo(4.32);
    expect(velocity.y).toBe(-2);
  });

});
