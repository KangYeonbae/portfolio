import {
  EquirectangularReflectionMapping, LoadingManager, Mesh, SRGBColorSpace, Texture, TextureLoader,
  type BufferGeometry, type DataTexture, type Material,
} from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

export type GalleryAssets = {
  building: GLTF;
  walker: GLTF;
  daylight: DataTexture;
  artworks: Texture<HTMLImageElement>[];
};

function disposeTexture(texture: Texture) {
  texture.dispose();
  if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) texture.image.close();
}

function disposeModel(model: GLTF) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  for (const scene of model.scenes) {
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value instanceof Texture) textures.add(value);
        }
      }
    });
  }
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach(disposeTexture);
}

export function loadGalleryAssets(images: string[]) {
  const manager = new LoadingManager();
  const gltf = new GLTFLoader(manager);
  const artwork = new TextureLoader(manager);
  const hdr = new HDRLoader(manager);
  const releases: (() => void)[] = [];
  let disposed = false;

  async function own<T>(loading: Promise<T>, release: (resource: T) => void) {
    const resource = await loading;
    if (disposed) release(resource);
    else releases.push(() => release(resource));
    return resource;
  }

  const ready: Promise<GalleryAssets> = Promise.all([
    own(gltf.loadAsync("/project-media/modern-gallery.glb"), disposeModel),
    own(gltf.loadAsync("/project-media/gallery-nathan.glb"), disposeModel),
    own(hdr.loadAsync("/project-media/gallery-daylight-1k.hdr"), disposeTexture),
    Promise.all(images.map((url) => own(artwork.loadAsync(url), disposeTexture))),
  ]).then(([building, walker, daylight, artworks]) => {
    for (const texture of artworks) texture.colorSpace = SRGBColorSpace;
    daylight.mapping = EquirectangularReflectionMapping;
    return { building, walker, daylight, artworks };
  });

  return {
    ready,
    dispose() {
      if (disposed) return;
      disposed = true;
      manager.abort();
      releases.splice(0).forEach((release) => release());
    },
  };
}
