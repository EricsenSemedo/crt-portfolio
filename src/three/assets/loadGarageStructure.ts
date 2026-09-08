import { Mesh } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { disposeObjectTree } from "../disposeObjectTree";

/** Residential garage fitted offline to GARAGE_BOUNDS; no runtime stretching. */
export async function loadGarageStructure() {
  try {
    const { scene: group } = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(
      `${import.meta.env.BASE_URL}models/modern-garage/garage.glb`,
    );
    group.name = "ModernResidentialGarage";
    group.traverse(object => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return { group, dispose: () => disposeObjectTree(group) };
  } catch {
    return null;
  }
}
