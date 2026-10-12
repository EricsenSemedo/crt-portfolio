import {
  Box3,
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";

// Shared by the fallback, the imported console (scripts/build-media-console.py) and
// basketball collisions. The case sits on legs shorter than the ball, so one box covers it.
export const TABLE_LAYOUT = {
  centerZ: -0.3, halfWidth: 3.35, halfDepth: 1.275, topY: 0.11, floorY: -1.14,
  topThickness: 0.11, caseInset: 0.1, legHeight: 0.42,
};

export interface TableAsset {
  group: Group;
  dispose: () => void;
}

interface TableMaterials {
  wood: MeshStandardMaterial;
  darkWood: MeshStandardMaterial;
}

export function createTableColliders() {
  const { centerZ, halfWidth, halfDepth, topY, floorY } = TABLE_LAYOUT;
  return [new Box3(new Vector3(-halfWidth, floorY, centerZ - halfDepth), new Vector3(halfWidth, topY, centerZ + halfDepth))];
}

export function createTable(): TableAsset {
  const group = new Group();
  group.name = "BasementTable";
  group.userData.assetKind = "furniture";
  group.userData.assetVariant = "media-console";

  const geometries: BufferGeometry[] = [];
  const materials = createTableMaterials();

  function add(name: string, geometry: BufferGeometry, position: [number, number, number], material: Material) {
    geometries.push(geometry);

    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    return mesh;
  }

  // Positions are relative to the tabletop, which the scene places at topY.
  const { halfWidth, halfDepth, topY, floorY, topThickness, caseInset, legHeight } = TABLE_LAYOUT;
  add("TableTop", new BoxGeometry(halfWidth * 2, topThickness, halfDepth * 2), [0, -topThickness / 2, 0], materials.wood);
  const caseHeight = topY - floorY - topThickness - legHeight;
  add("TableCase", new BoxGeometry((halfWidth - caseInset) * 2, caseHeight, (halfDepth - caseInset) * 2),
    [0, -topThickness - caseHeight / 2, 0], materials.darkWood);
  for (const [side, x] of [["Left", -halfWidth + 0.42], ["Right", halfWidth - 0.42]] as const) {
    for (const [end, z] of [["Front", halfDepth - 0.34], ["Back", -halfDepth + 0.34]] as const) {
      add(`TableLeg${end}${side}`, new CylinderGeometry(0.068, 0.032, legHeight, 12),
        [x, floorY - topY + legHeight / 2, z], materials.darkWood);
    }
  }

  return {
    group,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      Object.values(materials).forEach((material) => material.dispose());
    },
  };
}

function createTableMaterials(): TableMaterials {
  return {
    wood: new MeshStandardMaterial({
      color: "#5a3a24",
      roughness: 0.6,
      metalness: 0.02,
    }),
    darkWood: new MeshStandardMaterial({
      color: "#3a2416",
      roughness: 0.65,
      metalness: 0.02,
    }),
  };
}
