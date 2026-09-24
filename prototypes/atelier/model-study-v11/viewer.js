import {RectAreaLightUniformsLib} from './vendor/RectAreaLightUniformsLib.js';
import {HDRLoader} from './vendor/HDRLoader.js';
import * as T from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {OrbitControls} from './vendor/controls/OrbitControls.js';
const viewport=document.querySelector('#viewport'),status=document.querySelector('#status'),slider=document.querySelector('#explode');
async function start(){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),2));renderer.setClearColor(0x08090b);
 renderer.transmissionResolutionScale=1.25;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 viewport.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(28,1,.001,2);
 const hdr=await new HDRLoader().loadAsync('./studio-small-09.hdr');hdr.mapping=T.EquirectangularReflectionMapping;
 const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(hdr);hdr.dispose();pmrem.dispose();
 scene.environment=environment.texture;scene.environmentIntensity=.38;scene.environmentRotation.y=1.2;
 const gltf=await new GLTFLoader().loadAsync('./aurel-veil.glb');
 scene.add(gltf.scene);
 RectAreaLightUniformsLib.init();
 const silk=new T.RectAreaLight(0xfff7eb,.30,.12,.20);silk.position.set(-.055,.08,.14);silk.lookAt(0,0,-.02);scene.add(silk);
 const edge=new T.RectAreaLight(0xe8f0ff,.35,.035,.18);edge.position.set(.12,.02,.04);edge.lookAt(0,0,-.015);scene.add(edge);
 // Soft fill reveals dial printing while metal still follows the studio environment.
 const fill=new T.HemisphereLight(0xf3f0e7,0x1c2530,.12);scene.add(fill);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const key=new T.SpotLight(0xfff6e9,.025,.5,.55,.8,2);key.position.set(-.06,.09,.14);key.target.position.set(0,0,-.02);scene.add(key,key.target);
 key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.near=.01;key.shadow.camera.far=.4;key.shadow.bias=-.00001;key.shadow.normalBias=.000025;
 const groups=[];gltf.scene.traverse(o=>{
  if(o.userData.component){o.userData.home=o.position.clone();groups.push(o);}
  if(o.isMesh){o.castShadow=o.material.name!=='Optical crystal';o.receiveShadow=true;}
  if(o.isMesh&&o.material.map)o.material.map.anisotropy=renderer.capabilities.getMaxAnisotropy();
 });
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;
 controls.minDistance=.05;controls.maxDistance=.45;
 let view='hero',amount=0;
 function render(){renderer.render(scene,camera);}
 const playButton=document.querySelector('#play-seconds');
 const secondsNode=groups.find(g=>g.name==='seconds_hand');
 const mixer=new T.AnimationMixer(gltf.scene);
 const secondsClip=gltf.animations.find(a=>a.name==='Seconds_Sweep_60s');
 const secondsAction=secondsClip?mixer.clipAction(secondsClip):null;
 if(secondsAction){secondsAction.play();mixer.update(0);}
 let playing=false,lastTimestamp=0;
 function setPlaying(next){
  next=Boolean(next&&secondsAction&&amount===0&&!document.hidden);
  if(next===playing)return;
  playing=next;playButton.textContent=playing?'Pause second hand':'Play second hand';playButton.setAttribute('aria-pressed',String(playing));
  if(playing){lastTimestamp=performance.now();renderer.setAnimationLoop(t=>{if(!playing)return;const delta=Math.max(0,(t-lastTimestamp)/1000);lastTimestamp=t;mixer.update(delta);render();});}
  else{renderer.setAnimationLoop(null);render();}
 }
 playButton.addEventListener('click',()=>setPlaying(!playing));
 function visibility(){if(document.hidden)setPlaying(false);}
 document.addEventListener('visibilitychange',visibility);
 function positionCamera(){
  const mobile=viewport.clientWidth<600;
  if(view==='dial'){camera.position.set(.009,.014,.103);controls.target.set(0,0,.001);}
  else if(view==='bracelet'){camera.position.set(.100,.065,.004);controls.target.set(0,.008,-.026);}
  else if(view==='rear'){camera.position.set(.045,.012,-.155);controls.target.set(0,0,-.024);}
  else{camera.position.set(.040+amount*.07,.025+amount*.02,(mobile?.195:.155)+amount*.08);controls.target.set(0,0,-.018+amount*.01);}
  controls.update();
 }
 function apply(){
  amount=Number(slider.value);
  if(amount>0)setPlaying(false);playButton.disabled=amount>0||!secondsAction;playButton.title=amount>0?'Reassemble the watch to play its second hand.':'';
  for(const g of groups){g.position.copy(g.userData.home);const v=g.userData.explodeOffset;g.position.addScaledVector(new T.Vector3(...v),amount);}
  viewport.dataset.explode=String(amount);status.textContent=amount===0?'Assembled - drag to orbit':Math.round(amount*100)+'% separated - drag to orbit';
  render();
 }
 for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{
  view=b.dataset.view;
  for(const other of document.querySelectorAll('[data-view]'))other.setAttribute('aria-pressed',String(other===b));
  positionCamera();render();
 });
 document.querySelector('#light-angle').addEventListener('input',e=>{scene.environmentRotation.y=1.2+Number(e.target.value)*Math.PI/180;render();});
 slider.addEventListener('input',()=>{view='hero';apply();positionCamera();});
 document.querySelector('#assembled').addEventListener('click',()=>{slider.value='0';apply();positionCamera();});
 document.querySelector('#exploded').addEventListener('click',()=>{slider.value='1';view='hero';apply();positionCamera();});
 function resize(){renderer.setSize(viewport.clientWidth,viewport.clientHeight);camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();positionCamera();render();}
 const observer=new ResizeObserver(resize);observer.observe(viewport);controls.addEventListener('change',render);
 resize();apply();viewport.dataset.ready='true';viewport.dataset.components=String(groups.length);
 window.watchStudy={playback:()=>({playing,time:secondsAction?.time??0,quaternion:secondsNode?.quaternion.toArray(),position:secondsNode?.position.toArray(),duration:secondsClip?.duration??0}),setLight:(a)=>{scene.environmentRotation.y=a;render();},snapshot:()=>groups.map(g=>({name:g.name,position:g.position.toArray(),home:g.userData.home.toArray(),offset:g.userData.explodeOffset})),info:()=>({...renderer.info.render,pixelRatio:renderer.getPixelRatio(),transmissionScale:renderer.transmissionResolutionScale})};
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);playing=false;playButton.disabled=true;playButton.textContent='Play second hand';playButton.setAttribute('aria-pressed','false');status.textContent='Graphics interrupted. Reload to restore the model.';});
 window.addEventListener('pagehide',()=>{renderer.setAnimationLoop(null);document.removeEventListener('visibilitychange',visibility);mixer.stopAllAction();mixer.uncacheRoot(gltf.scene);observer.disconnect();controls.dispose();environment.dispose();gltf.scene.traverse(o=>{o.geometry?.dispose();});renderer.dispose();},{once:true});
}
start().catch(e=>{status.textContent='The 3D viewer could not load. The GLB and studio renders remain available below.';console.error(e);});
