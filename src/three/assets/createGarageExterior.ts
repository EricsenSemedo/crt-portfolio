import {
  BoxGeometry, BufferGeometry, Group, Mesh,
  MeshStandardMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace,
  TextureLoader, type Texture,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { disposeObjectTree } from "../disposeObjectTree";
import { createGarageTrees } from "./createGarageTrees";

// Houses across the street: x, front z, scale (negative mirrors), siding colour.
const STREET_HOUSES: Array<[number, number, number, string | null]> = [
  [4, -25.4, 0.9, null], [-16, -28, -0.9, "#c9b48f"],
];

/** Colonial houses built by scripts/build-street-house.py; lit windows are emissive. */
async function loadStreetHouses(url: string, groundY: number) {
  const { scene: source } = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
  const group = new Group();
  group.name = "StreetHouses";
  for (const [x, z, scale, siding] of STREET_HOUSES) {
    const house = source.clone(true);
    house.position.set(x, groundY, z);
    house.scale.set(scale, Math.abs(scale), Math.abs(scale));
    house.traverse(object => {
      if (!(object instanceof Mesh)) return;
      object.receiveShadow = true;
      const material = object.material as MeshStandardMaterial;
      material.envMapIntensity = 2;
      if (siding && material.name === "Painted lap siding") {
        object.material = material.clone();
        object.material.color.set(siding);
      }
    });
    group.add(house);
  }
  return { group, dispose: () => disposeObjectTree(group) };
}

export async function createGarageExterior() {
  const root = `${import.meta.env.BASE_URL}models/garage-sunset/`;
  const group = new Group();
  group.name = "GarageExterior";
  const textures: Texture[] = [];
  const materials: MeshStandardMaterial[] = [];
  const geometries: BufferGeometry[] = [];
  const batches = new Map<MeshStandardMaterial, BufferGeometry[]>();
  let trees: Awaited<ReturnType<typeof createGarageTrees>> | undefined;
  let houses: Awaited<ReturnType<typeof loadStreetHouses>> | undefined;
  function dispose() {
    trees?.dispose();
    houses?.dispose();
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    textures.forEach(t => t.dispose());
  }
  function material(color: string) {
    const m = new MeshStandardMaterial({ color, roughness: 0.9, envMapIntensity: 2 });
    materials.push(m);
    return m;
  }
  function box(size: [number, number, number], position: [number, number, number], m: MeshStandardMaterial) {
    const g = new BoxGeometry(...size);
    g.translate(...position);
    const parts = batches.get(m) ?? [];
    parts.push(g);
    batches.set(m, parts);
  }
  function mesh(g: BufferGeometry, m: MeshStandardMaterial) {
    geometries.push(g);
    const object = new Mesh(g, m);
    object.receiveShadow = true;
    group.add(object);
    return object;
  }
  async function texture(name: string, color: boolean, repeat: [number, number]) {
    const t = await new TextureLoader().loadAsync(root + name + ".jpg");
    textures.push(t);
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(...repeat);
    if (color) t.colorSpace = SRGBColorSpace;
    return t;
  }
  async function textured(slug: string, repeat: [number, number]) {
    const m = material("#ffffff");
    // allSettled keeps disposal behind every pending texture completion.
    const result = await Promise.allSettled([
      texture(slug + "-diff", true, repeat), texture(slug + "-nor_gl", false, repeat),
    ]);
    m.map = result[0].status === "fulfilled" ? result[0].value : null;
    m.normalMap = result[1].status === "fulfilled" ? result[1].value : null;
    m.normalScale.setScalar(0.65);
    return m;
  }
  function ground(width: number, depth: number, x: number, z: number, m: MeshStandardMaterial, y = -1.16) {
    const object = mesh(new PlaneGeometry(width, depth), m);
    object.rotation.x = -Math.PI / 2;
    object.position.set(x, y, z);
  }
  try {
    const [drive, road, grass, concrete] = await Promise.all([
      textured("asphalt_02", [2, 4]), textured("asphalt_02", [10, 2]),
      textured("leafy_grass", [24, 24]), textured("garage_floor", [3, 4]),
    ]);
    grass.color.set("#4b9b38");
    ground(100, 80, 0, -44, grass, -1.19);
    ground(9.1, 10.4, 0, -8.8, drive);
    ground(48, 5, 0, -16.5, road, -1.17);
    const curb = material("#9b9990");
    for (const x of [-4.6, 4.6]) box([0.16, 0.12, 10.5], [x, -1.13, -8.85], curb);
    for (const x of [-14.4, 14.4]) box([19, 0.18, 0.25], [x, -1.1, -14], curb);
    box([48, 0.16, 0.25], [0, -1.1, -19], curb);
    ground(48, 1.2, 0, -19.7, concrete, -1.12);
    ground(1.1, 4.5, 4, -22.4, concrete, -1.13);
    // Concrete drives up to each house's garage wing.
    ground(3.2, 5.2, -2.6, -22.8, concrete, -1.135);
    ground(3.2, 8.2, -9.4, -24.4, concrete, -1.135);

    for (const [m, parts] of batches) {
      const merged = mergeGeometries(parts);
      parts.forEach(g => g.dispose());
      mesh(merged, m).castShadow = true;
    }
    const [houseResult, treeResult] = await Promise.allSettled([
      loadStreetHouses(root + "street-house.glb", -1.19), createGarageTrees(root + "street-trees.webp", -1.19),
    ]);
    if (houseResult.status === "fulfilled") {
      houses = houseResult.value;
      group.add(houses.group);
    }
    if (treeResult.status === "fulfilled") {
      trees = treeResult.value;
      group.add(trees.group);
    }
    return { group, dispose };
  } catch {
    // Keep any completed architecture if an optional resource fails.
    return { group, dispose };
  }
}
