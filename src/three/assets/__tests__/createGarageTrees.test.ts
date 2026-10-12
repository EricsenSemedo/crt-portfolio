import { afterEach, expect, it, vi } from "vitest";
import { Box3, InstancedMesh, Matrix4, Texture, TextureLoader, Vector3 } from "three";
import { createGarageTrees } from "../createGarageTrees";

afterEach(() => vi.restoreAllMocks());

it("grounds every cutout at its height, faces the street and releases the atlas once", async () => {
  const texture = new Texture<HTMLImageElement>();
  vi.spyOn(TextureLoader.prototype, "loadAsync").mockResolvedValue(texture);
  const trees = await createGarageTrees("test.webp", -1.19, [
    [-7, -22, 7, "broad"], [11, -29, -9, "broad"], [2, -24, 1.2, "shrub"],
  ]);
  const batches = trees.group.children as InstancedMesh[];
  expect(batches.map(batch => [batch.name, batch.count])).toEqual([["GarageTrees-broad", 2], ["GarageTrees-shrub", 1]]);
  const [broad] = batches;
  broad.geometry.computeBoundingBox();
  const matrix = new Matrix4();
  for (const [index, x, z, height] of [[0, -7, -22, 7], [1, 11, -29, 9]]) {
    broad.getMatrixAt(index, matrix);
    const bounds = new Box3().copy(broad.geometry.boundingBox!).applyMatrix4(matrix);
    expect(bounds.min.y).toBeCloseTo(-1.23, 5);
    expect(bounds.max.y - bounds.min.y).toBeCloseTo(height);
    const center = bounds.getCenter(new Vector3());
    expect(center.x).toBeCloseTo(x);
    expect(center.z).toBeCloseTo(z);
    // Mirrored trees turn around instead of flipping scale, so lighting stays consistent.
    expect(matrix.determinant()).toBeGreaterThan(0);
  }

  const material = broad.material as unknown as { dispose: () => void };
  const disposals = [texture, material, ...batches.map(batch => batch.geometry), ...batches]
    .map(resource => vi.spyOn(resource, "dispose"));
  trees.dispose();
  for (const dispose of disposals) expect(dispose).toHaveBeenCalledTimes(1);
});
