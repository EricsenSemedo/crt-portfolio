import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
  type Material,
} from "three";

export interface GameConsoleAsset {
  group: Group;
  dispose: () => void;
}

export function createGameConsole(): GameConsoleAsset {
  const group = new Group();
  group.name = "GameConsole";
  group.userData.assetKind = "prop";
  group.userData.assetVariant = "game-console";

  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [
    new MeshStandardMaterial({ color: "#3f4039", roughness: 0.86, metalness: 0.03 }),
    new MeshStandardMaterial({ color: "#20211f", roughness: 0.9, metalness: 0.02 }),
    new MeshStandardMaterial({ color: "#9a1e24", roughness: 0.62, metalness: 0.02 }),
    new MeshBasicMaterial({ color: "#ff2f3d" }),
  ];
  const [caseMaterial, darkMaterial, accentMaterial, ledMaterial] = materials;

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

  box("ConsoleBody", [1.7, 0.32, 1.16], [0, 0, 0], caseMaterial);
  box("ConsoleFrontBand", [1.62, 0.1, 0.08], [0, 0.02, 0.61], darkMaterial);
  box("ConsoleCartridgeSlot", [0.86, 0.05, 0.4], [-0.16, 0.19, -0.08], darkMaterial);
  box("ConsoleResetButton", [0.2, 0.04, 0.18], [0.54, 0.2, -0.08], accentMaterial);
  box("ConsolePowerButton", [0.2, 0.04, 0.18], [0.78, 0.2, -0.08], darkMaterial);
  box("ControllerPort1", [0.25, 0.12, 0.04], [-0.38, -0.04, 0.66], darkMaterial);
  box("ControllerPort2", [0.25, 0.12, 0.04], [-0.06, -0.04, 0.66], darkMaterial);

  const ledGeometry = new SphereGeometry(0.045, 16, 12);
  geometries.push(ledGeometry);
  const led = new Mesh(ledGeometry, ledMaterial);
  led.name = "ConsolePowerLed";
  led.position.set(0.74, 0.05, 0.66);
  group.add(led);

  const dialGeometry = new CylinderGeometry(0.08, 0.08, 0.035, 20);
  geometries.push(dialGeometry);
  const dial = new Mesh(dialGeometry, darkMaterial);
  dial.name = "ConsoleChannelDial";
  dial.position.set(0.5, 0.19, 0.34);
  dial.rotation.x = Math.PI / 2;
  dial.castShadow = true;
  group.add(dial);

  return {
    group,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
