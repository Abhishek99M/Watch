import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries,mergeVertices,computeMikkTSpaceTangents} from 'three/addons/utils/BufferGeometryUtils.js';

import * as MikkTSpace from 'three/addons/libs/mikktspace.module.js';
await MikkTSpace.ready;
const dir=path.dirname(fileURLToPath(import.meta.url));
globalThis.FileReader=class{
 readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}
 readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:'+blob.type+';base64,'+Buffer.from(result).toString('base64');this.onloadend?.();});}
};
const root=new T.Group();root.name='Aurel_Veil_Steel';root.scale.setScalar(.001);
root.userData={title:'Aurel Veil - steel',source:'Original authored geometry',units:'millimeters under meter conversion',movement:'Illustrative mechanical layout, not a functional caliber'};
const mat={
 signature:new T.MeshPhysicalMaterial({name:'Applied dial signature',color:0xe2d0b0,metalness:.78,roughness:.28}),
 steel:new T.MeshPhysicalMaterial({name:'Longitudinal brushed steel',color:0xbec3c6,metalness:1,roughness:.28,anisotropy:.35}),
 polish:new T.MeshPhysicalMaterial({name:'Polished edge steel',color:0xcdd0d2,metalness:1,roughness:.105}),
 chapter:new T.MeshPhysicalMaterial({name:'Turned chapter ring',color:0x757d83,metalness:1,roughness:.27,anisotropy:.35}),
 center:new T.MeshPhysicalMaterial({name:'Satin center links',color:0xc5c9cc,metalness:1,roughness:.12,anisotropy:.15}),
 gold:new T.MeshPhysicalMaterial({name:'Champagne applied gold',color:0xe7cc9e,metalness:1,roughness:.24}),
 dial:new T.MeshPhysicalMaterial({name:'Black sunray dial',color:0x151819,metalness:.55,roughness:.32,anisotropy:.35}),
 subdial:new T.MeshPhysicalMaterial({name:'Azured seconds dial',color:0x242b2d,metalness:.65,roughness:.36}),
 print:new T.MeshStandardMaterial({name:'Warm silver printing',color:0xb6b2a5,metalness:.25,roughness:.42}),
 brass:new T.MeshStandardMaterial({name:'Movement brass',color:0xb29351,metalness:1,roughness:.3}),
 plate:new T.MeshPhysicalMaterial({name:'Perlage mainplate',color:0xa8adb3,metalness:1,roughness:.4}),
 bridge:new T.MeshPhysicalMaterial({name:'Striped bridges',color:0xbec2c6,metalness:1,roughness:.34}),
 blue:new T.MeshStandardMaterial({name:'Thermally blued screws',color:0x192b46,metalness:1,roughness:.22}),
 ruby:new T.MeshPhysicalMaterial({name:'Ruby bearings',color:0x7f1438,metalness:.15,roughness:.13}),
 recess:new T.MeshStandardMaterial({name:'Recess shadow',color:0x0b0d0e,roughness:.75}),
 glass:new T.MeshPhysicalMaterial({name:'Optical crystal',color:0xffffff,metalness:0,roughness:0,transmission:1,ior:1.46,thickness:.65,specularIntensity:.28}),
};
const components=[];
function component(name,role,position=[0,0,0],offset=[0,0,0]){
 const g=new T.Group();g.name=name;g.position.set(...position);g.userData={component:name,role,explodeOffset:offset};
 root.add(g);components.push(g);return g;
}
function mesh(parent,geometry,material,position=[0,0,0],rotation=[0,0,0]){
 if(geometry.userData.finishZones && material!=='polish'){
  const src=geometry.index?geometry.toNonIndexed():geometry,parts=[{p:[],n:[]},{p:[],n:[]}];
  for(let t=0;t<src.attributes.position.count/3;t++){
   const part=parts[geometry.userData.finishZones[t]?1:0];
   for(let i=t*3;i<t*3+3;i++)for(const [attr,key] of [['position','p'],['normal','n']])part[key].push(src.attributes[attr].getX(i),src.attributes[attr].getY(i),src.attributes[attr].getZ(i));
  }
  let main;
  parts.forEach((part,i)=>{if(!part.p.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(part.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(part.n,3));const m=mesh(parent,g,i?'polish':material,position,rotation);if(!i)main=m;});return main;
 }
 const m=new T.Mesh(geometry,mat[material]);m.position.set(...position);m.rotation.set(...rotation);parent.add(m);return m;
}
function disc(r,d,n=96){return new T.CylinderGeometry(r,r,d,n).rotateX(Math.PI/2);}
function lathe(points,n=160){return new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),n).rotateX(Math.PI/2);}
function ring(ro,ri,d,n=96){
 const b=Math.min(.065,d*.22);
 return lathe([[ri,-d/2],[ro-b,-d/2],[ro,-d/2+b],[ro,d/2-b],[ro-b,d/2],[ri,d/2],[ri,-d/2]],n);
}
function rounded(w,h,d,r=.18,segments=2){return new RoundedBoxGeometry(w,h,d,segments,Math.min(r,w*.45,h*.45,d*.45));}
function screw(g,x,y,z,r=.5){
 mesh(g,disc(r,.2,24),'blue',[x,y,z]);
 mesh(g,rounded(r*1.5,.105,.032,.014,1),'recess',[x,y,z+.107],[0,0,.32]);
}
const body=component('case','Case');
const caseCurve=new T.SplineCurve([[18.6,-2.8],[19.25,-2.45],[19.6,-1.55],[19.78,0],[19.72,1.25],[19.4,2.35],[18.8,2.65]].map(v=>new T.Vector2(...v)));
mesh(body,lathe([[17.6,-2.8],...caseCurve.getPoints(48).map(v=>[v.x,v.y]),[17.6,2.65],[17.6,-2.8]],256),'steel');
mesh(body,ring(19.6,19.25,.24,160),'polish',[0,0,2.1]);
mesh(body,ring(19.15,18.75,.23,160),'polish',[0,0,-2.4]);
// Continuous sculpted lug lofts: curved shoulders, rounded polished bevels,
// and a gently descending brushed top that meets the end link rather than a wedge.
for(const sy of [-1,1])for(const sx of [-1,1]){
 const loops=[],count=41,cornerSteps=6;
 for(let j=0;j<count;j++){
  const t=j/(count-1),smooth=t*t*(3-2*t),y=14.2+8.9*t;
  const xi=9.55+.02*smooth,xo=13.6-2.02*smooth+.18*Math.sin(Math.PI*t);
  const zt=1.40-1.80*Math.pow(t,1.4),zb=zt-(2.45-.45*t),r=.17;
  const loop=[];
  for(const [cx,cz,start] of [[xo-r,zt-r,Math.PI/2],[xo-r,zb+r,0],[xi+r,zb+r,-Math.PI/2],[xi+r,zt-r,-Math.PI]]){
   for(let k=0;k<=cornerSteps;k++){
    const a=start-k/cornerSteps*Math.PI/2;
    loop.push([sx*(cx+r*Math.cos(a)),sy*y,cz+r*Math.sin(a)]);
   }
  }
  loops.push(loop);
 }
 const w=loops[0].length,positions=loops.flat(2),indices=[],isTop=[];
 for(let j=0;j<count-1;j++)for(let k=0;k<w;k++){
  const a=j*w+k,b=j*w+(k+1)%w,c=(j+1)*w+k,d=(j+1)*w+(k+1)%w;
  const face=[a,c,b,b,c,d];
  if(sx*sy>0)for(let q=0;q<6;q+=3)[face[q+1],face[q+2]]=[face[q+2],face[q+1]];
  indices.push(...face);isTop.push(k===w-1,k===w-1);
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
 const source=geo.toNonIndexed(),parts=[{p:[],n:[]},{p:[],n:[]}];
 for(let triangle=0;triangle<isTop.length;triangle++){
  const part=parts[isTop[triangle]?0:1];
  for(let v=triangle*3;v<triangle*3+3;v++){
   part.p.push(source.attributes.position.getX(v),source.attributes.position.getY(v),source.attributes.position.getZ(v));
   part.n.push(source.attributes.normal.getX(v),source.attributes.normal.getY(v),source.attributes.normal.getZ(v));
  }
 }
 parts.forEach((part,i)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(part.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(part.n,3));mesh(body,g,i===0?'steel':'polish');});
 const loop=loops.at(-1),capPositions=[];
 for(let i=1;i<w-1;i++){
  const face=[loop[0],loop[i],loop[i+1]];
  if(sx*sy<0)[face[1],face[2]]=[face[2],face[1]];
  capPositions.push(...face.flat());
 }
 const cap=new T.BufferGeometry();cap.setAttribute('position',new T.Float32BufferAttribute(capPositions,3));cap.computeVertexNormals();mesh(body,cap,'steel');
}
const crown=component('crown','Crown',[0,0,0],[7,0,0]);
mesh(crown,disc(.65,4.1,32),'polish',[20,0,0],[0,Math.PI/2,0]);
const crownProfile=[[0,-1.75],[2.10,-1.75],[2.45,-1.5],[2.55,-1.1],[2.55,1.1],[2.4,1.5],[2.0,1.72],[0,1.72]];
mesh(crown,lathe(crownProfile,96),'steel',[21.80,0,0],[0,Math.PI/2,0]);
for(let i=0;i<52;i++){
 const a=i*Math.PI*2/52;
 mesh(crown,rounded(2.3,.115,.12,.035,1),'polish',[21.80,Math.cos(a)*2.55,Math.sin(a)*2.55],[a,0,0]);
}
mesh(crown,ring(1.85,1.78,.055,64),'polish',[23.54,0,0],[0,Math.PI/2,0]);
// A discreet raised V signature, modeled on the actual crown face.
for(const sign of [-1,1])mesh(crown,rounded(.055,1.16,.085,.024,2),'polish',[23.55,0,sign*.24],[sign*.42,0,0]);
// Caseback remains removable; concentric turning is texture rather than floating rings.
const back=component('caseback','Caseback',[0,0,-3.0],[0,0,-23]);
mesh(back,lathe([[0,-.5],[16.4,-.5],[18.3,-.18],[18.7,0],[18.3,.5],[0,.5]],160),'plate');
mesh(back,ring(18.65,17.85,.3,128),'polish');
for(let i=0;i<6;i++){const a=i*Math.PI/3;screw(back,17.35*Math.cos(a),17.35*Math.sin(a),.42,.46);}
const movement=component('movement','Movement',[0,0,-1.75],[0,0,-13]);
mesh(movement,disc(16.6,.75,128),'plate');
mesh(movement,ring(16.65,16.1,.25,128),'polish',[0,0,.37]);
function wheel(g,x,y,z,r,teeth){
 const outline=new T.Shape();
 for(let i=0;i<teeth*4;i++){
  const a=i/(teeth*4)*Math.PI*2,rr=i%4===1||i%4===2?r:r*.93;
  if(i===0)outline.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else outline.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);
 }
 outline.closePath();
 for(let k=0;k<5;k++){
  const a=k*Math.PI*2/5,b=a+.9;
  const hole=new T.Path();hole.moveTo(Math.cos(a)*r*.32,Math.sin(a)*r*.32);
  hole.absarc(0,0,r*.72,a,b,false);hole.lineTo(Math.cos(b)*r*.32,Math.sin(b)*r*.32);hole.absarc(0,0,r*.32,b,a,true);outline.holes.push(hole);
 }
 const geo=new T.ExtrudeGeometry(outline,{depth:.27,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,curveSegments:5,steps:1});
 mesh(g,geo,'brass',[x,y,z]);mesh(g,disc(.55,.65,24),'polish',[x,y,z+.26]);screw(g,x,y,z+.57,.3);
}
wheel(movement,-6,4,.58,4.5,48);wheel(movement,1.65,4.15,.58,3.25,36);
wheel(movement,7.4,1.2,.58,3.3,40);wheel(movement,3,-4,.58,3.0,36);
wheel(movement,-3.9,-7,.58,4.15,44);
mesh(movement,ring(3.5,3.16,.26,64),'brass',[9,-8,.95]);
for(let i=0;i<3;i++){const a=i*Math.PI*2/3;mesh(movement,rounded(2.9,.22,.15,.03,1),'brass',[9+Math.cos(a)*1.6,-8+Math.sin(a)*1.6,.95],[0,0,a]);}
const spiral=new T.CatmullRomCurve3(Array.from({length:145},(_,i)=>{const a=i/144*Math.PI*10,r=.4+i/144*2.65;return new T.Vector3(9+Math.cos(a)*r,-8+Math.sin(a)*r,1.17);}));
mesh(movement,new T.TubeGeometry(spiral,144,.027,4,false),'blue');
const bridges=component('bridges','Movement',[0,0,.05],[0,0,-5]);
for(const sign of [-1,1]){
 const s=new T.Shape();s.moveTo(-12,sign*3);s.bezierCurveTo(-15,sign*7,-9,sign*13,-4,sign*13);
 s.bezierCurveTo(2,sign*14,10,sign*12,11,sign*8);s.quadraticCurveTo(10,sign*5,7,sign*6);
 s.lineTo(-3,sign*9);s.quadraticCurveTo(-8,sign*8,-8,sign*4);s.closePath();
 const h=new T.Path();h.absellipse(-5,sign*10.5,2,.9,0,Math.PI*2,true);s.holes.push(h);
 mesh(bridges,new T.ExtrudeGeometry(s,{depth:.52,bevelEnabled:true,bevelSize:.10,bevelThickness:.08,bevelSegments:2,curveSegments:10,steps:1}),'bridge',[0,0,-.2]);
}
for(const [x,y]of [[-10,5],[-7,11],[5,10],[8,-8],[-8,-7]]){
 mesh(bridges,disc(.8,.16,32),'brass',[x,y,.40]);
 mesh(bridges,ring(.70,.44,.09,32),'polish',[x,y,.51]);
 mesh(bridges,disc(.37,.20,32),'ruby',[x,y,.48]);
}
for(const [x,y]of [[-12,7],[8,8],[-7,-11],[2,-11]]){
 mesh(bridges,ring(.69,.51,.055,32),'polish',[x,y,.45]);screw(bridges,x,y,.42);
}
// Concentric barrel cover and axial bosses give the illustrative caliber layered depth.
mesh(movement,disc(3.15,.15,80),'bridge',[-3.9,-7,1.10]);
mesh(movement,ring(3.03,2.96,.025,80),'polish',[-3.9,-7,1.19]);
mesh(movement,ring(2.80,2.75,.025,80),'polish',[-3.9,-7,1.19]);
screw(movement,-3.9,-7,1.22,.35);
const dial=component('dial','Dial',[0,0,1.75],[0,0,11]);
// A true recessed small-seconds well, with the main dial surface cut around it.
const dialOutline=new T.Shape();dialOutline.absarc(0,0,18.12,0,Math.PI*2,false);
const secondsWell=new T.Path();secondsWell.absarc(0,-8.1,3.85,0,Math.PI*2,true);dialOutline.holes.push(secondsWell);
mesh(dial,new T.ExtrudeGeometry(dialOutline,{depth:.42,bevelEnabled:false,curveSegments:96,steps:1}),'dial',[0,0,-.21]);
mesh(dial,disc(3.84,.16,96),'subdial',[0,-8.1,.03]);
mesh(dial,lathe([[3.65,.09],[3.85,.09],[3.85,.23],[3.80,.23],[3.65,.09]],128),'chapter',[0,-8.1,0]);
mesh(dial,ring(3.84,3.80,.025,128),'polish',[0,-8.1,.235]);
for(let i=0;i<60;i++){const a=i*Math.PI/30;mesh(dial,new T.BoxGeometry(i%5===0?.06:.026,i%5===0?.30:.13,.008),'print',[Math.sin(a)*3.31,-8.1+Math.cos(a)*3.31,.12],[0,0,-a]);}
// Concentric azurage grooves have real depth and are grouped with the recessed disc.
mesh(dial,ring(3.00,2.975,.009,96),'chapter',[0,-8.1,.118]);
// Fine polished inner rehaut lip catches light beneath the crystal.
mesh(dial,ring(17.82,17.77,.045,160),'polish',[0,0,.285]);
mesh(dial,lathe([[17.73,.23],[18.12,.23],[18.12,.98],[17.96,.98],[17.73,.23]],160),'chapter');
// A recessed dark minute flange and two hairline circular cuts articulate the dial edge.
mesh(dial,ring(17.68,16.72,.035,160),'chapter',[0,0,.235]);
mesh(dial,ring(16.78,16.745,.018,160),'print',[0,0,.261]);
// Printed minute track and individually raised, beveled applied indices.
for(let i=0;i<60;i++){
 const a=i*Math.PI/30;
 mesh(dial,new T.BoxGeometry(i%5===0?.10:.042,i%5===0?.53:.27,.008),'print',[Math.sin(a)*17.28,Math.cos(a)*17.28,.265],[0,0,-a]);
}
// Original vector-drawn applied lettering. No font image or platform font dependency.
function polygon(points){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
function glyph(letter){
 let s;
 if(letter==='A'){
  s=polygon([[0,0],[.14,0],[.26,.34],[.64,.34],[.76,0],[.90,0],[.49,1.2],[.41,1.2]]);
  const h=new T.Path();h.moveTo(.30,.47);h.lineTo(.45,.94);h.lineTo(.60,.47);h.closePath();s.holes.push(h);
 }else if(letter==='U'){
  s=new T.Shape();s.moveTo(0,1.2);s.lineTo(.14,1.2);s.lineTo(.14,.38);s.bezierCurveTo(.14,.03,.76,.03,.76,.38);s.lineTo(.76,1.2);s.lineTo(.9,1.2);s.lineTo(.9,.37);s.bezierCurveTo(.9,-.12,0,-.12,0,.37);s.closePath();
 }else if(letter==='R'){
  s=new T.Shape();s.moveTo(0,0);s.lineTo(.14,0);s.lineTo(.14,.49);s.lineTo(.44,.49);s.lineTo(.75,0);s.lineTo(.92,0);s.lineTo(.59,.52);s.bezierCurveTo(1.06,.68,.95,1.2,.52,1.2);s.lineTo(0,1.2);s.closePath();
  const h=new T.Path();h.moveTo(.14,.62);h.lineTo(.51,.62);h.bezierCurveTo(.85,.62,.85,1.06,.51,1.06);h.lineTo(.14,1.06);h.closePath();s.holes.push(h);
 }else if(letter==='E')s=polygon([[0,0],[.82,0],[.82,.13],[.14,.13],[.14,.55],[.70,.55],[.70,.68],[.14,.68],[.14,1.07],[.82,1.07],[.82,1.2],[0,1.2]]);
 else if(letter==='L')s=polygon([[0,0],[.82,0],[.82,.13],[.14,.13],[.14,1.2],[0,1.2]]);
 else if(letter==='V')s=polygon([[0,1.2],[.14,1.2],[.45,.24],[.76,1.2],[.90,1.2],[.49,0],[.41,0]]);
 else if(letter==='I')s=polygon([[.34,0],[.48,0],[.48,1.2],[.34,1.2]]);
 return s;
}
function wordmark(word,y,scale,tracking,finish,z){
 const widths={A:.90,U:.90,R:.92,E:.82,L:.82,V:.90,I:.82};
 const total=[...word].reduce((sum,c)=>sum+widths[c]*scale,0)+(word.length-1)*tracking;let x=-total/2;
 for(const c of word){
  const geo=new T.ExtrudeGeometry(glyph(c),{depth:.035/scale,bevelEnabled:false,curveSegments:12,steps:1});geo.scale(scale,scale,scale);
  const m=mesh(dial,geo,finish,[x,y,z]);m.name='wordmark_'+c;x+=widths[c]*scale+tracking;
 }
}
wordmark('AUREL',6.80,1.10,.23,'signature',.245);
wordmark('VEIL',5.55,.36,.22,'print',.223);
// A small folded-V emblem echoes the faceted hands without crowding the wordmark.
for(const sign of [-1,1]){
 const s=polygon([[sign*.70,10.25],[sign*.53,10.25],[0,9.32],[0,9.06]]);
 mesh(dial,new T.ExtrudeGeometry(s,{depth:.045,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:1,steps:1}),'signature',[0,0,.26]);
}
function baton(w,h){
 const shape=new T.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w*.34,h/2);shape.lineTo(-w*.34,h/2);shape.closePath();
 const base=new T.ExtrudeGeometry(shape,{depth:.17,bevelEnabled:true,bevelThickness:.04,bevelSize:.035,bevelSegments:2,steps:1});
 const v=[[-w/2,-h/2,.21],[w/2,-h/2,.21],[w*.34,h/2,.21],[-w*.34,h/2,.21],[0,-h/2,.36],[0,h/2,.36]];
 const roof=new T.BufferGeometry();roof.setAttribute('position',new T.Float32BufferAttribute([0,4,5,0,5,3,4,1,2,4,2,5,0,1,4,3,5,2].flatMap(i=>v[i]),3));roof.computeVertexNormals();
 roof.setAttribute('uv',new T.Float32BufferAttribute(new Array(18*2).fill(0),2));
 return mergeGeometries([base,roof]);
}
for(let i=0;i<12;i++){
 const a=i*Math.PI/6;
 if(i===0){for(const x of [-.52,.52])mesh(dial,baton(.40,3.10),'gold',[x,14.85,.38]);continue;}
 mesh(dial,baton(.62,2.90),'gold',[Math.sin(a)*15.0,Math.cos(a)*15.0,.38],[0,0,-a]);
}
function hand(name,len,width,angle,z){
 const g=component(name,name==='hour_hand'?'HourHand':'MinuteHand',[0,0,z],[0,0,name==='hour_hand'?17:20]);
 const s=new T.Shape();s.moveTo(-width*.28,-1.8);s.lineTo(-width*.5,len*.65);s.lineTo(0,len);s.lineTo(width*.5,len*.65);s.lineTo(width*.28,-1.8);s.closePath();
 mesh(g,new T.ExtrudeGeometry(s,{depth:.10,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:2,steps:1}),'gold');
 const ridge=new T.BufferGeometry();
 ridge.setAttribute('position',new T.Float32BufferAttribute([-width*.5,len*.65,.13,0,-1.8,.13,0,len*.55,.29,-width*.5,len*.65,.13,0,len*.55,.29,0,len,.13,0,-1.8,.13,width*.5,len*.65,.13,0,len*.55,.29,0,len*.55,.29,width*.5,len*.65,.13,0,len,.13],3));
 ridge.computeVertexNormals();mesh(g,ridge,'gold');g.rotation.z=angle;return g;
}
hand('hour_hand',10.4,1.30,55*Math.PI/180,2.55);hand('minute_hand',14.6,.80,-Math.PI/3,2.96);
const seconds=component('seconds_hand','SecondHand',[0,-8.1,2.03],[0,0,23]);
mesh(seconds,rounded(.075,4.2,.07,.018,1),'gold',[0,1.04,0]);mesh(seconds,ring(.23,.15,.08,32),'gold',[0,-.73,0]);mesh(seconds,disc(.24,.12,32),'gold');seconds.rotation.z=135*Math.PI/180;
const pin=component('hand_pin','SecondHand',[0,0,3.6],[0,0,25]);mesh(pin,disc(.64,.18,32),'gold');mesh(pin,disc(.20,.20,24),'polish');
const bezel=component('bezel','Bezel',[0,0,2.83],[0,0,31]);
mesh(bezel,lathe([[18.15,-.45],[19.30,-.45],[19.62,-.2],[19.69,.0],[19.62,.20],[18.67,.56],[18.28,.58],[18.15,.36],[18.15,-.45]],192),'polish');
mesh(bezel,ring(18.3,18.15,.08,160),'polish',[0,0,.53]);
mesh(bezel,ring(18.19,18.04,.30,160),'recess',[0,0,.79]);
const crystal=component('crystal','Crystal',[0,0,4.03],[0,0,40]);
const glassProfile=[[0,-.28],[17.88,-.28],[18.08,-.14],[18.10,.05],[18.04,.16],[17.9,.23]];
for(let i=1;i<=24;i++){const r=17.9*(1-i/24);glassProfile.push([r,.23+.24*(1-(r/17.9)**2)]);}
glassProfile.push([0,-.28]);const glassGeometry=lathe(glassProfile,192);
const gp=glassGeometry.attributes.position,gn=glassGeometry.attributes.normal;
for(let i=0;i<gp.count;i++)if(Math.hypot(gp.getX(i),gp.getY(i))<.0001)gn.setXYZ(i,0,0,gp.getZ(i)>0?1:-1);
mesh(crystal,glassGeometry,'glass');
// Fitted three-piece end link: case-matched arc and a shallow descending top.
for(const sign of [-1,1]){
 const end=component('end_link_'+(sign>0?'upper':'lower'),'Strap');
 for(const [xl,xr,finish] of [[-9.50,-3.85,'steel'],[-3.70,3.70,'center'],[3.85,9.50,'steel']]){
  const shape=new T.Shape(),edge=x=>Math.sqrt(19.93*19.93-x*x)+.035;
  shape.moveTo(xl,sign*edge(xl));
  for(let j=1;j<=24;j++){const x=xl+(xr-xl)*j/24;shape.lineTo(x,sign*edge(x));}
  const outer=finish==='steel'?24.05:22.30;
  shape.lineTo(xr,sign*outer);shape.lineTo(xl,sign*outer);shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{depth:1.68,bevelEnabled:true,bevelSize:.055,bevelThickness:.07,bevelSegments:3,curveSegments:24,steps:1});
  const ep=geo.attributes.position,en=geo.attributes.normal;
  for(let i=0;i<ep.count;i++){
   const x=ep.getX(i),y=ep.getY(i),z=ep.getZ(i),nz=en.getZ(i);
   const top=.54-.275*(Math.abs(y)-20)+.04*(1-(x/10)**2);
   ep.setZ(i,z+top-1.75);
   const n=new T.Vector3(en.getX(i)+.0008*x*nz,en.getY(i)+.275*Math.sign(y)*nz,nz).normalize();en.setXYZ(i,...n.toArray());
  }
  mesh(end,geo,finish);
 }
 mesh(end,disc(.38,19.2,32),'steel',[0,sign*23,-.7],[0,Math.PI/2,0]);
}
// Machined link profile: shallow cylindrical top, narrow bevels, flat sidewalls.
function machinedLink(w,h,d){
 const r=.26,dims=[w,h,d],positions=[],normals=[],zones=[];
 function samples(size,steps){
  const half=size/2,core=half-r,edge=[0,.32,.68,1];
  return [...edge.slice(0,-1).map(v=>-half+r*v),...Array.from({length:steps+1},(_,i)=>-core+2*core*i/steps),...edge.slice(0,-1).reverse().map(v=>half-r*v)];
 }
 const grids=[samples(w,6),samples(h,14),samples(d,1)];
 function vertex(p){
  const c=p.map((v,i)=>T.MathUtils.clamp(v,-dims[i]/2+r,dims[i]/2-r));
  const n=new T.Vector3(...p.map((v,i)=>v-c[i])).normalize();
  const q=c.map((v,i)=>v+n.getComponent(i)*r),x=q[0],y=q[1];
  const dx=-.075*8*x/(w*w),dy=-.42*8*y/(h*h);
  q[2]+=.42*(1-(2*y/h)**2)+.075*(1-(2*x/w)**2);
  const nn=new T.Vector3(n.x-dx*n.z,n.y-dy*n.z,n.z).normalize();
  return {p:q,n:nn.toArray(),finish:Math.abs(n.x)>.15&&n.z>.12&&Math.abs(n.y)<.4};
 }
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
  const u=(axis+1)%3,v=(axis+2)%3,us=grids[u],vs=grids[v];
  for(let i=0;i<us.length-1;i++)for(let j=0;j<vs.length-1;j++){
   const corners=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]].map(([a,b])=>{const p=[0,0,0];p[axis]=sign*dims[axis]/2;p[u]=us[a];p[v]=vs[b];return vertex(p);});
   const triangles=sign>0?[[0,1,2],[0,2,3]]:[[0,2,1],[0,3,2]];
   for(const tri of triangles){zones.push(tri.filter(i=>corners[i].finish).length>=2);for(const k of tri){positions.push(...corners[k].p);normals.push(...corners[k].n);}}
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.userData.finishZones=zones;return g;
}
for(const sign of [-1,1]){
 for(let row=0;row<14;row++){
  const a=.8415+row*.157,ry=35,rz=31;
  const g=component('bracelet_'+(sign>0?'upper':'lower')+'_'+String(row+1).padStart(2,'0'),'Strap',[0,sign*ry*Math.sin(a),-24.0+rz*Math.cos(a)]);g.rotation.x=-sign*a;
  const width=19.1-row*.215,center=7.4-row*.07,gap=.14,outer=(width-center-2*gap)/2;
  for(const sx of [-1,1]){
   mesh(g,machinedLink(outer,4.70,1.95),'steel',[sx*(center/2+gap+outer/2),0,0]);
   mesh(g,disc(.34,.035,24),'recess',[sx*(width/2+.005),0,-.05],[0,Math.PI/2,0]);
   mesh(g,disc(.28,.042,24),'steel',[sx*(width/2+.025),0,-.05],[0,Math.PI/2,0]);
   mesh(g,rounded(.022,.33,.065,.009,1),'recess',[sx*(width/2+.049),0,-.05],[0,Math.PI/2,.3]);
  }
  const ca=a-.055;
  const local=new T.Vector3(0,sign*ry*(Math.sin(ca)-Math.sin(a)),rz*(Math.cos(ca)-Math.cos(a))).applyAxisAngle(new T.Vector3(1,0,0),sign*a);
  mesh(g,machinedLink(center,4.70,2.00),'center',local.toArray(),[sign*.055,0,0]);
 }
}
const clasp=component('folding_clasp','Strap',[0,0,-54.2]);
mesh(clasp,rounded(16.10,13.7,1.9,.19,3),'steel');
mesh(clasp,rounded(11.9,12.5,.25,.12,2),'center',[0,0,-1.36]);
for(const x of [-8.12,8.12]){
 mesh(clasp,rounded(.45,12.4,1.2,.18,2),'polish',[x,0,-.15]);
 mesh(clasp,rounded(.65,3.3,1.0,.24,3),'polish',[Math.sign(x)*8.42,0,.05]);
}
mesh(clasp,rounded(15.6,.075,.035,.01,1),'recess',[0,-4.8,-1.33]);
// Consolidate only inside each movable component, preserving the full articulation.
for(const g of components){
 const buckets=new Map();
 for(const m of [...g.children]){
  if(!m.isMesh)continue;
  m.updateMatrix();let geo=m.geometry.clone().applyMatrix4(m.matrix);
  if(geo.index)geo=geo.toNonIndexed();
  const pos=geo.attributes.position,uv=[];
  // Box-project the finish on side faces too; XY-only projection collapses their UVs.
  const va=new T.Vector3(),vb=new T.Vector3(),vc=new T.Vector3();
  for(let i=0;i<pos.count;i+=3){
   va.fromBufferAttribute(pos,i);vb.fromBufferAttribute(pos,i+1);vc.fromBufferAttribute(pos,i+2);
   const n=vb.clone().sub(va).cross(vc.clone().sub(va));const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);
   for(let j=i;j<i+3;j++){
    if(az>=ax&&az>=ay)uv.push(pos.getX(j)/40+.5,.5-pos.getY(j)/40);
    else if(ay>=ax)uv.push(pos.getX(j)/40+.5,pos.getZ(j)/40+.5);
    else uv.push(pos.getZ(j)/40+.5,.5-pos.getY(j)/40);
   }
  }
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  if(!buckets.has(m.material.name))buckets.set(m.material.name,{material:m.material,geometries:[]});
  buckets.get(m.material.name).geometries.push(geo);g.remove(m);
 }
 for(const {material,geometries}of buckets.values()){
  let geometry=mergeVertices(mergeGeometries(geometries),.000001);
  if(material.anisotropy>0){computeMikkTSpaceTangents(geometry,MikkTSpace);geometry=mergeVertices(geometry,.000001);}
  const m=new T.Mesh(geometry,material);m.name=g.name+'__'+material.name.replaceAll(' ','_');g.add(m);
 }
}
let triangles=0,meshes=0;root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
const times=[],rotations=[];
for(let t=0;t<=60;t++){times.push(t);rotations.push(...new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),seconds.rotation.z-t*Math.PI/30).toArray());}
const sweep=new T.AnimationClip('Seconds_Sweep_60s',60,[new T.QuaternionKeyframeTrack('seconds_hand.quaternion',times,rotations)]);
const binary=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true,animations:[sweep]});
await fs.writeFile(path.join(dir,'aurel-veil-base.glb'),Buffer.from(binary));
const manifest={name:'Aurel Veil - Steel',source:'build-model.mjs',status:'Visual review - Phase 6 pending',animation:{name:'Seconds_Sweep_60s',duration:60,direction:'clockwise',target:'seconds_hand'},bytes:binary.byteLength,triangles,meshes,components:components.map(g=>({name:g.name,role:g.userData.role,position:g.position.toArray(),rotation:g.rotation.toArray().slice(0,3),explodeOffset:g.userData.explodeOffset})),ownership:'Original authored procedural geometry and texture source retained alongside the asset; no external watch mesh used; external CC0 studio environment credited in ASSET-CREDITS.md',limitations:['Illustrative, non-functional movement','Visual review and website integration pending']};
await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({bytes:binary.byteLength,triangles,meshes,components:components.length}));
