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

export function getCameraCoverDistance(
  width: number,
  height: number,
  aspect: number,
  verticalFov: number,
  overscan = 0.96,
) {
  const verticalHalfFov = MathUtils.degToRad(verticalFov / 2);
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * Math.max(aspect, 0.01));
  const verticalDistance = height / 2 / Math.tan(verticalHalfFov);
  const horizontalDistance = width / 2 / Math.tan(horizontalHalfFov);
  return Math.min(verticalDistance, horizontalDistance) * overscan;
}

export function getSceneLayout(width: number, height: number): SceneLayout {
  const aspect = width / Math.max(height, 1);
  const portrait = aspect < 0.72;

  if (portrait) {
    return {
      portrait: true,
      camera: [0, 1.3, 9.3],
      target: [0, 0.65, -1.5],
      channelX: [-1.68, 0, 1.68],
      tvScale: 0.8,
      fov: 60,
      promptY: 2.7,
      ballStartX: -1.3,
      pixelRatioCap: 1.25,
    };
  }

  return {
    portrait: false,
    camera: [0, 1.3, 8.7],
    target: [0, 0.65, -1.5],
    channelX: [-2.06, 0, 2.1],
    tvScale: 1,
    fov: 42,
    promptY: 2.3,
    ballStartX: -2.88,
    pixelRatioCap: 1.75,
  };
}

