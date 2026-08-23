import { MathUtils } from "three";

export interface SceneLayout {
  portrait: boolean;
  camera: [number, number, number];
  target: [number, number, number];
  channelX: [number, number, number];
  tvScale: number;
  fov: number;
  promptY: number;
  ballStartX: number;
  pixelRatioCap: number;
}

export interface HorizontalBounds {
  min: number;
  max: number;
}

export function scaleCoordinateAroundPivot(value: number, pivot: number, scale: number) {
  return pivot + (value - pivot) * scale;
}

export function getCameraFitDistance(
  width: number,
  height: number,
  aspect: number,
  verticalFov: number,
  margin = 1.08,
) {
  const verticalHalfFov = MathUtils.degToRad(verticalFov / 2);
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * Math.max(aspect, 0.01));
  const verticalDistance = height / 2 / Math.tan(verticalHalfFov);
  const horizontalDistance = width / 2 / Math.tan(horizontalHalfFov);
  return Math.max(verticalDistance, horizontalDistance) * margin;
}

export function getSceneLayout(width: number, height: number): SceneLayout {
  const aspect = width / Math.max(height, 1);
  const portrait = aspect < 0.72;

  if (portrait) {
    return {
      portrait: true,
      camera: [0, 1.9, 8.8],
      target: [0, 0.18, -0.4],
      channelX: [-1.38, 0, 1.38],
      tvScale: 0.8,
      fov: 60,
      promptY: 2.7,
      ballStartX: -1.3,
      pixelRatioCap: 1.25,
    };
  }

  return {
    portrait: false,
    camera: [0, 1.82, 7.55],
    target: [0, 0.05, -0.4],
    channelX: [-1.82, 0, 1.84],
    tvScale: 1,
    fov: aspect > 2 ? 34 : 38,
    promptY: 2.3,
    ballStartX: -2.88,
    pixelRatioCap: 1.75,
  };
}

export function getBasketballHorizontalBounds(
  layout: SceneLayout,
  aspect: number,
  ballZ: number,
  radius: number,
): HorizontalBounds {
  const depth = Math.max(layout.camera[2] - ballZ, 0.1);
  const visibleHalfWidth = Math.tan(MathUtils.degToRad(layout.fov / 2)) * depth * aspect;
  const worldLimit = 4.8 - radius;
  const viewportLimit = Math.max(radius, visibleHalfWidth - radius * 1.65 - 0.18);
  const limit = Math.min(worldLimit, viewportLimit);
  return { min: -limit, max: limit };
}
