import {
  BoxGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";

export interface ControllerAsset {
  group: Group;
  dispose: () => void;
}

export function createController(): ControllerAsset {
  const group = new Group();
  group.name = "WiredController";
  group.userData.assetKind = "prop";
  group.userData.assetVariant = "wired-controller";

  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [
    new MeshStandardMaterial({ color: "#222426", roughness: 0.88, metalness: 0.02 }),
    new MeshStandardMaterial({ color: "#0f1011", roughness: 0.94, metalness: 0.01 }),
    new MeshStandardMaterial({ color: "#b82028", roughness: 0.58, metalness: 0.02 }),
    new MeshStandardMaterial({ color: "#d7d0bb", roughness: 0.7, metalness: 0.02 }),
  ];
  const [bodyMaterial, rubberMaterial, buttonMaterial, labelMaterial] = materials;

  const bodyGeometry = new CapsuleGeometry(0.34, 1.12, 8, 24);
  geometries.push(bodyGeometry);
  const body = new Mesh(bodyGeometry, bodyMaterial);
  body.name = "ControllerBody";
  body.scale.set(1.42, 0.28, 0.36);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

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

  const dPad = new Group();
  dPad.name = "ControllerDPad";
  dPad.position.set(-0.44, 0.08, 0.14);
  group.add(dPad);
  dPad.add(createBoxMesh("ControllerDPadHorizontal", [0.36, 0.11, 0.06], [0, 0, 0], rubberMaterial));
  dPad.add(createBoxMesh("ControllerDPadVertical", [0.11, 0.36, 0.06], [0, 0, 0], rubberMaterial));

  addButton("ControllerButtonA", [0.48, 0.1, 0.17]);
  addButton("ControllerButtonB", [0.72, 0.1, 0.17]);
  box("ControllerSelect", [0.18, 0.06, 0.04], [-0.1, -0.1, 0.17], labelMaterial);
  box("ControllerStart", [0.18, 0.06, 0.04], [0.14, -0.1, 0.17], labelMaterial);

  const cordCurve = new CatmullRomCurve3([
    new Vector3(0, 0.26, 0.03),
    new Vector3(0.04, 0.58, -0.04),
    new Vector3(-0.16, 0.86, -0.08),
    new Vector3(-0.04, 1.16, -0.02),
  ]);
  const cordGeometry = new TubeGeometry(cordCurve, 28, 0.022, 10, false);
  geometries.push(cordGeometry);
  const cord = new Mesh(cordGeometry, rubberMaterial);
  cord.name = "ControllerCord";
  cord.castShadow = true;
  group.add(cord);

  function addButton(name: string, position: [number, number, number]) {
    const geometry = new CylinderGeometry(0.085, 0.085, 0.055, 24);
    geometries.push(geometry);
    const button = new Mesh(geometry, buttonMaterial);
    button.name = name;
    button.position.set(...position);
    button.rotation.x = Math.PI / 2;
    button.castShadow = true;
    group.add(button);
  }

  function createBoxMesh(
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
    return mesh;
  }

  return {
    group,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
