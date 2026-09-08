import {
  BoxGeometry, BufferGeometry, DoubleSide, Group, Mesh,
  MeshStandardMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace,
  TextureLoader, type Texture,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createGarageTrees } from "./createGarageTrees";

export async function createGarageExterior() {
  const root = `${import.meta.env.BASE_URL}models/garage-sunset/`;
  const group = new Group();
  group.name = "GarageExterior";
  const textures: Texture[] = [];
  const materials: MeshStandardMaterial[] = [];
  const geometries: BufferGeometry[] = [];
  const batches = new Map<MeshStandardMaterial, BufferGeometry[]>();
  let trees: Awaited<ReturnType<typeof createGarageTrees>> | undefined;
  function dispose() {
    trees?.dispose();
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
    const [drive, road, grass, roof, concrete] = await Promise.all([
      textured("asphalt_02", [2, 4]), textured("asphalt_02", [10, 2]),
      textured("leafy_grass", [24, 24]), textured("roof_slates_02", [4, 2]),
      textured("garage_floor", [3, 4]),
    ]);
    grass.color.set("#4b9b38");
    ground(9.55, 13.6, 0, 3.2, concrete, -1.151);
    ground(100, 80, 0, -44, grass, -1.19);
    ground(9.1, 10.4, 0, -8.8, drive);
    ground(48, 5, 0, -16.5, road, -1.17);
    const curb = material("#9b9990");
    for (const x of [-4.6, 4.6]) box([0.16, 0.12, 10.5], [x, -1.13, -8.85], curb);
    for (const x of [-14.4, 14.4]) box([19, 0.18, 0.25], [x, -1.1, -14], curb);
    box([48, 0.16, 0.25], [0, -1.1, -19], curb);
    ground(48, 1.2, 0, -19.7, concrete, -1.12);
    ground(1.1, 4.5, 4, -22.4, concrete, -1.13);

    // A modest ranch house: actual depth, a low pitched roof, siding, eaves,
    // recessed windows, and porch posts instead of a flat triangular facade.
    const siding = material("#a4a093");
    const trim = material("#d2c7b1");
    const glass = material("#293943");
    glass.roughness = 0.25;
    glass.metalness = 0.35;
    const door = material("#615e51");
    box([8, 2.65, 4.5], [4, 0.165, -26.5], siding);
    for (let y = -1.05; y < 1.5; y += 0.16) box([8.04, 0.015, 0.025], [4, y, -24.235], trim);
    for (const x of [1.25, 6.75]) {
      box([1.65, 1.35, 0.1], [x, 0.25, -24.19], trim);
      box([1.43, 1.12, 0.11], [x, 0.25, -24.12], glass);
      box([0.07, 1.12, 0.12], [x, 0.25, -24.04], trim);
      box([1.43, 0.06, 0.12], [x, 0.25, -24.04], trim);
    }
    box([1.02, 2.05, 0.16], [4, -0.12, -24.15], trim);
    box([0.83, 1.94, 0.18], [4, -0.15, -24.04], door);
    for (const x of [2.9, 5.1]) box([0.13, 2.3, 0.13], [x, 0.05, -23.45], trim);
    box([2.5, 0.14, 1.15], [4, 1.26, -23.75], trim);
    box([2.5, 0.16, 1.1], [4, -1.04, -23.8], curb);
    // Two roof slopes, including UVs and normals for photographed shingles.
    for (const side of [-1, 1]) {
      const slope = mesh(new PlaneGeometry(8.6, 2.8), roof);
      slope.rotation.x = -Math.PI / 2 + side * 0.36;
      slope.position.set(4, 1.97, -26.5 + side * 1.31);
      slope.castShadow = true;
    }
    roof.side = DoubleSide;
    box([8.6, 0.14, 0.15], [4, 1.48, -23.87], trim);
    box([0.45, 1.2, 0.65], [6.5, 2.35, -27.2], material("#6d5345"));

    for (const [m, parts] of batches) {
      const merged = mergeGeometries(parts);
      parts.forEach(g => g.dispose());
      mesh(merged, m).castShadow = true;
    }
    trees = await createGarageTrees(root + "jacaranda.glb", -1.19);
    group.add(trees.group);
    return { group, dispose };
  } catch {
    // Keep any completed architecture if an optional resource fails.
    return { group, dispose };
  }
}
