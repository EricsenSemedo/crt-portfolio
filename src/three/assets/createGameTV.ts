import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  Object3D,
  PlaneGeometry,
  PointLight,
  type BufferGeometry,
  type Material,
} from "three";
import { createCrtAssetMaterials, disposeMaterials } from "../materials";

export interface GameTVAsset {
  group: Group;
  screenAnchor: Object3D;
  screenPlane: Mesh;
  cameraTarget: Object3D;
  hoverLight: PointLight;
  dispose: () => void;
}

const BODY_WIDTH = 3.18;
const BODY_HEIGHT = 1.62;
const BODY_DEPTH = 1.02;
const FRONT_Z = BODY_DEPTH / 2;

export function createGameTV(): GameTVAsset {
  const materials = createCrtAssetMaterials();
  const group = new Group();
  group.name = "GameTV";
  group.userData.assetKind = "crt-tv";
  group.userData.assetVariant = "game";

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
  box("LowRearCase", [2.72, 1.18, 0.68], [0, 0.02, -0.44], materials.shellDark);
  box("FrontInset", [2.86, 1.28, 0.08], [0, 0.01, FRONT_Z + 0.03], materials.shellDark);

  const screenAnchor = new Object3D();
  screenAnchor.name = "ScreenAnchor";
  screenAnchor.position.set(-0.26, 0.1, FRONT_Z + 0.09);
  group.add(screenAnchor);

  box("ScreenBezel", [1.64, 0.98, 0.1], [-0.26, 0.1, FRONT_Z + 0.1], materials.bezel);
  box("GlassBulge", [1.42, 0.76, 0.08], [-0.26, 0.1, FRONT_Z + 0.16], materials.glass);

  const screenGeometry = new PlaneGeometry(1.32, 0.68);
  geometries.push(screenGeometry);
  const screenPlane = new Mesh(screenGeometry, materials.screen);
  screenPlane.name = "ScreenPlane";
  screenPlane.position.set(0, 0, 0.205);
  screenAnchor.add(screenPlane);

  const cameraTarget = new Object3D();
  cameraTarget.name = "CameraTarget";
  cameraTarget.position.set(-0.26, 0.1, FRONT_Z + 3.2);
  group.add(cameraTarget);

  const hoverLight = new PointLight("#22d3ee", 0.72, 2.8);
  hoverLight.name = "HoverLight";
  hoverLight.position.set(-0.26, 0.1, FRONT_Z + 0.42);
  group.add(hoverLight);

  box("CartridgeSlot", [0.72, 0.11, 0.05], [0.86, 0.53, FRONT_Z + 0.2], materials.rubber);
  box("InsertedCartridge", [0.5, 0.46, 0.16], [0.86, 0.84, 0.2], materials.label);
  box("CartridgeGrip", [0.38, 0.06, 0.05], [0.86, 0.63, FRONT_Z + 0.24], materials.metal);

  box("ControlDeck", [0.82, 0.54, 0.1], [0.86, 0.05, FRONT_Z + 0.13], materials.bezel);
  box("ControllerPort", [0.24, 0.14, 0.05], [0.68, -0.11, FRONT_Z + 0.21], materials.rubber);
  box("ControllerPort2", [0.24, 0.14, 0.05], [1.04, -0.11, FRONT_Z + 0.21], materials.rubber);

  const powerLed = cylinder("PowerLed", 0.045, 0.035, [0.53, 0.27, FRONT_Z + 0.22], materials.accent, 18);
  powerLed.rotation.x = Math.PI / 2;

  const resetButton = cylinder("ResetButton", 0.07, 0.04, [0.78, 0.28, FRONT_Z + 0.22], materials.metal, 20);
  resetButton.rotation.x = Math.PI / 2;

  const powerButton = cylinder("PowerButton", 0.08, 0.04, [1.05, 0.28, FRONT_Z + 0.22], materials.metal, 20);
  powerButton.rotation.x = Math.PI / 2;

  for (let index = 0; index < 4; index += 1) {
    box(
      `DPadSegment${index + 1}`,
      index % 2 === 0 ? [0.16, 0.05, 0.035] : [0.05, 0.16, 0.035],
      [0.62, -0.42, FRONT_Z + 0.205],
      materials.rubber,
    );
  }

  for (let index = 0; index < 2; index += 1) {
    const button = cylinder(
      `ActionButton${index + 1}`,
      0.06,
      0.035,
      [0.96 + index * 0.18, -0.42 + index * 0.04, FRONT_Z + 0.22],
      index === 0 ? materials.accent : materials.metal,
      18,
    );
    button.rotation.x = Math.PI / 2;
  }

  for (let index = 0; index < 5; index += 1) {
    box(
      `BottomVent${index + 1}`,
      [0.34, 0.024, 0.03],
      [-0.84 + index * 0.36, -0.63, FRONT_Z + 0.195],
      materials.rubber,
    );
  }

  box("LeftFoot", [0.46, 0.13, 0.4], [-1.04, -0.87, 0.16], materials.rubber);
  box("RightFoot", [0.46, 0.13, 0.4], [1.04, -0.87, 0.16], materials.rubber);

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
