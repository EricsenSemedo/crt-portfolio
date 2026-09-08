import {
  Box3, Group, InstancedMesh, Matrix4, Mesh, Object3D, Texture, Vector3,
  type BufferGeometry, type Material,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export async function createGarageTrees(url: string, groundY: number) {
  const tree = (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url)).scene;
  tree.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(tree);
  const center = bounds.getCenter(new Vector3());
  const height = bounds.max.y - bounds.min.y;
  // Normalize before applying yaw so rotation cannot move the root off its anchor.
  const normalize = new Matrix4().makeScale(1 / height, 1 / height, 1 / height)
    .multiply(new Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));
  const placements = [
    [-7, -22, 7, 0], [11, -29, 9, 1.8], [-13, -31, 9, -0.8],
  ];
  // Staggered heights and rotations break up the skyline; a smaller front row
  // covers the gaps between the taller trunks without a flat backdrop plane.
  for (let i = 0; i < 15; i++) {
    placements.push([-42 + i * 6, -46 - (i % 3) * 2, 6 + (i * 7 % 4), i * 2.4]);
  }
  for (let i = 0; i < 17; i++) {
    placements.push([-40 + i * 5, -38 - (i % 3), 3.5 + (i * 3 % 4) * 0.45, i * 1.7]);
  }
  const group = new Group();
  group.name = "GarageTrees";
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const instances: InstancedMesh[] = [];
  const transform = new Object3D();
  const matrix = new Matrix4();
  tree.traverse(object => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
    }
    const batch = new InstancedMesh(object.geometry, object.material, placements.length);
    batch.name = object.name;
    placements.forEach(([x, z, size, yaw], index) => {
      transform.position.set(x, groundY - 0.04, z);
      transform.rotation.y = yaw;
      transform.scale.setScalar(size);
      transform.updateMatrix();
      // Preserve the GLB's quantization transforms; all trees share its buffers.
      matrix.copy(transform.matrix).multiply(normalize).multiply(object.matrixWorld);
      batch.setMatrixAt(index, matrix);
    });
    batch.instanceMatrix.needsUpdate = true;
    batch.computeBoundingSphere();
    group.add(batch);
    instances.push(batch);
  });
  return {
    group,
    dispose() {
      instances.forEach(instance => instance.dispose());
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
    },
  };
}
