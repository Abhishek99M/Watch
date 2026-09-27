import { Box3, InterpolateLinear, QuaternionLinearInterpolant, QuaternionKeyframeTrack, Vector3, type PerspectiveCamera } from 'three';
import type { LoadedWatch } from './model-loader';
import { frameAssembly } from './exploded-assembly';

export type MovementView = 'movement' | 'seconds';

/** Explicit detail inspection; no reparenting, geometry edits or invented gear motion. */
export function createMovementInspection(asset: LoadedWatch) {
  const parts = Object.values(asset.components).flat();
  const movement = asset.components.Movement ?? [];
  const hand = asset.components.SecondHand?.find(part => part.name === 'seconds_hand');
  if (!movement.length || !hand) return null;
  const home = hand.quaternion.clone();
  const visibility = parts.map(object => ({ object, visible: object.visible }));
  const clip = asset.animations?.find(animation => animation.name === 'Seconds_Sweep_60s');
  const track = clip?.tracks.find(candidate => candidate.name === `${hand.name}.quaternion`);
  // Only the reviewed rotation track may write to the second hand. Assembly owns translation.
  const supported = clip?.duration === 60 && clip.tracks.length === 1 && track instanceof QuaternionKeyframeTrack && track.getInterpolation() === InterpolateLinear;
  const sample = supported ? new QuaternionLinearInterpolant(track.times, track.values, 4) : null;
  let view: MovementView | null = null, disposed = false;
  function restore() {
    for (const entry of visibility) entry.object.visible = entry.visible;
    hand!.quaternion.copy(home); hand!.updateMatrix();
    view = null;
  }
  function select(value: MovementView | null) {
    if (disposed) return;
    restore(); view = value;
    if (value === 'movement') {
      for (const entry of visibility) entry.object.visible = entry.visible && movement.includes(entry.object);
    }
  }
  return {
    supported: Boolean(supported), select,
    seek(seconds: number) {
      if (!Number.isFinite(seconds)) throw new Error('Seconds must be finite');
      if (disposed || view !== 'seconds' || !sample) return;
      if (seconds <= 0 || seconds >= 60) hand.quaternion.copy(home);
      else hand.quaternion.fromArray(sample.evaluate(seconds));
      hand.updateMatrix();
    },
    frame(camera: PerspectiveCamera, target: Vector3) {
      if (!view || disposed) return;
      asset.object.updateMatrixWorld(true);
      const focus = view === 'movement' ? movement : asset.components.Dial ?? [];
      const box = new Box3();
      for (const object of focus) box.union(new Box3().setFromObject(object, true));
      if (!box.isEmpty()) frameAssembly(camera, box, target);
    },
    dispose() { if (!disposed) { restore(); disposed = true; } },
  };
}
