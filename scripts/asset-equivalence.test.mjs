import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { assertEquivalentGlb } from './lib/assert-equivalent-glb.mjs';

async function fixture({ compressionLevel=9, color='#222222', vertex=1, roughness=0.4 }={}) {
  const png=await sharp({create:{width:16,height:16,channels:4,background:color}}).png({compressionLevel}).toBuffer();
  const binary=Buffer.alloc(4+Math.ceil(png.length/4)*4);
  binary.writeFloatLE(vertex);png.copy(binary,4);
  const json=Buffer.from(JSON.stringify({asset:{version:'2.0'},buffers:[{byteLength:binary.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:4},{buffer:0,byteOffset:4,byteLength:png.length}],accessors:[{bufferView:0,componentType:5126,count:1,type:'SCALAR'}],images:[{bufferView:1,mimeType:'image/png'}],materials:[{pbrMetallicRoughness:{roughnessFactor:roughness}}]}));
  const paddedJson=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(paddedJson);
  const output=Buffer.alloc(28+paddedJson.length+binary.length);
  output.writeUInt32LE(0x46546c67,0);output.writeUInt32LE(2,4);output.writeUInt32LE(output.length,8);
  output.writeUInt32LE(paddedJson.length,12);output.writeUInt32LE(0x4e4f534a,16);paddedJson.copy(output,20);
  output.writeUInt32LE(binary.length,20+paddedJson.length);output.writeUInt32LE(0x004e4942,24+paddedJson.length);binary.copy(output,28+paddedJson.length);
  return output;
}

test('accepts different lossless PNG encoding with identical pixels',async()=>{
  const before=await fixture(),after=await fixture({compressionLevel:0});
  assert(!before.equals(after));
  assert.deepEqual(await assertEquivalentGlb(before,after),{reencodedImages:1});
});
test('rejects changed decoded texture pixels',async()=>{
  await assert.rejects(assertEquivalentGlb(await fixture(),await fixture({color:'#444444'})),/pixels changed/);
});
test('rejects changed geometry bytes',async()=>{
  await assert.rejects(assertEquivalentGlb(await fixture(),await fixture({vertex:2})),/Non-image buffer view/);
});
test('rejects changed material metadata',async()=>{
  await assert.rejects(assertEquivalentGlb(await fixture(),await fixture({roughness:0.8})),/structure\/materials changed/);
});
