import { Box3, Vector3, type PerspectiveCamera } from 'three';
import type { watchTimeline } from '@/animations/watch-timeline';

/** Tight per-component fitting. No material, model scale or lens changes. */
export function frameCinematic(camera: PerspectiveCamera, target: Vector3, points: readonly Vector3[], pose: ReturnType<typeof watchTimeline>) {
  // Caller first restores studio.home, guaranteeing the original pose at zero.
  if (pose.progress === 0 || !points.length) return;
  const homeTarget = target.clone();
  const homeRay = camera.position.clone().sub(homeTarget);
  const homeDistance = homeRay.length();
  const direction = homeRay.clone().normalize().lerp(new Vector3(0.9, 0.32, 1.4).normalize(), pose.camera).normalize();
  const center = new Box3().setFromPoints([...points]).getCenter(new Vector3());
  const right = new Vector3().crossVectors(camera.up, direction).normalize();
  const up = new Vector3().crossVectors(direction, right).normalize();
  const tanY = Math.tan(camera.fov * Math.PI / 360), tanX = tanY * camera.aspect;
  const relative = new Vector3();
  function fitAt(lookAt: Vector3) {
    let distance = camera.near;
    for (const point of points) {
      relative.copy(point).sub(lookAt);
      distance = Math.max(distance, relative.dot(direction) + Math.max(camera.near * 2,
        1.08 * Math.max(Math.abs(relative.dot(right)) / tanX, Math.abs(relative.dot(up)) / tanY)));
    }
    return distance;
  }
  // A world-space box center is not the visual center in perspective. Balance
  // the projected edges before blending toward the inspection composition.
  for (let iteration = 0; iteration < 4; iteration++) {
    const distance = fitAt(center);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const point of points) {
      relative.copy(point).sub(center);
      const depth = distance - relative.dot(direction);
      const x = relative.dot(right) / depth, y = relative.dot(up) / depth;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    center.addScaledVector(right, (minX + maxX) * distance / 2);
    center.addScaledVector(up, (minY + maxY) * distance / 2);
  }
  target.lerpVectors(homeTarget, center, pose.camera);
  const fit = fitAt(target);
  const approach = homeDistance * (1 - 0.08 * pose.approach);
  // Preserve the approved initial crop if an unusually short viewport cannot
  // accommodate more approach; once opening, every component must fit.
  const distance = pose.camera === 0 ? Math.min(homeDistance, Math.max(approach, fit))
    : Math.max(fit, approach + (fit - approach) * pose.camera);
  camera.position.copy(target).addScaledVector(direction, distance);
  camera.lookAt(target); camera.updateMatrixWorld(true);
}
