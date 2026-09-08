import {
  BoxGeometry, BufferGeometry,
  Group, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  type Material,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GARAGE_BOUNDS } from "./garageBounds";

export function createGarageRoom() {
  const group = new Group();
  group.name = "GarageRoom";
  group.userData.assetKind = "scene";
  group.userData.assetVariant = "sunset-garage";
  const materials: Material[] = [];
  const geometries: BufferGeometry[] = [];
  const batches = new Map<Material, BufferGeometry[]>();
  function surface(color: string, unlit = false) {
    const material = unlit
      ? new MeshBasicMaterial({ color, fog: false })
      : new MeshStandardMaterial({ color, roughness: 0.93 });
    materials.push(material);
    return material;
  }
  function box(size: [number, number, number], position: [number, number, number], material: Material) {
    const geometry = new BoxGeometry(...size);
    geometry.translate(...position);
    const batch = batches.get(material) ?? [];
    batch.push(geometry);
    batches.set(material, batch);
  }
  function mesh(name: string, geometry: BufferGeometry, material: Material) {
    geometries.push(geometry);
    const object = new Mesh(geometry, material);
    object.name = name;
    group.add(object);
    return object;
  }

  const concrete = surface("#343336");
  const plaster = surface("#655746");
  const wood = surface("#453324");
  const metal = surface("#302e29");
  const seams = surface("#363330");
  const { halfWidth, doorwayZ, frontZ, floorY } = GARAGE_BOUNDS;
  box([halfWidth * 2, 0.1, frontZ - doorwayZ], [0, floorY - 0.05, (frontZ + doorwayZ) / 2], concrete);
  box([0.18, 5.6, frontZ - doorwayZ], [-halfWidth, 1.64, (frontZ + doorwayZ) / 2], plaster);
  box([0.18, 5.6, frontZ - doorwayZ], [halfWidth, 1.64, (frontZ + doorwayZ) / 2], plaster);
  box([9.6, 0.16, frontZ - doorwayZ], [0, 4.4, (frontZ + doorwayZ) / 2], metal);
  // Raised sectional door and jambs frame the exterior without a back wall.
  box([9.6, 0.55, 0.25], [0, 4.15, doorwayZ], wood);
  for (const x of [-4.45, 4.45]) {
    box([0.28, 5.1, 0.35], [x, 1.39, doorwayZ], wood);
    box([0.06, 0.08, 5], [x, 3.8, -1.2], metal);
  }
  for (let z = -3.2; z < 1; z += 0.65) box([8.8, 0.08, 0.61], [0, 3.94, z], metal);
  // Large concrete slabs, with the floor extending beneath the viewer.
  for (const x of [-2.4, 0, 2.4]) box([0.012, 0.002, 13.6], [x, floorY + 0.002, 3.2], seams);
  for (const z of [-1, 2.4, 5.8, 9.2]) box([9.6, 0.002, 0.012], [0, floorY + 0.003, z], seams);
  box([8.6, 0.045, 0.18], [0, floorY + 0.015, doorwayZ], metal);

  // A little storage on the side wall, clear of the three screens.
  for (const y of [1.1, 2.15]) {
    box([0.75, 0.09, 2.1], [-4.38, y, -1.8], wood);
    for (const z of [-2.55, -1.05]) box([0.08, 0.38, 0.09], [-4.62, y - 0.2, z], metal);
  }
  const cardboard = surface("#8b6946");
  box([0.52, 0.45, 0.65], [-4.36, 2.42, -2.35], cardboard);
  box([0.48, 0.32, 0.46], [-4.36, 2.35, -1.53], cardboard);
  const tape = surface("#aea080");
  box([0.53, 0.02, 0.12], [-4.36, 2.655, -2.35], tape);
  for (let i = 0; i < 5; i++) box([0.42, 0.3, 0.075], [-4.35, 1.29, -2.45 + i * 0.095], metal);

  // Static boxes share one draw call per material instead of one per detail.
  for (const [material, parts] of batches) {
    const merged = mergeGeometries(parts);
    parts.forEach(part => part.dispose());
    const object = mesh("GarageStructure", merged, material);
    object.castShadow = true;
    object.receiveShadow = true;
  }
  return { group, dispose() {
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
  } };
}
