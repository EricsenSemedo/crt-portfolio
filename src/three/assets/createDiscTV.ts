import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
  TorusGeometry,
  type BufferGeometry,
  type Material,
} from "three";
import { createCrtAssetMaterials, disposeMaterials } from "../materials";

export interface DiscTVAsset {
  group: Group;
  screenAnchor: Object3D;
  screenPlane: Mesh;
  cameraTarget: Object3D;
  hoverLight: PointLight;
  dispose: () => void;
}

const BODY_WIDTH = 2.42;
const BODY_HEIGHT = 1.68;
const BODY_DEPTH = 1.24;
const FRONT_Z = BODY_DEPTH / 2;

export function createDiscTV(): DiscTVAsset {
  const materials = createCrtAssetMaterials();
  const discMaterial = new MeshStandardMaterial({
    color: "#d8dde0",
    emissive: new Color("#164e63"),
    emissiveIntensity: 0.18,
    roughness: 0.2,
    metalness: 0.62,
  });
  const localMaterials = [discMaterial];

  const group = new Group();
  group.name = "DiscTV";
  group.userData.assetKind = "crt-tv";
  group.userData.assetVariant = "disc";

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
    radialSegments = 32,
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
  box("RearCaseHump", [1.92, 1.22, 0.9], [-0.06, 0.02, -0.5], materials.shellDark);
  box("FrontInset", [2.12, 1.38, 0.08], [-0.04, 0.02, FRONT_Z + 0.03], materials.shellDark);

  const screenAnchor = new Object3D();
  screenAnchor.name = "ScreenAnchor";
  screenAnchor.position.set(-0.32, 0.19, FRONT_Z + 0.09);
  group.add(screenAnchor);

  box("ScreenBezel", [1.46, 0.92, 0.1], [-0.32, 0.19, FRONT_Z + 0.1], materials.bezel);
  box("GlassBulge", [1.22, 0.68, 0.08], [-0.32, 0.19, FRONT_Z + 0.16], materials.glass);

  const screenGeometry = new PlaneGeometry(1.13, 0.59);
  geometries.push(screenGeometry);
  const screenPlane = new Mesh(screenGeometry, materials.screen);
  screenPlane.name = "ScreenPlane";
  screenPlane.position.set(0, 0, 0.205);
  screenAnchor.add(screenPlane);

  const cameraTarget = new Object3D();
  cameraTarget.name = "CameraTarget";
  cameraTarget.position.set(-0.32, 0.19, FRONT_Z + 3.2);
  group.add(cameraTarget);

  const hoverLight = new PointLight("#67e8f9", 0.68, 2.8);
  hoverLight.name = "HoverLight";
  hoverLight.position.set(-0.32, 0.19, FRONT_Z + 0.42);
  group.add(hoverLight);

  box("DiscControlPanel", [0.36, 1.08, 0.12], [0.82, 0.08, FRONT_Z + 0.12], materials.bezel);
  box("DiscTray", [1.16, 0.14, 0.06], [-0.28, -0.55, FRONT_Z + 0.2], materials.rubber);
  box("DiscTrayButton", [0.12, 0.08, 0.045], [0.72, -0.55, FRONT_Z + 0.23], materials.accent);
  box("DiscFormatBadge", [0.34, 0.08, 0.035], [-0.76, -0.69, FRONT_Z + 0.205], materials.label);

  const compactDisc = cylinder("CompactDisc", 0.31, 0.028, [-0.28, -0.56, FRONT_Z + 0.25], discMaterial, 48);
  compactDisc.rotation.x = Math.PI / 2;

  const discHub = cylinder("CompactDiscHub", 0.07, 0.032, [-0.28, -0.56, FRONT_Z + 0.27], materials.glass, 32);
  discHub.rotation.x = Math.PI / 2;

  const powerButton = cylinder("PowerButton", 0.09, 0.06, [0.82, 0.43, FRONT_Z + 0.22], materials.accent);
  powerButton.rotation.x = Math.PI / 2;

  for (let index = 0; index < 3; index += 1) {
    box(
      `DiscModeButton${index + 1}`,
      [0.08, 0.05, 0.04],
      [0.71 + index * 0.11, 0.16, FRONT_Z + 0.21],
      materials.metal,
    );
  }

  for (let index = 0; index < 6; index += 1) {
    box(
      `SideSpeakerVent${index + 1}`,
      [0.24, 0.024, 0.03],
      [0.82, -0.17 - index * 0.06, FRONT_Z + 0.205],
      materials.rubber,
    );
  }

  addLoopAntenna(group, geometries, materials.metal);
  addDiscHighlights(group, geometries, materials.label);

  box("LeftFoot", [0.38, 0.13, 0.44], [-0.74, -0.9, 0.18], materials.rubber);
  box("RightFoot", [0.38, 0.13, 0.44], [0.74, -0.9, 0.18], materials.rubber);

  return {
    group,
    screenAnchor,
    screenPlane,
    cameraTarget,
    hoverLight,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      disposeMaterials(materials);
      localMaterials.forEach((material) => material.dispose());
    },
  };
}

function addLoopAntenna(group: Group, geometries: BufferGeometry[], material: Material) {
  const baseGeometry = new CylinderGeometry(0.1, 0.14, 0.08, 24);
  geometries.push(baseGeometry);
  const base = new Mesh(baseGeometry, material);
  base.name = "LoopAntennaBase";
  base.position.set(0.42, 0.88, -0.05);
  base.castShadow = true;
  group.add(base);

  const loopGeometry = new TorusGeometry(0.28, 0.014, 10, 36);
  geometries.push(loopGeometry);
  const loop = new Mesh(loopGeometry, material);
  loop.name = "SignalLoopAntenna";
  loop.position.set(0.42, 1.16, -0.05);
  loop.rotation.x = Math.PI / 2;
  loop.castShadow = true;
  group.add(loop);
}

function addDiscHighlights(group: Group, geometries: BufferGeometry[], material: Material) {
  for (let index = 0; index < 3; index += 1) {
    const geometry = new BoxGeometry(0.16 + index * 0.06, 0.012, 0.018);
    geometries.push(geometry);
    const mesh = new Mesh(geometry, material);
    mesh.name = `DiscReflection${index + 1}`;
    mesh.position.set(-0.36 + index * 0.12, -0.46 - index * 0.04, FRONT_Z + 0.285);
    mesh.rotation.z = -0.34;
    mesh.castShadow = true;
    group.add(mesh);
  }
}
