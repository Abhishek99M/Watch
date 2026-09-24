import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { Box3, BoxGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector3 } from 'three';
import { createExplodedAssembly, frameAssembly } from '../src/three/exploded-assembly';
import { createV11Assembly } from '../src/three/v11-assembly';
import type { LoadedWatch } from '../src/three/model-loader';
import { parseModelDefinition } from '../src/three/model-definition';

function v11Transforms(): LoadedWatch {
  const bytes = readFileSync('public/models/aurel-veil.glb');
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  const nodes: Group[] = json.nodes.map((node: { translation?: number[]; rotation?: number[]; scale?: number[]; matrix?: number[]; extras?: object; name?: string }) => {
    const group = new Group(); group.name = node.name ?? ''; group.userData = structuredClone(node.extras ?? {});
    if (node.matrix) group.applyMatrix4(new Matrix4().fromArray(node.matrix));
    else { if (node.translation) group.position.fromArray(node.translation); if (node.rotation) group.quaternion.fromArray(node.rotation); if (node.scale) group.scale.fromArray(node.scale); }
    return group;
  });
  json.nodes.forEach((node: { children?: number[] }, index: number) => node.children?.forEach(child => nodes[index].add(nodes[child])));
  const root = new Group();
  for (const index of json.scenes[json.scene ?? 0].nodes) root.add(nodes[index]);
  const components: LoadedWatch['components'] = {};
  const definition = parseModelDefinition(JSON.parse(readFileSync('public/models/watch.json', 'utf8')))!;
  for (const [role, indices] of Object.entries(definition.components)) components[role as keyof typeof components] = indices.map(index => nodes[index]);
  // Transform tests use the actual GLB hierarchy/metadata; rendering tests load
  // its real geometry and textures in the browser.
  return { object: root, components, dispose() {} };
}
const snapshot = (asset: LoadedWatch) => Object.values(asset.components).flat().map(object => ({ position:object.position.toArray(), quaternion:object.quaternion.toArray(), scale:object.scale.toArray(), matrix:object.matrix.toArray(), world:object.matrixWorld.toArray(), parent:object.parent }));

test('all 43 actual V11 transforms evaluate absolutely and restore exactly after reversal', () => {
  const asset = v11Transforms(); asset.object.updateMatrixWorld(true);
  const original = snapshot(asset), assembly = createV11Assembly(asset);
  const objects = Object.values(asset.components).flat();
  expect(objects).toHaveLength(43);
  for (const progress of [0,0.25,0.5,0.75,1]) {
    assembly.apply(progress); const forward = snapshot(asset);
    assembly.apply(1); assembly.apply(progress); expect(snapshot(asset)).toEqual(forward);
    objects.forEach((object,index) => {
      expect(object.quaternion.toArray()).toEqual(original[index].quaternion);
      expect(object.scale.toArray()).toEqual(original[index].scale);
      expect(object.parent).toBe(original[index].parent);
    });
  }
  assembly.apply(1);
  objects.forEach((object,index) => expect(object.position.toArray()).toEqual(original[index].position.map((value,axis) => value + object.userData.explodeOffset[axis])));
  for(let i=0;i<100;i++) { assembly.apply((i%17)/16); assembly.apply(1-(i%13)/12); assembly.apply(0); }
  expect(snapshot(asset)).toEqual(original);
  assembly.apply(1); assembly.dispose(); assembly.dispose(); expect(snapshot(asset)).toEqual(original);
  expect(()=>assembly.apply(0.5)).toThrow('disposed');
});

test('controller rejects invalid input atomically and does not move parents or camera', () => {
  const parent=new Group();parent.rotation.set(.2,.4,.1);parent.scale.set(2,3,4);
  const part=new Group();part.position.set(1,2,3);parent.add(part);
  parent.updateMatrixWorld(true);const home=parent.matrix.clone();
  const assembly=createExplodedAssembly([{object:part,offset:[0,0,8],interval:[0,1]}]);
  assembly.apply(0.5);expect(part.position.z).toBe(7);
  const current=part.position.clone();expect(()=>assembly.apply(NaN)).toThrow('finite');expect(part.position).toEqual(current);
  assembly.apply(-10);expect(part.position.toArray()).toEqual([1,2,3]);assembly.apply(10);expect(part.position.z).toBe(11);
  expect(parent.position.toArray()).toEqual([0,0,0]);expect(parent.matrix).toEqual(home);
  expect(()=>createExplodedAssembly([{object:part,offset:[0,Infinity,0],interval:[0,1]}])).toThrow('configuration');
  expect(()=>createExplodedAssembly([{object:parent,offset:[0,0,0],interval:[0,1]},{object:part,offset:[0,0,1],interval:[0,1]}])).toThrow('overlap');
  expect(()=>createExplodedAssembly([{object:part,offset:[0,0,1],interval:[0,1]},{object:part,offset:[0,0,1],interval:[0,1]}])).toThrow('duplicate');
  assembly.dispose();
});

test('V11 configuration fails closed on missing or unbounded metadata', () => {
  const asset=v11Transforms();asset.components.Crystal![0].userData.explodeOffset=[0,0,101];
  expect(()=>createV11Assembly(asset)).toThrow('metadata');
  delete asset.components.Crystal;expect(()=>createV11Assembly(asset)).toThrow('43');
});

test('framing encloses the full translation envelope at portrait and desktop aspects', () => {
  const root=new Group(), part=new Mesh(new BoxGeometry(2,1,1),new MeshBasicMaterial());root.add(part);
  root.scale.setScalar(.5);root.rotation.y=.2;
  const assembly=createExplodedAssembly([{object:part,offset:[0,0,4],interval:[0,1]}]);
  for(const aspect of [.65,1,2.1]) {
    const camera=new PerspectiveCamera(28,aspect,.001,100);const target=new Vector3();
    frameAssembly(camera,assembly.envelope,target);camera.updateProjectionMatrix();
    for(const progress of [0,.25,.5,.75,1]) {
      assembly.apply(progress);const box=new Box3().setFromObject(root,true);
      for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
        const projected=new Vector3(x,y,z).project(camera);
        expect(Math.abs(projected.x)).toBeLessThan(1);expect(Math.abs(projected.y)).toBeLessThan(1);expect(Math.abs(projected.z)).toBeLessThan(1);
      }
    }
  }
  assembly.dispose();part.geometry.dispose();(part.material as MeshBasicMaterial).dispose();
});
