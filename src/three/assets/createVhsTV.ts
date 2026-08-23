import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  Object3D,
  PlaneGeometry,
  PointLight,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";
import { createCrtAssetMaterials, disposeMaterials } from "../materials";

export interface VhsTVAsset {
  group: Group;
  screenAnchor: Object3D;
  screenPlane: Mesh;
  cameraTarget: Object3D;
  hoverLight: PointLight;
  dispose: () => void;
}

const BODY_WIDTH = 2.75;
const BODY_HEIGHT = 1.92;
const BODY_DEPTH = 1.08;
const FRONT_Z = BODY_DEPTH / 2;

export function createVhsTV(): VhsTVAsset {
  const materials = createCrtAssetMaterials();
  const group = new Group();
  group.name = "VhsTV";
  group.userData.assetKind = "crt-tv";
  group.userData.assetVariant = "vhs";

  const geometries: BufferGeometry[] = [];

  function box(
    name: string,
    size: [number, number, number],
    position: [number, number, number],
    material: Material,
  ) {
    const geometry = new BoxGeometry(...size);
    geometries.push(geometry);
    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function cylinder(
    name: string,
    radius: number,
    depth: number,
    position: [number, number, number],
    material: Material,
    radialSegments = 24,
  ) {
    const geometry = new CylinderGeometry(radius, radius, depth, radialSegments);
    geometries.push(geometry);
    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  box("ShellBody", [BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH], [0, 0, 0], materials.shell);
  box("RearCaseHump", [2.28, 1.52, 0.72], [-0.1, 0.04, -0.48], materials.shellDark);
  box("FrontInset", [2.44, 1.62, 0.08], [-0.08, 0.06, FRONT_Z + 0.03], materials.shellDark);

  const screenAnchor = new Object3D();
  screenAnchor.name = "ScreenAnchor";
  screenAnchor.position.set(-0.35, 0.11, FRONT_Z + 0.09);
  group.add(screenAnchor);

  box("ScreenBezel", [1.66, 1.1, 0.1], [-0.35, 0.11, FRONT_Z + 0.1], materials.bezel);
  box("GlassBulge", [1.43, 0.88, 0.08], [-0.35, 0.11, FRONT_Z + 0.16], materials.glass);

  const screenGeometry = new PlaneGeometry(1.34, 0.78);
  geometries.push(screenGeometry);
  const screenPlane = new Mesh(screenGeometry, materials.screen);
  screenPlane.name = "ScreenPlane";
  screenPlane.position.set(0, 0, 0.205);
  screenAnchor.add(screenPlane);

  const cameraTarget = new Object3D();
  cameraTarget.name = "CameraTarget";
  cameraTarget.position.set(-0.35, 0.11, FRONT_Z + 3.2);
  group.add(cameraTarget);

  const hoverLight = new PointLight("#22d3ee", 0.7, 2.8);
  hoverLight.name = "HoverLight";
  hoverLight.position.set(-0.35, 0.11, FRONT_Z + 0.42);
  group.add(hoverLight);

  box("RightControlPanel", [0.46, 1.32, 0.12], [0.94, 0.08, FRONT_Z + 0.12], materials.bezel);
  box("VhsTapeSlot", [0.5, 0.1, 0.04], [0.94, 0.53, FRONT_Z + 0.2], materials.rubber);
  box("VhsSlotLabel", [0.36, 0.08, 0.035], [0.94, 0.38, FRONT_Z + 0.205], materials.label);

  const tuningKnob = cylinder("TuningKnob", 0.13, 0.08, [0.94, 0.08, FRONT_Z + 0.23], materials.metal);
  tuningKnob.rotation.x = Math.PI / 2;

  const volumeKnob = cylinder("VolumeKnob", 0.1, 0.07, [0.94, -0.23, FRONT_Z + 0.22], materials.metal);
  volumeKnob.rotation.x = Math.PI / 2;

  for (let index = 0; index < 4; index += 1) {
    box(
      `ChannelButton${index + 1}`,
      [0.08, 0.05, 0.04],
      [0.77 + index * 0.11, -0.49, FRONT_Z + 0.21],
      index === 0 ? materials.accent : materials.metal,
    );
  }

  for (let index = 0; index < 7; index += 1) {
    box(
      `SpeakerVent${index + 1}`,
      [0.31, 0.025, 0.03],
      [0.94, -0.67 - index * 0.055, FRONT_Z + 0.205],
      materials.rubber,
    );
  }

  addAntenna(group, geometries, materials.metal);
  addWearMarks(box, materials.label);

  box("LeftFoot", [0.42, 0.14, 0.42], [-0.82, -1.03, 0.18], materials.rubber);
  box("RightFoot", [0.42, 0.14, 0.42], [0.84, -1.03, 0.18], materials.rubber);

  return {
    group,
    screenAnchor,
    screenPlane,
    cameraTarget,
    hoverLight,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      disposeMaterials(materials);
    },
  };
}

function addAntenna(group: Group, geometries: BufferGeometry[], material: Material) {
  const baseGeometry = new CylinderGeometry(0.12, 0.16, 0.09, 24);
  geometries.push(baseGeometry);
  const base = new Mesh(baseGeometry, material);
  base.name = "AntennaBase";
  base.position.set(-0.12, 1.0, -0.08);
  base.castShadow = true;
  group.add(base);

  addRod("LeftRabbitEar", [-0.18, 1.03, -0.08], [-0.92, 1.76, -0.19], group, geometries, material);
  addRod("RightRabbitEar", [-0.06, 1.03, -0.08], [0.58, 1.73, -0.14], group, geometries, material);
}

function addRod(
  name: string,
  from: [number, number, number],
  to: [number, number, number],
  group: Group,
  geometries: BufferGeometry[],
  material: Material,
) {
  const start = new Vector3(...from);
  const end = new Vector3(...to);
  const direction = new Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new CylinderGeometry(0.014, 0.018, length, 12);
  geometries.push(geometry);

  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize()));
  mesh.castShadow = true;
  group.add(mesh);
}

function addWearMarks(
  box: (
    name: string,
    size: [number, number, number],
    position: [number, number, number],
    material: Material,
  ) => Mesh,
  material: Material,
) {
  const marks: Array<[[number, number, number], [number, number, number]]> = [
    [[0.36, 0.018, 0.018], [-0.92, 0.78, FRONT_Z + 0.19]],
    [[0.24, 0.016, 0.018], [-0.02, -0.76, FRONT_Z + 0.19]],
    [[0.18, 0.014, 0.018], [1.08, 0.74, FRONT_Z + 0.2]],
    [[0.3, 0.016, 0.018], [-1.02, -0.54, FRONT_Z + 0.19]],
  ];

  marks.forEach(([size, position], index) => {
    const mark = box(`ShellScuff${index + 1}`, size, position, material);
    mark.rotation.z = index % 2 === 0 ? -0.08 : 0.07;
  });
}
