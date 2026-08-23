import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
  type Material,
} from "three";

export interface TableAsset {
  group: Group;
  dispose: () => void;
}

interface TableMaterials {
  wood: MeshStandardMaterial;
  darkWood: MeshStandardMaterial;
  edge: MeshStandardMaterial;
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

  box("TableTop", [5.8, 0.24, 1.72], [0, 0, 0], materials.wood);
  box("TableFrontEdge", [5.96, 0.18, 0.14], [0, -0.06, 0.93], materials.edge);
  box("TableBackEdge", [5.96, 0.18, 0.14], [0, -0.06, -0.93], materials.edge);
  box("TableLeftEdge", [0.14, 0.18, 1.78], [-3.02, -0.06, 0], materials.edge);
  box("TableRightEdge", [0.14, 0.18, 1.78], [3.02, -0.06, 0], materials.edge);

  box("TableLegFrontLeft", [0.24, 1.42, 0.24], [-2.55, -0.83, 0.64], materials.darkWood);
  box("TableLegFrontRight", [0.24, 1.42, 0.24], [2.55, -0.83, 0.64], materials.darkWood);
  box("TableLegBackLeft", [0.24, 1.42, 0.24], [-2.55, -0.83, -0.64], materials.darkWood);
  box("TableLegBackRight", [0.24, 1.42, 0.24], [2.55, -0.83, -0.64], materials.darkWood);

  box("TableLowerBraceFront", [5.1, 0.12, 0.12], [0, -1.24, 0.64], materials.edge);
  box("TableLowerBraceBack", [5.1, 0.12, 0.12], [0, -1.24, -0.64], materials.edge);

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
    edge: new MeshStandardMaterial({
      color: "#4a3927",
      roughness: 0.8,
      metalness: 0.02,
    }),
  };
}
