import { readFileSync } from "node:fs";
import { BufferAttribute, BufferGeometry, Group, Mesh, PerspectiveCamera, PlaneGeometry, Raycaster, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { attachTelevisionScreen } from "../televisionScreen";

function loadTelevisionGeometry() {
  const model = JSON.parse(readFileSync("public/models/television-01/television-01.gltf", "utf8"));
  const binary = readFileSync("public/models/television-01/Television_01.bin");
  function attribute(id: number, itemSize: number) {
    const accessor = model.accessors[id];
    const view = model.bufferViews[accessor.bufferView];
    const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const data = binary.buffer.slice(binary.byteOffset + offset, binary.byteOffset + offset + view.byteLength);
    return new BufferAttribute(accessor.componentType === 5126 ? new Float32Array(data) : new Uint16Array(data), itemSize);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", attribute(0, 3));
  geometry.setAttribute("normal", attribute(1, 3));
  geometry.setIndex(attribute(4, 1));
  return geometry;
}

describe("model-owned television display", () => {
  it("uses the shipped curved glass and stays attached through TV and viewport changes", () => {
    const television = new Mesh(loadTelevisionGeometry());
    const lineup = new Group();
    lineup.add(television);
    const screen = new Mesh(new PlaneGeometry());
    attachTelevisionScreen(screen, television);
    expect(screen.geometry.getAttribute("position").count).toBe(162 * 3);
    expect(screen.parent).toBe(television);
    const localCenter = screen.position.clone();
    for (const [aspect, scale, rotation] of [[430 / 932, 2.6, 0.11], [1.6, 3.15, 0], [32 / 9, 3.45, -0.11]]) {
      television.scale.setScalar(scale);
      television.rotation.y = rotation;
      television.position.set(-1.82, 0.2, -0.46);
      lineup.updateMatrixWorld(true);
      const center = screen.getWorldPosition(new Vector3());
      expect(center.distanceTo(television.localToWorld(localCenter.clone()))).toBeLessThan(1e-6);
      const camera = new PerspectiveCamera(38, aspect);
      camera.position.copy(center).add(new Vector3(0, 0, 4));
      camera.lookAt(center);
      camera.updateMatrixWorld();
      const ray = new Raycaster(camera.position, center.clone().sub(camera.position).normalize());
      expect(ray.intersectObject(screen, false).length).toBeGreaterThan(0);
      expect(screen.geometry.boundingBox!.max.z - screen.geometry.boundingBox!.min.z).toBeGreaterThan(0.02);
    }
  });
});
