import { Box3, Group, LoadingManager, Mesh, SkinnedMesh, Texture, Vector3, type Skeleton, type Material, type Object3D, type Matrix4 } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { parseModelDefinition, type ComponentRole, type ModelDefinition } from './model-definition';

export const MAX_MODEL_BYTES = 8 * 1024 * 1024;

export type LoadedWatch = {
  object: Group;
  studioTransform?: Matrix4;
  components: Partial<Record<ComponentRole, Object3D[]>>;
  dispose: () => void;
};

export async function boundedFetch(url: string, limit: number, signal: AbortSignal) {
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok || !response.body) throw new Error('Asset request failed');
  if (Number(response.headers.get('content-length')) > limit) {
    await response.body.cancel();
    throw new Error('Asset exceeds size budget');
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) throw new Error('Asset exceeds size budget');
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes.buffer;
}

/** Accept embedded GLB 2.0 resources only; no hidden remote texture/decoder requests. */
export function inspectGlb(buffer: ArrayBuffer): { nodes: unknown[] } {
  const view = new DataView(buffer);
  if (buffer.byteLength < 20 || buffer.byteLength > MAX_MODEL_BYTES ||
      view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 ||
      view.getUint32(8, true) !== buffer.byteLength || view.getUint32(16, true) !== 0x4e4f534a) throw new Error('Invalid GLB container');
  const jsonLength = view.getUint32(12, true);
  if (jsonLength % 4 || jsonLength + 20 > buffer.byteLength) throw new Error('Invalid GLB JSON chunk');
  const json = JSON.parse(new TextDecoder().decode(buffer.slice(20, 20 + jsonLength)));
  if (json.asset?.version !== '2.0' || !Array.isArray(json.nodes)) throw new Error('Invalid glTF document');
  for (const entry of [...(json.buffers ?? []), ...(json.images ?? [])]) {
    if (entry.uri !== undefined) throw new Error('External resources are not supported');
  }
  if ((json.extensionsUsed ?? []).some((name: string) => ['KHR_draco_mesh_compression', 'EXT_meshopt_compression', 'KHR_texture_basisu'].includes(name))) throw new Error('Compressed assets need a reviewed decoder pipeline');
  return json;
}

function disposeScenes(scenes: Object3D[]) {
  const geometries = new Set<Mesh['geometry']>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const skeletons = new Set<Skeleton>();
  for (const scene of scenes) scene.traverse(object => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    if (object instanceof SkinnedMesh) skeletons.add(object.skeleton);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
    }
  });
  for (const skeleton of skeletons) skeleton.dispose();
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  const images = new Set<ImageBitmap>();
  for (const texture of textures) {
    if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) images.add(texture.image);
    texture.dispose();
  }
  for (const image of images) image.close();
}

/** Resolve explicit source node indices, retaining the imported parent hierarchy. */
export async function prepareWatch(gltf: GLTF, definition: ModelDefinition): Promise<LoadedWatch> {
  const members = new Set<Object3D>();
  gltf.scene.traverse(object => members.add(object));
  const components: LoadedWatch['components'] = {};
  for (const [role, indices] of Object.entries(definition.components)) {
    const resolved: Object3D[] = [];
    for (const index of indices) {
      if (!gltf.parser.json.nodes[index]) throw new Error('Mapped node is missing');
      const object: Object3D = await gltf.parser.getDependency('node', index);
      if (!members.has(object)) throw new Error('Mapped node is outside the active scene');
      let meshCount = 0;
      object.traverse(child => { if (child instanceof Mesh) meshCount++; });
      if (!meshCount) throw new Error('Mapped node has no mesh');
      resolved.push(object);
    }
    components[role as ComponentRole] = resolved;
  }
  // Nested roles would manipulate the same geometry twice in future component work.
  const mapped = Object.values(components).flat();
  for (const object of mapped) {
    for (let parent = object.parent; parent; parent = parent.parent) {
      if (mapped.includes(parent)) throw new Error('Component mappings overlap');
    }
  }
  const oriented = new Group();
  oriented.rotation.set(...definition.rotation);
  oriented.add(gltf.scene);
  oriented.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(oriented);
  const size = bounds.getSize(new Vector3());
  const longest = Math.max(size.x, size.y, size.z);
  if (bounds.isEmpty() || !Number.isFinite(longest) || longest <= 0) throw new Error('Model has invalid bounds');
  const centered = new Group();
  oriented.position.sub(bounds.getCenter(new Vector3()));
  centered.add(oriented);
  centered.scale.setScalar(2.8 / longest);
  centered.updateMatrixWorld(true);
  const studioTransform = definition.presentation === 'aurel-veil-v11' ? oriented.matrixWorld.clone() : undefined;
  let disposed = false;
  return { object: centered, studioTransform, components, dispose: () => {
    if (!disposed) { disposed = true; disposeScenes(gltf.scenes); }
  } };
}

export async function loadConfiguredWatch(signal: AbortSignal): Promise<LoadedWatch | null> {
  const manifest = await boundedFetch('/models/watch.json', 16 * 1024, signal);
  const definition = parseModelDefinition(JSON.parse(new TextDecoder().decode(manifest)));
  if (!definition) return null;
  const buffer = await boundedFetch(definition.url, MAX_MODEL_BYTES, signal);
  inspectGlb(buffer);
  signal.throwIfAborted();
  const manager = new LoadingManager();
  let resourceFailed = false;
  manager.onError = () => { resourceFailed = true; };
  manager.setURLModifier(url => {
    if (!url.startsWith('blob:')) throw new Error('Unexpected external resource');
    return url;
  });
  const gltf = await new GLTFLoader(manager).parseAsync(buffer, '');
  try {
    signal.throwIfAborted();
    if (resourceFailed) throw new Error('Model texture failed');
    const result = await prepareWatch(gltf, definition);
    signal.throwIfAborted();
    return result;
  } catch (error) {
    disposeScenes(gltf.scenes);
    throw error;
  }
}
