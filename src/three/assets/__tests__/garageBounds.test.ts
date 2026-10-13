import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { containBasketball, createDoorJambColliders, GARAGE_BOUNDS } from "../garageBounds";

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
  it.each([-1, 1])("bounces off the inside face of the side wall (side %i)", (side) => {
    const position = new Vector3(side * 6, -0.68, 0);
    const velocity = new Vector3(side * 5, 0, 0);
    containBasketball(position, velocity, 0.41);
    expect(Math.abs(position.x) + 0.41).toBeCloseTo(GARAGE_BOUNDS.halfWidth - GARAGE_BOUNDS.wallThickness / 2);
    expect(Math.sign(velocity.x)).toBe(-side);
  });
  it("lets the ball cross the room between the walls untouched", () => {
    const position = new Vector3(4, -0.68, 0);
    const velocity = new Vector3(5, 0, 0);
    containBasketball(position, velocity, 0.41);
    expect(position.x).toBe(4);
    expect(velocity.x).toBe(5);
  });
  it("puts a collider on each door jamb at the doorway", () => {
    const jambs = createDoorJambColliders();
    expect(jambs.map((jamb) => Math.sign(jamb.getCenter(new Vector3()).x))).toEqual([-1, 1]);
    for (const jamb of jambs) expect(jamb.containsPoint(new Vector3(jamb.getCenter(new Vector3()).x, 0, GARAGE_BOUNDS.doorwayZ))).toBe(true);
  });

});
