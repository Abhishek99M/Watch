import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { assertEquivalentGlb } from './lib/assert-equivalent-glb.mjs';
import { NodeIO, VertexLayout } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize } from '@gltf-transform/functions';

const source = 'prototypes/atelier/model-study-v11/aurel-veil.glb';
const output = 'public/models/aurel-veil.glb';
const io = new NodeIO().setVertexLayout(VertexLayout.INTERLEAVED).registerExtensions(ALL_EXTENSIONS);
const original = await fs.readFile(source);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(original), 'f89af1b207e827fe287027b44b2751eec8b648e88a5e81a1f4ed3e9061fce5ae');
const doc = await io.readBinary(original);
function expandedPositions(document) {
  const values = [];
  for (const node of document.getRoot().listNodes()) {
    const matrix = node.getWorldMatrix();
    for (const primitive of node.getMesh()?.listPrimitives() ?? []) {
      const positions = primitive.getAttribute('POSITION');
      const indices = primitive.getIndices();
      for (let i = 0; i < (indices?.getCount() ?? positions.getCount()); i++) {
        const [x, y, z] = positions.getElement(indices ? indices.getScalar(i) : i, []);
        values.push(matrix[0]*x+matrix[4]*y+matrix[8]*z+matrix[12], matrix[1]*x+matrix[5]*y+matrix[9]*z+matrix[13], matrix[2]*x+matrix[6]*y+matrix[10]*z+matrix[14]);
      }
    }
  }
  return values;
}
function groups(document) {
  return document.getRoot().listNodes().filter(n => n.getExtras().component).map(n => ({ name:n.getName(), extras:n.getExtras(), matrix:n.getMatrix() }));
}
const animationSnapshot = doc.getRoot().listAnimations().map(animation => animation.listSamplers().map(sampler => ({input:Array.from(sampler.getInput().getArray()),output:Array.from(sampler.getOutput().getArray())})));
const positions = expandedPositions(doc);
const assembly = groups(doc);
assert.equal(assembly.length, 43);
// No decimation or texture downsampling. Quantization has a measured error gate.
await doc.transform(weld(), dedup(), quantize({ quantizePosition:16, quantizeNormal:16, quantizeTexcoord:16 }), dedup());
for (const texture of doc.getRoot().listTextures()) {
  if (texture.getMimeType() !== 'image/png') continue;
  const input = texture.getImage();
  const stats = await sharp(input).stats();
  const encoder = sharp(input);
  if (stats.isOpaque) encoder.removeAlpha();
  const compressed = await encoder.clone().png({compressionLevel:9, adaptiveFiltering:true}).toBuffer();
  if (compressed.length < input.length) texture.setImage(compressed);
  const palette = await encoder.clone().png({palette:true, colours:256, effort:10, dither:0}).toBuffer();
  const pixels = await sharp(input).ensureAlpha().raw().toBuffer();
  const candidate = await sharp(palette).ensureAlpha().raw().toBuffer();
  if (pixels.equals(candidate) && palette.length < texture.getImage().length) texture.setImage(palette);
  assert(pixels.equals(await sharp(texture.getImage()).ensureAlpha().raw().toBuffer()), 'Texture pixels changed');
}
const bytes = await io.writeBinary(doc);
assert(bytes.length <= 8*1024*1024, 'Web GLB exceeds 8 MiB');
const result = await io.readBinary(bytes);
assert.deepEqual(groups(result), assembly, 'Component hierarchy/transforms changed');
const after = expandedPositions(result);
assert.equal(after.length, positions.length, 'Triangle count changed');
let maxPositionErrorMeters = 0;
for (let i = 0; i < positions.length; i += 3) maxPositionErrorMeters = Math.max(maxPositionErrorMeters, Math.hypot(after[i]-positions[i], after[i+1]-positions[i+1], after[i+2]-positions[i+2]));
assert(maxPositionErrorMeters < 0.000002, 'Position quantization exceeds 2 micrometers');
const data = Buffer.from(bytes);
const json = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)));
const components = {};
json.nodes.forEach((node, index) => { if(node.extras?.role) (components[node.extras.role] ??= []).push(index); });
assert.equal(Object.values(components).flat().length, 43);
assert.equal(json.animations[0].name, 'Seconds_Sweep_60s');
const animation = result.getRoot().listAnimations()[0];
assert.equal(animation.listChannels()[0].getTargetNode().getName(), 'seconds_hand');
for (const [index, sampler] of animation.listSamplers().entries()) {
  const before = animationSnapshot[0][index];
  assert.deepEqual(Array.from(sampler.getInput().getArray()), before.input);
  assert.deepEqual(Array.from(sampler.getOutput().getArray()), before.output);
}
assert(!json.buffers.some(b => b.uri) && !json.images.some(i => i.uri));
const manifest = {model:{url:'/models/aurel-veil.glb', source:'Original Aurel Veil V11 procedural watch; user selected for this project.', license:'Project-authored geometry and textures; retained source in prototypes/atelier/model-study-v11. No third-party watch mesh.', components, rotation:[0,0,0],presentation:'aurel-veil-v11'}};
const report = {source, output, masterSha256:hash(original), webSha256:hash(bytes), masterBytes:original.length, webBytes:bytes.length, triangles:positions.length/9, componentGroups:assembly.length, animation:'Seconds_Sweep_60s', maxPositionErrorMeters, texturePixels:'unchanged', decoder:'none; KHR_mesh_quantization supported by GLTFLoader'};
if (process.argv.includes('--check')) {
  const committedBytes = await fs.readFile(output);
  const committedReport = JSON.parse(await fs.readFile('docs/WATCH_ASSET_VALIDATION.json', 'utf8'));
  assert.equal(hash(committedBytes), committedReport.webSha256, 'Committed asset checksum mismatch');
  assert.equal(committedBytes.length, committedReport.webBytes);
  assert(committedBytes.length <= 8*1024*1024);
  const comparison = await assertEquivalentGlb(committedBytes, bytes);
  assert.deepEqual({...report, webSha256:null, webBytes:null}, {...committedReport, webSha256:null, webBytes:null});
  assert.deepEqual(JSON.parse(await fs.readFile('public/models/watch.json', 'utf8')), manifest);
  console.log('Committed asset verified against rebuilt content:', comparison);
} else {
  await fs.writeFile(output, bytes);
  await fs.writeFile('public/models/watch.json', JSON.stringify(manifest,null,2)+'\n');
  await fs.writeFile('docs/WATCH_ASSET_VALIDATION.json', JSON.stringify(report,null,2)+'\n');
  console.log(report);
}
