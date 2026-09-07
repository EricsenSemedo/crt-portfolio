import { Box3, BufferGeometry, Float32BufferAttribute, Mesh, Vector3 } from "three";

// Television_01's glass is one connected 10×10 patch inside a single exported mesh.
// These source-space bounds identify that patch, independent of camera or viewport.
const GLASS_BOUNDS = new Box3(
  new Vector3(-0.25715, 0.11414, 0.16821),
  new Vector3(0.12634, 0.40424, 0.19237),
);

export function attachTelevisionScreen(screen: Mesh, television: Mesh) {
  const source = television.geometry;
  const position = source.getAttribute("position");
  const normal = source.getAttribute("normal");
  const index = source.index;
  const positions: number[] = [];
  const uvs: number[] = [];
  const point = new Vector3();
  const size = GLASS_BOUNDS.getSize(new Vector3());
  const count = index?.count ?? position.count;
  const vertexAt = (offset: number) => index ? index.getX(offset) : offset;

  for (let offset = 0; offset < count; offset += 3) {
    const vertices = [0, 1, 2].map((corner) => vertexAt(offset + corner));
    if (!vertices.every((vertex) => GLASS_BOUNDS.containsPoint(point.fromBufferAttribute(position, vertex)))) continue;
    for (const vertex of vertices) {
      point.fromBufferAttribute(position, vertex);
      uvs.push((point.x - GLASS_BOUNDS.min.x) / size.x, (point.y - GLASS_BOUNDS.min.y) / size.y);
      // Lift along the actual glass normal to prevent depth fighting on its curved surface.
      point.addScaledVector(new Vector3().fromBufferAttribute(normal, vertex), 0.0005);
      positions.push(point.x, point.y, point.z);
    }
  }
  if (positions.length === 0) throw new Error("Television model has no matching glass surface");

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingBox();
  const center = geometry.boundingBox!.getCenter(new Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  geometry.computeVertexNormals();
  screen.geometry = geometry;
  screen.position.copy(center);
  screen.rotation.set(0, 0, 0);
  screen.scale.setScalar(1);
  television.add(screen);
}
