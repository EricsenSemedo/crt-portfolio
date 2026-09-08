import { BufferAttribute, BufferGeometry, Color, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from "three";
import { attachTelevisionScreen } from "../televisionScreen";
import { indexCount, previewData, vertexCount } from "./televisionPreviewData";

/** The shipped TV shape, available with the scene code before textures download. */
export function createTelevisionPreview(tint: string) {
  const group = new Group();
  const bytes = Uint8Array.from(atob(previewData), (character) => character.charCodeAt(0));
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(bytes.buffer, 0, vertexCount * 3), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(bytes.buffer, vertexCount * 12, vertexCount * 3), 3));
  geometry.setIndex(new BufferAttribute(new Uint16Array(bytes.buffer, vertexCount * 24, indexCount), 1));
  geometry.setAttribute("color", new BufferAttribute(new Uint8Array(bytes.buffer, vertexCount * 24 + indexCount * 2, vertexCount * 3), 3, true));
  const material = new MeshStandardMaterial({ color: new Color(tint), vertexColors: true, roughness: 0.9 });
  const television = new Mesh(geometry, material);
  television.name = "Television_01";
  television.castShadow = true;
  television.receiveShadow = true;
  group.add(television);
  const screenMaterial = new MeshBasicMaterial();
  const screenPlane = new Mesh(new BufferGeometry(), screenMaterial);
  attachTelevisionScreen(screenPlane, television);
  // Retain ownership when the display later moves to the detailed model.
  const screenGeometry = screenPlane.geometry;
  const hoverLight = new PointLight("#2457ff", 0.08, 2.8);
  hoverLight.position.set(0, 0.3, 0.3);
  group.add(hoverLight);
  return {
    group, screenAnchor: television, screenPlane, hoverLight,
    dispose: () => {
      geometry.dispose();
      screenGeometry.dispose();
      material.dispose();
      screenMaterial.dispose();
    },
  };
}
