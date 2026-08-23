import {
  Color,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Material,
} from "three";

export interface CrtAssetMaterials {
  shell: MeshStandardMaterial;
  shellDark: MeshStandardMaterial;
  bezel: MeshStandardMaterial;
  glass: MeshStandardMaterial;
  screen: MeshBasicMaterial;
  rubber: MeshStandardMaterial;
  metal: MeshStandardMaterial;
  label: MeshStandardMaterial;
  accent: MeshStandardMaterial;
}

export function createCrtAssetMaterials(): CrtAssetMaterials {
  return {
    shell: new MeshStandardMaterial({
      color: "#4a4a44",
      roughness: 0.82,
      metalness: 0.04,
    }),
    shellDark: new MeshStandardMaterial({
      color: "#252522",
      roughness: 0.88,
      metalness: 0.02,
    }),
    bezel: new MeshStandardMaterial({
      color: "#171717",
      roughness: 0.74,
      metalness: 0.03,
    }),
    glass: new MeshStandardMaterial({
      color: "#0b1517",
      emissive: new Color("#05313a"),
      emissiveIntensity: 0.24,
      roughness: 0.28,
      metalness: 0.08,
    }),
    screen: new MeshBasicMaterial({
      color: "#071316",
    }),
    rubber: new MeshStandardMaterial({
      color: "#101010",
      roughness: 0.93,
      metalness: 0.01,
    }),
    metal: new MeshStandardMaterial({
      color: "#6f7375",
      roughness: 0.45,
      metalness: 0.54,
    }),
    label: new MeshStandardMaterial({
      color: "#d7c9a3",
      roughness: 0.72,
      metalness: 0.02,
    }),
    accent: new MeshStandardMaterial({
      color: "#ef4444",
      emissive: new Color("#7f1d1d"),
      emissiveIntensity: 0.28,
      roughness: 0.48,
      metalness: 0.02,
    }),
  };
}

export function disposeMaterials(materials: CrtAssetMaterials) {
  Object.values(materials).forEach((material: Material) => material.dispose());
}
