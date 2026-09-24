/** Scroll is the only clock: approach, separation, then a still inspection hold. */
export function watchTimeline(value: number) {
  if (!Number.isFinite(value)) throw new Error('Timeline progress must be finite');
  const progress = Math.max(0, Math.min(1, value));
  const ease = (t: number) => { const x = Math.max(0, Math.min(1, t)); return x * x * (3 - 2 * x); };
  return { progress, camera: ease(progress / 0.3), separation: ease((progress - 0.3) / 0.5),
    chapter: progress < 0.3 ? 'The assembled form' : progress < 0.8 ? 'Layers revealed' : 'A moment to inspect' };
}
