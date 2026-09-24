import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import sharp from 'sharp';
const destination=process.env.WATCH_VALIDATION_DIR ?? 'docs/watch-validation';
await fs.mkdir(destination,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:process.env.WATCH_NATIVE_GPU === '1' ? [] : ['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const warnings=[];
const referenceWarnings=[];
try {
 const web=await browser.newPage({viewport:{width:600,height:900},deviceScaleFactor:1,hasTouch:true});
 web.setDefaultTimeout(120000);web.on('console',m=>{if(['warning','error'].includes(m.type()))warnings.push(m.text());});
 await web.goto(process.env.WATCH_PREVIEW_URL ?? 'http://localhost:3000/watch');await web.addStyleTag({content:'.scene-stage{width:550px!important;height:500px!important;border:0!important;z-index:9999!important}.scene-orbit-controls{opacity:0}'});await web.getByRole('button',{name:'Load 3D preview'}).click({force:true});
 await web.getByText('3D preview ready. Drag to rotate; scroll or pinch to zoom.').waitFor();
 await web.addStyleTag({content:'.scene-stage{position:fixed!important;left:0!important;top:0!important}'});
 const canvas=web.locator('.scene-stage canvas');await canvas.scrollIntoViewIfNeeded();
 const gpu=await canvas.evaluate(c=>{const gl=c.getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unavailable';});
 const size=await canvas.evaluate(c=>({width:c.clientWidth,height:c.clientHeight}));
 const website=await canvas.screenshot({path:`${destination}/website.png`});
 const home=website;
 const bounds=await canvas.boundingBox();assert(bounds);
 await web.mouse.move(bounds.x+bounds.width*0.45,bounds.y+bounds.height*0.45);await web.mouse.down();await web.mouse.move(bounds.x+bounds.width*0.65,bounds.y+bounds.height*0.5,{steps:8});await web.mouse.up();
 assert(!home.equals(await canvas.screenshot()),'Mouse drag did not rotate');
 await web.getByRole('button',{name:'Reset view'}).click();
 const touch=await web.context().newCDPSession(web);
 const finger=(id,x,y)=>({id,x,y,radiusX:2,radiusY:2,force:1});
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger(0,220,230),finger(1,320,230)]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[finger(0,180,230),finger(1,360,230)]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(!home.equals(await canvas.screenshot()),'Touch pinch did not zoom');
 await web.getByRole('button',{name:'Reset view'}).click();

 await canvas.focus();await web.keyboard.press('ArrowRight');
 const rotated=await canvas.screenshot({path:`${destination}/website-rotated.png`});assert(!home.equals(rotated),'Keyboard rotation did not change the image');
 await web.getByRole('button',{name:'Reset view'}).click();
 await web.getByRole('button',{name:'Zoom in',exact:true}).click();
 const zoomed=await canvas.screenshot();assert(!home.equals(zoomed),'Zoom did not change the image');
 await web.getByRole('button',{name:'Reset view'}).click();
 const reset=await canvas.screenshot();
 await web.close();
 const snapshots={website};
 for (const variant of ['master','optimized']) {
  const p=await browser.newPage({viewport:{width:1100,height:900},deviceScaleFactor:1});p.setDefaultTimeout(120000);p.on('console',m=>{if(['warning','error'].includes(m.type()))referenceWarnings.push(m.text());});
  if(variant==='optimized')await p.route('**/aurel-veil.glb',async route=>route.fulfill({body:await fs.readFile('public/models/aurel-veil.glb'),contentType:'model/gltf-binary'}));
  await p.route('**/model-study-v11/style.css',async route=>route.fulfill({contentType:'text/css',body:await fs.readFile('prototypes/atelier/model-study-v11/style.css','utf8')+`\n#viewport{position:fixed!important;left:0!important;top:0!important;width:${size.width}px!important;height:${size.height}px!important;z-index:9999!important;}header,aside,.renders{visibility:hidden;}`}));
  await p.goto('http://127.0.0.1:43180/model-study-v11/index.html');await p.locator('#viewport[data-ready="true"]').waitFor();
  snapshots[variant]=await p.locator('#viewport canvas').screenshot({path:`${destination}/${variant}.png`});
  await p.close();
 }
 async function difference(a,b){const x=await sharp(a).removeAlpha().raw().toBuffer();const y=await sharp(b).removeAlpha().raw().toBuffer();assert.equal(x.length,y.length);let sum=0,sq=0;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);sum+=d;sq+=d*d;}return {meanAbsoluteChannelDifference:sum/x.length,rootMeanSquareChannelDifference:Math.sqrt(sq/x.length),channelRange:255};}
 const report={gpu,size,referenceWarnings:[...new Set(referenceWarnings)],masterVsOptimized:await difference(snapshots.master,snapshots.optimized),referenceVsWebsite:await difference(snapshots.optimized,website),resetVsInitial:await difference(home,reset),mouseDrag:true,touchPinch:true,keyboardRotation:true,buttonZoom:true,warnings:[...new Set(warnings)]};
 assert(report.masterVsOptimized.meanAbsoluteChannelDifference<1,'Optimization causes excessive visual difference');
 assert(report.referenceVsWebsite.meanAbsoluteChannelDifference<2,'Website does not match V11 rendering');
 assert(report.resetVsInitial.meanAbsoluteChannelDifference<0.1,'Reset does not restore the original view');
 assert(!warnings.some(message => /THREE.Clock|X4122/.test(message)), 'Rendering compatibility warning returned');
 await fs.writeFile(`${destination}/comparison.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
