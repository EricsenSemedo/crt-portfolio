import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
  type Material,
} from "three";

export interface BasementRoomAsset {
  group: Group;
  dispose: () => void;
}

interface BasementRoomMaterials {
  floor: MeshStandardMaterial;
  wall: MeshStandardMaterial;
  trim: MeshStandardMaterial;
  detail: MeshStandardMaterial;
}

export function createBasementRoom(): BasementRoomAsset {
  const group = new Group();
  group.name = "BasementRoom";
  group.userData.assetKind = "scene";
  group.userData.assetVariant = "basement-room";

  const geometries: BufferGeometry[] = [];
  const materials = createBasementRoomMaterials();

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
    mesh.receiveShadow = true;
    group.add(mesh);

    return mesh;
  }

  box("FloorPlane", [9.6, 0.08, 6.4], [0, -1.2, 0], materials.floor);
  box("BackWall", [9.6, 3.4, 0.08], [0, 0.46, -3.2], materials.wall);
  box("LeftWall", [0.08, 3.4, 6.4], [-4.8, 0.46, 0], materials.wall);
  box("RightWall", [0.08, 3.4, 6.4], [4.8, 0.46, 0], materials.wall);

  addFloorGrid(box, materials.detail);
  addWallPanels(box, materials.trim);

  return {
    group,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      Object.values(materials).forEach((material) => material.dispose());
    },
  };
}

function createBasementRoomMaterials(): BasementRoomMaterials {
  return {
    floor: new MeshStandardMaterial({
      color: "#202020",
      roughness: 0.9,
      metalness: 0.01,
    }),
    wall: new MeshStandardMaterial({
      color: "#1a1a1a",
      roughness: 0.86,
      metalness: 0.02,
    }),
    trim: new MeshStandardMaterial({
      color: "#111111",
      roughness: 0.82,
      metalness: 0.02,
    }),
    detail: new MeshStandardMaterial({
      color: "#3a3a3a",
      roughness: 0.94,
      metalness: 0.01,
    }),
  };
}

function addFloorGrid(
  box: (
    name: string,
    size: [number, number, number],
    position: [number, number, number],
    material: Material,
  ) => Mesh,
  material: Material,
) {
  for (let index = 0; index < 7; index += 1) {
    box(`FloorGridLong${index + 1}`, [0.024, 0.012, 6.2], [-3.6 + index * 1.2, -1.15, 0], material);
  }

  for (let index = 0; index < 5; index += 1) {
    box(`FloorGridCross${index + 1}`, [9.4, 0.012, 0.024], [0, -1.145, -2.4 + index * 1.2], material);
  }

  box("FloorGrid", [9.2, 0.014, 0.03], [0, -1.14, -0.02], material);
}

function addWallPanels(
  box: (
    name: string,
    size: [number, number, number],
    position: [number, number, number],
    material: Material,
  ) => Mesh,
  material: Material,
) {
  box("WallPanel1", [1.7, 1.05, 0.035], [-2.8, 0.48, -3.13], material);
  box("WallPanel2", [1.7, 1.05, 0.035], [-0.92, 0.48, -3.13], material);
  box("WallPanel3", [1.7, 1.05, 0.035], [0.96, 0.48, -3.13], material);
  box("WallPanel4", [1.7, 1.05, 0.035], [2.84, 0.48, -3.13], material);
  box("BackWallBaseboard", [9.45, 0.16, 0.05], [0, -1.03, -3.1], material);
  box("LeftWallBaseboard", [0.05, 0.16, 6.25], [-4.72, -1.03, 0], material);
  box("RightWallBaseboard", [0.05, 0.16, 6.25], [4.72, -1.03, 0], material);
}
