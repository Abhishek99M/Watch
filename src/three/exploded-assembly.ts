import { Box3, Vector3, type Object3D, type PerspectiveCamera } from 'three';

export type AssemblyPart = {
  object: Object3D;
  /** Translation in the component parent's local coordinates. */
  offset: readonly [number, number, number];
  interval: readonly [number, number];
};

/** Absolute evaluation: reversing or repeating progress never accumulates error. */
export function createExplodedAssembly(parts: AssemblyPart[]) {
  if (!parts.length) throw new Error('Assembly has no parts');
  const objects = new Set(parts.map(part => part.object));
  if (objects.size !== parts.length) throw new Error('Assembly contains duplicate parts');
  const homes = parts.map(({ object, offset, interval }) => {
    if (offset.length !== 3 || !offset.every(Number.isFinite) || interval.length !== 2 ||
        !interval.every(Number.isFinite) || interval[0] < 0 || interval[1] > 1 || interval[0] >= interval[1]) throw new Error('Invalid assembly configuration');
    for (let parent = object.parent; parent; parent = parent.parent) {
      if (objects.has(parent)) throw new Error('Assembly parts must not overlap');
    }
    if (object.matrixAutoUpdate) object.updateMatrix();
    return { object, offset: new Vector3(...offset), interval: [...interval], position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone(), matrix: object.matrix.clone() };
  });
  let disposed = false;
  let progress = 0;
  function apply(value: number) {
    if (disposed) throw new Error('Assembly is disposed');
    if (!Number.isFinite(value)) throw new Error('Assembly progress must be finite');
    progress = Math.min(1, Math.max(0, value));
    for (const home of homes) {
      const t = Math.min(1, Math.max(0, (progress - home.interval[0]) / (home.interval[1] - home.interval[0])));
      const amount = t * t * (3 - 2 * t);
      home.object.position.copy(home.position);
      if (amount !== 0) home.object.position.addScaledVector(home.offset, amount);
      home.object.quaternion.copy(home.quaternion);
      home.object.scale.copy(home.scale);
      home.object.matrix.copy(home.matrix);
      if (amount !== 0) home.object.matrix.setPosition(home.object.position);
      home.object.updateWorldMatrix(true, true);
    }
    return progress;
  }
  function bounds() {
    const box = new Box3();
    for (const { object } of homes) box.expandByObject(object, true);
    return box;
  }
  // Endpoint union bounds all monotone translation paths, including staged ones.
  apply(0);
  const envelope = bounds();
  apply(1); envelope.union(bounds()); apply(0);
  return {
    envelope,
    get progress() { return progress; },
    apply,
    dispose() { if (!disposed) { apply(0); disposed = true; } },
  };
}

/** Camera framing is separate from component evaluation and never changes lights. */
export function frameAssembly(camera: PerspectiveCamera, box: Box3, target: Vector3) {
  target.copy(box.getCenter(new Vector3()));
  const direction = new Vector3(0.8, 0.45, 1.4).normalize();
  camera.position.copy(target).add(direction); camera.lookAt(target);
  camera.updateMatrixWorld(true);
  const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const tanY = Math.tan(camera.fov * Math.PI / 360), tanX = tanY * camera.aspect;
  let distance = 0;
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const corner = new Vector3(x, y, z).sub(target);
    distance = Math.max(distance, corner.dot(direction) + 1.15 * Math.max(Math.abs(corner.dot(right)) / tanX, Math.abs(corner.dot(up)) / tanY));
  }
  camera.position.copy(target).addScaledVector(direction, distance);
  camera.lookAt(target); camera.updateMatrixWorld(true);
}
