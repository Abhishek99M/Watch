/* eslint-disable @typescript-eslint/no-require-imports -- Local GLB validation. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
(async()=>{
 const data=fs.readFileSync(path.join(__dirname,'aurel-veil.glb'));
 assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);
 assert.ok(data.length<16*1024*1024,'Exceeds 16 MiB isolated-review budget; production budget is a separate gate');
 const jsonLength=data.readUInt32LE(12),doc=JSON.parse(data.toString('utf8',20,20+jsonLength));
 assert.equal(doc.buffers.length,1);assert.equal(doc.buffers[0].uri,undefined);
 assert.ok(doc.images.every(i=>i.bufferView!==undefined&&['image/png','image/jpeg'].includes(i.mimeType)));
 assert.equal(doc.nodes.filter(n=>n.extras?.component).length,43);
 assert.equal(doc.nodes.filter(n=>/^bracelet_(upper|lower)_\d/.test(n.name)&&n.extras?.component).length,28);
 assert.ok(doc.materials.some(m=>m.extensions?.KHR_materials_transmission));
 assert.ok(!doc.materials.some(m=>/leather|stitch/i.test(m.name)));
 const binStart=20+jsonLength+8;
 for(const a of doc.accessors){
  assert.ok(a.count>0);
  if(a.min)assert.ok(a.min.every(Number.isFinite));
  if(a.max)assert.ok(a.max.every(Number.isFinite));
  if(a.componentType!==5126)continue;
  const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},width=widths[a.type],v=doc.bufferViews[a.bufferView];
  const stride=v.byteStride??width*4,offset=binStart+(v.byteOffset??0)+(a.byteOffset??0);
  for(let i=0;i<a.count;i++)for(let j=0;j<width;j++)assert.ok(Number.isFinite(data.readFloatLE(offset+i*stride+j*4)),'Nonfinite geometry data');
 }
 const mapping={};
 doc.nodes.forEach(n=>{
  if(!n.extras?.role)return;
  const meshes=(n.children??[]).filter(i=>doc.nodes[i].mesh!==undefined);
  (mapping[n.extras.role]??=[]).push(...meshes);
 });
 const used=Object.values(mapping).flat();assert.equal(used.length,new Set(used).size);
 assert.ok(mapping.Case.length&&mapping.Dial.length);
 fs.writeFileSync(path.join(__dirname,'component-mapping.json'),JSON.stringify({note:'Inspection mapping only; not installed in the website manifest.',components:mapping},null,2));
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  p.setDefaultTimeout(120000);p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:43180/model-study-v11/index.html');
  await p.waitForFunction(()=>document.querySelector('#viewport').dataset.ready==='true',null,{timeout:120000});
  const home=await p.evaluate(()=>window.watchStudy.snapshot());
  const clarity=await p.evaluate(()=>window.watchStudy.info());assert.ok(clarity.pixelRatio>=1.5);assert.equal(clarity.transmissionScale,1.25);
  await p.screenshot({path:path.join(__dirname,'viewer-assembled.jpg'),quality:88});
  await p.locator('[data-view="dial"]').click();
  await p.screenshot({path:path.join(__dirname,'viewer-dial.jpg'),quality:88});
  await p.locator('#exploded').click();
  const open=await p.evaluate(()=>window.watchStudy.snapshot());
  for(const g of open)for(let i=0;i<3;i++)assert.ok(Math.abs(g.position[i]-g.home[i]-g.offset[i])<1e-8);
  await p.screenshot({path:path.join(__dirname,'viewer-exploded.jpg'),quality:88});
  await p.locator('#assembled').click();
  assert.deepEqual(await p.evaluate(()=>window.watchStudy.snapshot()),home);
  await p.setViewportSize({width:390,height:844});
  await p.locator('[data-view="hero"]').click();
  await p.screenshot({path:path.join(__dirname,'viewer-mobile.jpg'),quality:88});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.locator('#exploded').click();await p.locator('#assembled').click();
  assert.deepEqual(await p.evaluate(()=>window.watchStudy.snapshot()),home);
  assert.deepEqual(errors,[]);
  const report={bytes:data.length,components:43,braceletRows:28,meshes:doc.meshes.length,embeddedImages:doc.images.length,extensions:doc.extensionsUsed,checks:['GLB 2.0 and byte limit','Embedded PNG/JPEG textures','Finite geometry buffers','No leather material','Physical crystal','Actual mesh-node component mapping','Browser loading','Supersampled viewport and transmission target','Correct explosion offsets','Exact reassembly','Mobile overflow','Reduced-motion manual inspection','No page JavaScript errors'],limitations:['Software WebGL, not physical-device performance QA','Movement is illustrative','Website integration and approval pending']};
  fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
