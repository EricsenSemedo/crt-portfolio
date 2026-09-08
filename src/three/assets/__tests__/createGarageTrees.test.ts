import { afterEach, expect, it, vi } from "vitest";
import { Box3, BoxGeometry, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Texture, Vector3 } from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createGarageTrees } from "../createGarageTrees";

afterEach(() => vi.restoreAllMocks());

it("grounds every rotated instance and releases shared model resources once", async () => {
  const texture = new Texture();
  const material = new MeshStandardMaterial({ map: texture, normalMap: texture });
  const geometry = new BoxGeometry(2, 6, 2).translate(5, 1, -3);
  const source = new Group();
  source.position.set(2, 3, -1);
  source.scale.setScalar(0.4);
  source.add(new Mesh(geometry, material), new Mesh(geometry, material));
  vi.spyOn(GLTFLoader.prototype, "loadAsync").mockResolvedValue({ scene: source } as GLTF);
  const resourceDisposals = [texture, material, geometry].map(resource => vi.spyOn(resource, "dispose"));
  const trees = await createGarageTrees("test.glb", -1.19);
  const batches = trees.group.children as InstancedMesh[];
  const instanceDisposals = batches.map(batch => vi.spyOn(batch, "dispose"));
  const matrix = new Matrix4();
  geometry.computeBoundingBox();
  for (const batch of batches) {
    expect(batch.geometry).toBe(geometry);
    for (let index = 0; index < batch.count; index++) {
      batch.getMatrixAt(index, matrix);
      const bounds = new Box3().copy(geometry.boundingBox!).applyMatrix4(matrix);
      expect(bounds.min.y).toBeCloseTo(-1.23, 5);
      if (index === 0) {
        const center = bounds.getCenter(new Vector3());
        expect(center.x).toBeCloseTo(-7);
        expect(center.z).toBeCloseTo(-22);
        expect(bounds.max.y - bounds.min.y).toBeCloseTo(7);
      }
    }
  }
  trees.dispose();
  for (const dispose of [...resourceDisposals, ...instanceDisposals]) expect(dispose).toHaveBeenCalledTimes(1);
});
