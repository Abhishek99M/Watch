import * as T from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {GLTFExporter} from './vendor/exporters/GLTFExporter.js';
function canvas(n){const c=document.createElement('canvas');c.width=c.height=n;return c;}
function hash(x,y){const a=Math.sin(x*127.1+y*311.7+8.3)*43758.5453;return a-Math.floor(a);}
function pixels(n,fn){const c=canvas(n),ctx=c.getContext('2d'),im=ctx.createImageData(n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++)im.data.set([...fn(x,y),255],(y*n+x)*4);ctx.putImageData(im,0,0);return c;}
function texture(c,color=false){const t=new T.CanvasTexture(c);t.flipY=false;t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
function dial(){
 const c=canvas(2048),ctx=c.getContext('2d');
 const ground=ctx.createRadialGradient(1024,1024,0,1024,1024,1000);
 ground.addColorStop(0,'#33393b');ground.addColorStop(.55,'#292f31');ground.addColorStop(1,'#15191b');
 ctx.fillStyle=ground;ctx.fillRect(0,0,2048,2048);
 for(let i=0;i<12500;i++){
  const a=i/12500*Math.PI*2,grain=hash(i,7);
  ctx.strokeStyle=grain>.48?'rgba(133,145,146,'+(.025+grain*.045)+')':'rgba(0,0,0,'+(.015+grain*.05)+')';
  ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(1024+Math.cos(a)*36,1024+Math.sin(a)*36);ctx.lineTo(1024+Math.cos(a)*1040,1024+Math.sin(a)*1040);ctx.stroke();
 }
 return texture(c,true);
}
function roughness(kind){
 return texture(pixels(512,(x,y)=>{
  let v=215;
  if(kind==='steel')v=200+hash(x,0)*22+hash(Math.floor(x/8),Math.floor(y/300))*12+hash(x,Math.floor(y/80))*6+hash(x,y)*3;
  if(kind==='plate'){
   const xx=x%38-19,yy=(y+(Math.floor(x/38)%2)*19)%38-19;
   v=200+Math.sin(Math.hypot(xx,yy)*2.8)*13;
  }
  if(kind==='bridge')v=195+Math.sin(x/512*Math.PI*14)*22+hash(x,y)*3;
  return [v,v,v];
 }));
}
export async function bake(){
 const gltf=await new GLTFLoader().loadAsync('./aurel-veil-base.glb');
 const maps={dial:dial(),steel:roughness('steel'),plate:roughness('plate'),bridge:roughness('bridge')};
 maps.dial.userData.mimeType='image/jpeg';
 const micro=texture(pixels(1024,(x,y)=>[128+(hash(x,0)-.5)*12,128,254]));
 micro.repeat.set(.85,.85);maps.steel.repeat.set(1.3,1.3);
 const radial=texture(pixels(512,(x,y)=>{const a=Math.atan2(y-256,x-256);return [128+Math.cos(a)*127,128+Math.sin(a)*127,170];}));
 const sungrain=texture(pixels(512,(x,y)=>{const a=Math.atan2(y-256,x-256),g=(hash(Math.floor((a+Math.PI)*2400),2)-.5)*16;return [128-Math.sin(a)*g,128+Math.cos(a)*g,255];}));
 const azurage=texture(pixels(512,(x,y)=>{const r=Math.hypot(x-256,y-359.68),v=200+Math.sin(r*3.1)*24;return [v,v,v];}));
 const cache=new Map();
 gltf.scene.traverse(o=>{
  if(!o.isMesh)return;const old=o.material;
  if(!cache.has(old.name)){
   const m=old.clone();
   if(old.name==='Black sunray dial'){m.map=maps.dial;m.color.set(0xffffff);m.roughness=.38;m.metalness=.48;m.anisotropy=.48;m.anisotropyMap=radial;m.normalMap=sungrain;m.normalScale=new T.Vector2(.10,.10);}
   if(old.name==='Longitudinal brushed steel'){m.roughnessMap=maps.steel;m.roughness=.40;m.normalMap=micro;m.normalScale=new T.Vector2(.55,.55);m.anisotropy=.55;m.anisotropyRotation=Math.PI/2;}
   if(old.name==='Satin center links'){m.roughness=.29;m.roughnessMap=maps.steel;m.normalMap=micro;m.normalScale=new T.Vector2(.28,.28);m.anisotropy=.40;m.anisotropyRotation=Math.PI/2;}
   if(old.name==='Turned chapter ring'){m.anisotropyMap=radial;m.anisotropy=.45;m.roughness=.24;m.color.set(0x495153);}
   if(old.name==='Azured seconds dial'){m.roughnessMap=azurage;m.roughness=.40;}
   if(old.name==='Perlage mainplate'){m.roughnessMap=maps.plate;m.roughness=.45;}
   if(old.name==='Striped bridges'){m.roughnessMap=maps.bridge;m.roughness=.40;m.anisotropy=.55;m.anisotropyRotation=Math.PI/2;}
   cache.set(old.name,m);
  }
  o.material=cache.get(old.name);
 });
 const binary=await new GLTFExporter().parseAsync(gltf.scene,{binary:true,onlyVisible:true,animations:gltf.animations});
 const bytes=new Uint8Array(binary);let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s);
}
