import { Box3, MathUtils, Vector3 } from "three";

// World coordinates: the open door is behind the TVs, the viewer is inside.
export const GARAGE_BOUNDS = {
  halfWidth: 4.8, wallThickness: 0.18, doorwayZ: -3.6, frontZ: 10, floorY: -1.16, ceilingY: 4.32,
  raisedDoorY: 3.9, raisedDoorFrontZ: 1.005, raisedDoorHalfWidth: 4.4, jambX: 4.45,
};
// The door jambs stand just inside the side walls at the doorway.
export const DOOR_JAMB = { width: 0.28, depth: 0.35, height: 5.1, centerY: 1.39 };

/** The jambs, for the ball to bounce off when it rolls into a back corner. */
export function createDoorJambColliders() {
  return [-GARAGE_BOUNDS.jambX, GARAGE_BOUNDS.jambX].map((x) => new Box3().setFromCenterAndSize(
    new Vector3(x, DOOR_JAMB.centerY, GARAGE_BOUNDS.doorwayZ),
    new Vector3(DOOR_JAMB.width, DOOR_JAMB.height, DOOR_JAMB.depth),
  ));
}

export function containBasketball(position: Vector3, velocity: Vector3, radius: number) {
  const beneathDoor = position.z - radius <= GARAGE_BOUNDS.raisedDoorFrontZ
    && Math.abs(position.x) - radius <= GARAGE_BOUNDS.raisedDoorHalfWidth;
  const ceiling = (beneathDoor ? GARAGE_BOUNDS.raisedDoorY : GARAGE_BOUNDS.ceilingY) - radius;
  if (position.y > ceiling) {
    position.y = ceiling;
    if (velocity.y > 0) velocity.y *= -0.66;
  }
  // Wall to wall: the ball bounces off the inside face of each side wall.
  const side = GARAGE_BOUNDS.halfWidth - GARAGE_BOUNDS.wallThickness / 2 - radius;
  if (Math.abs(position.x) > side) {
    position.x = MathUtils.clamp(position.x, -side, side);
    if (Math.sign(velocity.x) === Math.sign(position.x)) velocity.x *= -0.66;
  }
  const min = GARAGE_BOUNDS.doorwayZ + radius;
  // Keep the toy within reach even though the visible floor continues to the camera.
  const max = 3.2 - radius;
  if (position.z < min || position.z > max) {
    position.z = MathUtils.clamp(position.z, min, max);
    if ((position.z === min && velocity.z < 0) || (position.z === max && velocity.z > 0)) velocity.z *= -0.66;
  }
}
