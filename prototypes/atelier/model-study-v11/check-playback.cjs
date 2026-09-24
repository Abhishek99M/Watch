const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
(async()=>{
 const T=await import('three');
 const b=fs.readFileSync(path.join(__dirname,'aurel-veil.glb')),n=b.readUInt32LE(12),j=JSON.parse(b.toString('utf8',20,20+n)),bin=28+n;
 assert.equal(j.animations.length,1);const animation=j.animations[0];assert.equal(animation.name,'Seconds_Sweep_60s');assert.equal(animation.channels.length,1);
 const channel=animation.channels[0];assert.equal(channel.target.path,'rotation');assert.equal(j.nodes[channel.target.node].name,'seconds_hand');
 function floats(index,width){const a=j.accessors[index],v=j.bufferViews[a.bufferView],start=bin+(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||width*4;assert.equal(a.componentType,5126);return Array.from({length:a.count},(_,i)=>Array.from({length:width},(_,k)=>b.readFloatLE(start+i*stride+k*4)));}
 const sampler=animation.samplers[channel.sampler],times=floats(sampler.input,1).flat(),q=floats(sampler.output,4);assert.equal(times[0],0);assert.equal(times.at(-1),60);
 const initial=new T.Quaternion().fromArray(q[0]);
 for(let i=0;i<times.length;i++){const actual=new T.Quaternion().fromArray(q[i]),expected=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-times[i]*Math.PI/30).multiply(initial);assert.ok(actual.angleTo(expected)<.001);}
 assert.ok(new T.Quaternion().fromArray(q.at(-1)).angleTo(initial)<.001);
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const p=await browser.newPage({viewport:{width:1100,height:900}});p.setDefaultTimeout(120000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:43180/model-study-v11/index.html');await p.locator('#viewport[data-ready="true"]').waitFor();
 const read=()=>p.evaluate(()=>window.watchStudy.playback());const first=await read();assert.equal(first.playing,false);assert.equal(first.duration,60);
 await p.locator('#play-seconds').click();await p.waitForFunction(()=>window.watchStudy.playback().time>.5,null,{timeout:120000});
 await p.locator('#play-seconds').click();const paused=await read();assert.equal(paused.playing,false);assert.ok(paused.time>.5);assert.deepEqual(paused.position,first.position);assert.notDeepEqual(paused.quaternion,first.quaternion);
 const expected=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-paused.time*Math.PI/30).multiply(new T.Quaternion().fromArray(first.quaternion));assert.ok(new T.Quaternion().fromArray(paused.quaternion).angleTo(expected)<.001);
 await p.waitForTimeout(250);assert.deepEqual(await read(),paused);
 await p.locator('#play-seconds').click();await p.locator('#exploded').click();assert.equal((await read()).playing,false);assert.equal(await p.locator('#play-seconds').isDisabled(),true);
 await p.locator('#assembled').click();assert.equal(await p.locator('#play-seconds').isEnabled(),true);assert.equal((await read()).playing,false);
 await p.emulateMedia({reducedMotion:'reduce'});await p.reload();await p.locator('#viewport[data-ready="true"]').waitFor();assert.equal((await read()).playing,false);
 await p.locator('#play-seconds').click();assert.equal((await read()).playing,true);await p.locator('#play-seconds').click();assert.deepEqual(errors,[]);
 const report={embeddedAnimation:true,duration:60,clockwise:true,seamlessLoop:true,defaultPaused:true,playChangesHandOrientation:true,pivotFixed:true,pauseFreezes:true,explosionPauses:true,reassemblyRequiresManualPlay:true,reducedMotionNoAutoplay:true,explicitPlayWithReducedMotion:true,pageErrors:errors};
 fs.writeFileSync(path.join(__dirname,'playback-validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
