const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const b=fs.readFileSync(path.join(__dirname,'aurel-veil.glb')),n=b.readUInt32LE(12),j=JSON.parse(b.toString('utf8',20,20+n));
const signature=j.materials.findIndex(m=>m.name==='Applied dial signature');assert.ok(signature>=0);
const signatureMeshes=j.meshes.filter(m=>m.primitives.some(p=>p.material===signature));assert.ok(signatureMeshes.length>0);
let total=0;for(const mesh of j.meshes)for(const p of mesh.primitives){const m=j.materials[p.material];if((m.extensions?.KHR_materials_anisotropy?.anisotropyStrength??0)>0){assert.ok(p.attributes.TANGENT!==undefined,'Missing anisotropy tangents');assert.equal(j.accessors[p.attributes.TANGENT].count,j.accessors[p.attributes.POSITION].count);total++;}}
assert.deepEqual(j.nodes.find(n=>n.name==='Aurel_Veil_Steel').scale,[.001,.001,.001]);
const crystal=j.materials.find(m=>m.name==='Optical crystal');assert.equal(crystal.extensions.KHR_materials_volume.thicknessFactor,.65);
assert.ok(total>0);const report={appliedSignatureGeometry:true,signatureMeshes:signatureMeshes.length,anisotropicPrimitivesWithTangents:total,crystalLocalThickness:.65,rootScale:.001,nominalThicknessMeters:.00065};
fs.writeFileSync(path.join(__dirname,'detail-validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
