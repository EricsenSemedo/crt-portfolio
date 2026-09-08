import { MathUtils, type Vector3 } from "three";

// World coordinates: the open door is behind the TVs, the viewer is inside.
export const GARAGE_BOUNDS = { halfWidth: 4.8, doorwayZ: -3.6, frontZ: 10, floorY: -1.16, ceilingY: 4.32, raisedDoorY: 3.9, raisedDoorFrontZ: 1.005, raisedDoorHalfWidth: 4.4 };

export function containBasketball(position: Vector3, velocity: Vector3, radius: number) {
  const beneathDoor = position.z - radius <= GARAGE_BOUNDS.raisedDoorFrontZ
    && Math.abs(position.x) - radius <= GARAGE_BOUNDS.raisedDoorHalfWidth;
  const ceiling = (beneathDoor ? GARAGE_BOUNDS.raisedDoorY : GARAGE_BOUNDS.ceilingY) - radius;
  if (position.y > ceiling) {
    position.y = ceiling;
    if (velocity.y > 0) velocity.y *= -0.66;
  }
  const min = GARAGE_BOUNDS.doorwayZ + radius;
  // Keep the toy within reach even though the visible floor continues to the camera.
  const max = 3.2 - radius;
  if (position.z < min || position.z > max) {
    position.z = MathUtils.clamp(position.z, min, max);
    if ((position.z === min && velocity.z < 0) || (position.z === max && velocity.z > 0)) velocity.z *= -0.66;
  }
}
