import { readFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('Usage: node scripts/inspect-glb.mjs path/to/watch.glb');
const bytes = readFileSync(path);
if (bytes.length < 20 || bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 ||
    bytes.readUInt32LE(8) !== bytes.length || bytes.readUInt32LE(16) !== 0x4e4f534a) throw new Error('Expected GLB 2.0');
const length = bytes.readUInt32LE(12);
if (20 + length > bytes.length) throw new Error('Invalid JSON chunk');
const json = JSON.parse(bytes.subarray(20, 20 + length).toString('utf8'));
console.log(JSON.stringify({
  bytes: bytes.length,
  defaultScene: json.scene ?? 0,
  scenes: json.scenes,
  extensions: json.extensionsUsed ?? [],
  nodes: (json.nodes ?? []).map((node, index) => ({ index, name: node.name ?? '', mesh: node.mesh, children: node.children ?? [] })),
  images: json.images ?? [],
  buffers: json.buffers ?? [],
}, null, 2));
