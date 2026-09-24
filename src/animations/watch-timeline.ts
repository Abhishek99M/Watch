/** Scroll is the only clock: approach, coordinated reveal, then inspection. */
export function watchTimeline(value: number) {
  if (!Number.isFinite(value)) throw new Error('Timeline progress must be finite');
  const progress = Math.max(0, Math.min(1, value));
  const ease = (t: number) => { const x = Math.max(0, Math.min(1, t)); return x * x * (3 - 2 * x); };
  const reveal = ease((progress - 0.18) / 0.62);
  return { progress, approach: ease(progress / 0.18), camera: reveal, separation: reveal,
    chapter: progress < 0.18 ? 'A closer look' : progress < 0.8 ? 'Layers revealed' : 'A moment to inspect' };
}
