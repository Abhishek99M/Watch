/** One absolute scroll clock: approach, reveal, inspection, reassembly, still finale. */
export function watchTimeline(value: number) {
  if (!Number.isFinite(value)) throw new Error('Timeline progress must be finite');
  const progress = Math.max(0, Math.min(1, value));
  const ease = (t: number) => { const x = Math.max(0, Math.min(1, t)); return x * x * (3 - 2 * x); };
  const reveal = ease((progress - 0.12) / 0.4);
  // Explicit endpoints avoid floating-point residue at the authored holds.
  const close = progress >= 0.94 ? 1 : ease((progress - 0.66) / 0.28);
  const separation = progress >= 0.66 ? 1 - close : progress >= 0.52 ? 1 : reveal;
  return { progress, approach: ease(progress / 0.12) * (1 - close), camera: separation, separation,
    chapter: progress < 0.12 ? 'A closer look' : progress < 0.52 ? 'Layers revealed'
      : progress < 0.66 ? 'A moment to inspect' : progress < 0.94 ? 'Each layer returns' : 'Whole again' };
}
