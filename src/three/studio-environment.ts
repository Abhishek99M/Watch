import { EquirectangularReflectionMapping, PMREMGenerator, type WebGLRenderer } from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { boundedFetch } from './model-loader';

/** Local CC0 studio map, loaded only after opting into the configured model. */
export async function loadStudioEnvironment(renderer: WebGLRenderer, signal: AbortSignal) {
  const bytes = await boundedFetch('/textures/studio-small-09.hdr', 2 * 1024 * 1024, signal);
  signal.throwIfAborted();
  const texture = new HDRLoader().createDataTexture(bytes);
  texture.mapping = EquirectangularReflectionMapping;
  const generator = new PMREMGenerator(renderer);
  try { return generator.fromEquirectangular(texture); }
  finally { texture.dispose(); generator.dispose(); }
}
