import { Group, HemisphereLight, Matrix4, Mesh, RectAreaLight, SpotLight, Texture, UniformsLib, Vector3, type PerspectiveCamera, type WebGLRenderer } from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import type { LoadedWatch } from './model-loader';

/** V11's metre-based studio, transformed with the model's normalization. */
export function createWatchStudio(asset: LoadedWatch, renderer: WebGLRenderer) {
  const transform = asset.studioTransform ?? new Matrix4();
  const scale = new Vector3().setFromMatrixScale(transform).x;
  const point = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(transform);
  const lights = new Group();
  if (!('LTC_FLOAT_1' in UniformsLib)) RectAreaLightUniformsLib.init();
  const silk = new RectAreaLight(0xfff7eb, 0.30, 0.12 * scale, 0.20 * scale);
  silk.position.copy(point(-0.055, 0.08, 0.14)); silk.lookAt(point(0, 0, -0.02));
  const edge = new RectAreaLight(0xe8f0ff, 0.35, 0.035 * scale, 0.18 * scale);
  edge.position.copy(point(0.12, 0.02, 0.04)); edge.lookAt(point(0, 0, -0.015));
  const key = new SpotLight(0xfff6e9, 0.025 * scale * scale, 0.5 * scale, 0.55, 0.8, 2);
  key.position.copy(point(-0.06, 0.09, 0.14)); key.target.position.copy(point(0, 0, -0.02));
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.01 * scale; key.shadow.camera.far = 0.4 * scale;
  key.shadow.bias = -0.00001; key.shadow.normalBias = 0.000025 * scale;
  lights.add(silk, edge, key, key.target, new HemisphereLight(0xf3f0e7, 0x1c2530, 0.12));
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  asset.object.traverse(object => {
    if (!(object instanceof Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    object.castShadow = materials.every(material => material.name !== 'Optical crystal');
    object.receiveShadow = true;
    for (const material of materials) for (const texture of Object.values(material)) {
      if (texture instanceof Texture) { texture.anisotropy = anisotropy; texture.needsUpdate = true; }
    }
  });
  return {
    lights,
    target: point(0, 0, -0.018),
    minDistance: 0.05 * scale,
    maxDistance: 0.45 * scale,
    home(camera: PerspectiveCamera, width: number) {
      camera.fov = 28; camera.near = 0.001 * scale; camera.far = 2 * scale;
      camera.position.copy(point(0.04, 0.025, width < 600 ? 0.195 : 0.155));
      camera.lookAt(point(0, 0, -0.018)); camera.updateProjectionMatrix();
    },
    dispose() { key.shadow.dispose(); },
  };
}
