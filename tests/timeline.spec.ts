import { expect, test } from '@playwright/test';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector3 } from 'three';
import { createExplodedAssembly } from '../src/three/exploded-assembly';
import { frameCinematic } from '../src/three/cinematic-camera';
import { watchTimeline } from '../src/animations/watch-timeline';

test('timeline approaches before coordinated separation and holds an exact endpoint in either direction', () => {
  expect(watchTimeline(0)).toMatchObject({ camera: 0, separation: 0 });
  expect(watchTimeline(0.12)).toMatchObject({ approach: 1, camera: 0, separation: 0 });
  expect(watchTimeline(0.52)).toMatchObject({ camera: 1, separation: 1 });
  expect(watchTimeline(0.66)).toMatchObject({ camera: 1, separation: 1 });
  expect(watchTimeline(0.8).separation).toBeCloseTo(0.5);
  expect(watchTimeline(0.94)).toMatchObject({ approach: 0, camera: 0, separation: 0 });
  expect(watchTimeline(1)).toMatchObject({ approach: 0, camera: 0, separation: 0 });
  expect(watchTimeline(-1)).toEqual(watchTimeline(0));
  expect(watchTimeline(2)).toEqual(watchTimeline(1));
  for (const value of [NaN, Infinity, -Infinity]) expect(() => watchTimeline(value)).toThrow();
  const forward = Array.from({ length: 101 }, (_, index) => watchTimeline(index / 100));
  for (let repeat = 0; repeat < 100; repeat++) {
    for (let index = 100; index >= 0; index--) expect(watchTimeline(index / 100)).toEqual(forward[index]);
  }
});


test('cinematic camera approaches, fits moving components and reverses without drift', () => {
  const root = new Group(); root.rotation.y = 0.2; root.scale.setScalar(0.5);
  const body = new Mesh(new BoxGeometry(2, 3, 1), new MeshBasicMaterial());
  const face = new Mesh(new BoxGeometry(1.8, 1.8, 0.1), new MeshBasicMaterial()); face.position.z = 0.6;
  root.add(body, face);
  const assembly = createExplodedAssembly([
    { object: body, offset: [0, 0, 0], interval: [0, 1] },
    { object: face, offset: [0, 0, 5], interval: [0, 1] },
  ]);
  for (const aspect of [0.45, 1, 2.1]) {
    const camera = new PerspectiveCamera(28, aspect, 0.001, 100), target = new Vector3();
    const home = new Vector3(2, 1, 12);
    const evaluate = (progress: number) => {
      const pose = watchTimeline(progress); assembly.apply(pose.separation);
      camera.position.copy(home); target.set(0, 0, 0); camera.lookAt(target);
      frameCinematic(camera, target, assembly.framingPoints(), pose);
      camera.updateMatrixWorld(true); camera.updateProjectionMatrix();
      return [...camera.position.toArray(), ...camera.quaternion.toArray(), ...target.toArray()];
    };
    const initial = evaluate(0);
    evaluate(0.12); expect(camera.position.distanceTo(target)).toBeLessThan(home.length());
    expect(assembly.progress).toBe(0);
    const forward = [];
    for (let i = 0; i <= 100; i++) {
      forward.push(evaluate(i / 100));
      // Check actual transformed geometry, independently of the cached fitting points.
      if (i % 10 === 0 || i === 12) for (const mesh of [body, face]) {
        const positions = mesh.geometry.getAttribute('position');
        for (let vertex = 0; vertex < positions.count; vertex++) {
          const projected = new Vector3().fromBufferAttribute(positions, vertex).applyMatrix4(mesh.matrixWorld).project(camera);
          expect(Math.abs(projected.x)).toBeLessThan(1);
          expect(Math.abs(projected.y)).toBeLessThan(1);
          expect(Math.abs(projected.z)).toBeLessThan(1);
        }
      }
    }
    for (let i = 100; i >= 0; i--) expect(evaluate(i / 100)).toEqual(forward[i]);
    expect(evaluate(0)).toEqual(initial);
    expect(evaluate(0.52)).toEqual(evaluate(0.66));
    expect(evaluate(0.94)).toEqual(initial);
    expect(evaluate(1)).toEqual(initial);
  }
  assembly.dispose();
  for (const mesh of [body, face]) { mesh.geometry.dispose(); (mesh.material as MeshBasicMaterial).dispose(); }
});

test('closing stages are monotone and continuous with still endpoints', () => {
  let previous = 1;
  for (let i = 660; i <= 940; i++) {
    const pose = watchTimeline(i / 1000);
    expect(pose.separation).toBeLessThanOrEqual(previous);
    expect(pose.separation).toBeGreaterThanOrEqual(0);
    previous = pose.separation;
  }
  for (const boundary of [0.12, 0.52, 0.66, 0.94]) {
    for (const key of ['approach', 'camera', 'separation'] as const) {
      expect(Math.abs(watchTimeline(boundary - 1e-6)[key] - watchTimeline(boundary + 1e-6)[key])).toBeLessThan(1e-8);
    }
  }
});
