import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
  type Material,
} from "three";

// Shared by the fallback, imported model placement, and basketball collisions.
export const TABLE_LAYOUT = {
  centerZ: -0.3, halfWidth: 2.95, halfDepth: 1.275, topY: 0.11, floorY: -1.14,
  topThickness: 0.11, legX: 2.53, legZ: 0.98, legHalfWidth: 0.16, legHalfDepth: 0.11,
};

export interface TableAsset {
  group: Group;
  dispose: () => void;
}

interface TableMaterials {
  wood: MeshStandardMaterial;
  darkWood: MeshStandardMaterial;
}

export function createTable(): TableAsset {
  const group = new Group();
  group.name = "BasementTable";
  group.userData.assetKind = "furniture";
  group.userData.assetVariant = "long-table";

  const geometries: BufferGeometry[] = [];
  const materials = createTableMaterials();

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

  const { halfWidth, halfDepth, topY, floorY, topThickness, legX, legZ, legHalfWidth, legHalfDepth } = TABLE_LAYOUT;
  box("TableTop", [halfWidth * 2, topThickness, halfDepth * 2], [0, -topThickness / 2, 0], materials.wood);
  const legHeight = topY - floorY - topThickness;
  for (const [side, x] of [["Left", -legX], ["Right", legX]] as const) {
    for (const [end, z] of [["Front", legZ], ["Back", -legZ]] as const) {
      box(`TableLeg${end}${side}`, [legHalfWidth * 2, legHeight, legHalfDepth * 2],
        [x, -topThickness - legHeight / 2, z], materials.darkWood);
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
      color: "#6b5840",
      roughness: 0.78,
      metalness: 0.02,
    }),
    darkWood: new MeshStandardMaterial({
      color: "#33281d",
      roughness: 0.82,
      metalness: 0.02,
    }),
  };
}
