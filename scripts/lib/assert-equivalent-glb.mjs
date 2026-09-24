import assert from 'node:assert/strict';
import sharp from 'sharp';

function unpack(input) {
  const bytes = Buffer.from(input);
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const jsonLength = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a);
  const binaryHeader = 20 + jsonLength;
  assert.equal(bytes.readUInt32LE(binaryHeader + 4), 0x004e4942);
  const json = JSON.parse(bytes.subarray(20, binaryHeader));
  const binary = bytes.subarray(binaryHeader + 8);
  assert.equal(binary.length, bytes.readUInt32LE(binaryHeader));
  assert.equal(json.buffers.length, 1);
  assert(!json.buffers[0].uri);
  const imageViews = new Set((json.images ?? []).map(image => image.bufferView));
  for (const accessor of json.accessors ?? []) {
    assert(!imageViews.has(accessor.bufferView), 'Image and geometry share a buffer view');
    assert(!accessor.sparse, 'Unexpected sparse accessor in optimized output');
  }
  const views = json.bufferViews.map(view => {
    assert.equal(view.buffer, 0);
    const start = view.byteOffset ?? 0;
    assert(start >= 0 && start + view.byteLength <= binary.length);
    return binary.subarray(start, start + view.byteLength);
  });
  // Native PNG encoders can vary compressed bytes, sizes and subsequent offsets.
  // Everything else, including materials, hierarchy, attributes and animation
  // metadata, must remain exactly equal.
  const structure = structuredClone(json);
  delete structure.buffers[0].byteLength;
  structure.bufferViews.forEach((view, index) => {
    delete view.byteOffset;
    if (imageViews.has(index)) delete view.byteLength;
  });
  return { structure, views, imageViews };
}

export async function assertEquivalentGlb(expectedBytes, actualBytes) {
  const expected = unpack(expectedBytes), actual = unpack(actualBytes);
  assert.deepEqual(actual.structure, expected.structure, 'GLB structure/materials changed');
  let reencodedImages = 0;
  for (let i = 0; i < expected.views.length; i++) {
    const before = expected.views[i], after = actual.views[i];
    if (before.equals(after)) continue;
    assert(expected.imageViews.has(i), `Non-image buffer view ${i} changed`);
    const a = await sharp(before).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(after).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual(b.info, a.info, `Image dimensions/format changed in view ${i}`);
    assert(a.data.equals(b.data), `Decoded image pixels changed in view ${i}`);
    reencodedImages++;
  }
  return { reencodedImages };
}
