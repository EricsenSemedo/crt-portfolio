import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from "three";
import { expect, it, vi } from "vitest";
import { disposeObjectTree } from "../disposeObjectTree";

it("releases shared clone resources once without disposing unrelated assets", () => {
  const texture = new Texture();
  const geometry = new PlaneGeometry();
  const material = new MeshBasicMaterial({ map: texture });
  const variant = material.clone();
  const root = new Group();
  const scene = new Group();
  const unrelated = new Mesh(new PlaneGeometry(), new MeshBasicMaterial());
  scene.add(root, unrelated);
  root.add(new Mesh(geometry, material), new Mesh(geometry, variant), new Mesh(geometry, material));
  const disposals = [texture, geometry, material, variant].map((resource) => vi.spyOn(resource, "dispose"));
  const untouched = vi.spyOn(unrelated.geometry, "dispose");
  disposeObjectTree(root);
  disposals.forEach((dispose) => expect(dispose).toHaveBeenCalledOnce());
  expect(untouched).not.toHaveBeenCalled();
  expect(root.parent).toBeNull();
});
