import { BoxGeometry } from 'three';
import { deflateSync } from 'node:zlib';

// Authored test geometry and a generated single-color PNG; never published as a product asset.
function png() {
  function chunk(type: string, data: Buffer) {
    const name = Buffer.from(type);
    const bytes = Buffer.concat([name, data]);
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
    const checksum = Buffer.alloc(4); checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([length, bytes, checksum]);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1, 0); header.writeUInt32BE(1, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.from([0, 185, 151, 98, 255]))), chunk('IEND', Buffer.alloc(0))]);
}

export function fixtureGlb(options: { texture?: 'valid' | 'broken' | 'external'; scale?: number } = {}) {
  const indexed = new BoxGeometry(2, 2, 2);
  const geometry = indexed.toNonIndexed();
  const positions = Buffer.from(geometry.getAttribute('position').array.buffer);
  const normals = Buffer.from(geometry.getAttribute('normal').array.buffer);
  const uvs = Buffer.from(geometry.getAttribute('uv').array.buffer);
  const image = options.texture === 'broken' ? Buffer.from('not a PNG') : png();
  const binary = Buffer.concat([positions, normals, uvs, image]);
  const padded = Buffer.concat([binary, Buffer.alloc((4 - binary.length % 4) % 4)]);
  const scale = options.scale ?? 1;
  const json = {
    asset: { version: '2.0', generator: 'Watch authored test fixture' },
    scene: 0, scenes: [{ nodes: [0, 1] }],
    // Repeated names demonstrate that mapping uses source indices, not guessed names.
    nodes: [
      { name: 'SameName', mesh: 0, scale: [0.5 * scale, 0.5 * scale, 0.1 * scale] },
      { name: 'SameName', mesh: 0, translation: [0, 0, 0.12 * scale], scale: [0.4 * scale, 0.4 * scale, 0.01 * scale] },
    ],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.8, 0.65, 0.4, 1], metallicFactor: 0.2,
      ...(options.texture ? { baseColorTexture: { index: 0 } } : {}) } }],
    ...(options.texture ? {
      textures: [{ source: 0 }],
      images: [options.texture === 'external' ? { uri: 'https://example.invalid/missing.png' } : { bufferView: 3, mimeType: 'image/png' }],
    } : {}),
    buffers: [{ byteLength: padded.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positions.length },
      { buffer: 0, byteOffset: positions.length, byteLength: normals.length },
      { buffer: 0, byteOffset: positions.length + normals.length, byteLength: uvs.length },
      { buffer: 0, byteOffset: positions.length + normals.length + uvs.length, byteLength: image.length },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 36, type: 'VEC3', min: [-1, -1, -1], max: [1, 1, 1] },
      { bufferView: 1, componentType: 5126, count: 36, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: 36, type: 'VEC2' },
    ],
  };
  const text = Buffer.from(JSON.stringify(json));
  const jsonChunk = Buffer.concat([text, Buffer.alloc((4 - text.length % 4) % 4, 0x20)]);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + jsonChunk.length + padded.length, 8);
  header.writeUInt32LE(jsonChunk.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(padded.length); binHeader.writeUInt32LE(0x004e4942, 4);
  indexed.dispose(); geometry.dispose();
  return Buffer.concat([header, jsonChunk, binHeader, padded]);
}

export const fixtureManifest = {
  model: { url: '/models/test-watch.glb', source: 'Locally authored test fixture', license: 'Project-authored test data',
    components: { Case: [0], Dial: [1] }, rotation: [0, 0, 0] },
};
