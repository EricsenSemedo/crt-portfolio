import {
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  type BufferGeometry,
  type Material,
} from "three";

export interface BasketballAsset {
  group: Group;
  dispose: () => void;
}

export function createBasketball(): BasketballAsset {
  const group = new Group();
  group.name = "Basketball";
  group.userData.assetKind = "prop";
  group.userData.assetVariant = "basketball";

  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [
    new MeshStandardMaterial({ color: "#c85b1e", roughness: 0.78, metalness: 0.01 }),
    new MeshStandardMaterial({ color: "#19130f", roughness: 0.88, metalness: 0.01 }),
  ];
  const [ballMaterial, stripeMaterial] = materials;

  const bodyGeometry = new SphereGeometry(0.44, 40, 28);
  geometries.push(bodyGeometry);
  const body = new Mesh(bodyGeometry, ballMaterial);
  body.name = "BasketballBody";
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  addStripe("BasketballStripe1", [Math.PI / 2, 0, 0]);
  addStripe("BasketballStripe2", [0, Math.PI / 2, 0]);
  addStripe("BasketballStripe3", [0, 0, Math.PI / 2]);
  addStripe("BasketballStripe4", [0.44, 0, Math.PI / 2]);

  function addStripe(name: string, rotation: [number, number, number]) {
    const geometry = new TorusGeometry(0.445, 0.012, 8, 64);
    geometries.push(geometry);
    const stripe = new Mesh(geometry, stripeMaterial);
    stripe.name = name;
    stripe.rotation.set(...rotation);
    stripe.castShadow = true;
    group.add(stripe);
  }

  return {
    group,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
