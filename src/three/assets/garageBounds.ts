import { MathUtils, type Vector3 } from "three";

// World coordinates: the open door is behind the TVs, the viewer is inside.
export const GARAGE_BOUNDS = { halfWidth: 4.8, doorwayZ: -3.6, frontZ: 10, floorY: -1.16 };

export function containBasketball(position: Vector3, velocity: Vector3, radius: number) {
  const min = GARAGE_BOUNDS.doorwayZ + radius;
  // Keep the toy within reach even though the visible floor continues to the camera.
  const max = 3.2 - radius;
  if (position.z < min || position.z > max) {
    position.z = MathUtils.clamp(position.z, min, max);
    if ((position.z === min && velocity.z < 0) || (position.z === max && velocity.z > 0)) velocity.z *= -0.66;
  }
}
