'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AssemblyPreviewHandle } from './assembly-controls';

export function MovementControls({ controller, reduced, view, onView }: {
  controller: NonNullable<AssemblyPreviewHandle['movement']>; reduced: boolean;
  view: 'movement' | 'seconds' | null; onView: (view: 'movement' | 'seconds' | null) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const seconds = useRef(0), slider = useRef<HTMLInputElement>(null), output = useRef<HTMLOutputElement>(null);
  const id = useId();
  const host = useRef<HTMLFieldSetElement>(null);
  const seek = (value: number) => {
    seconds.current = value; controller.seek(value);
    if (slider.current) slider.current.value = String(value);
    if (output.current) output.current.value = `${value.toFixed(1)} s`;
  };
  useEffect(() => {
    if (!playing || reduced || view !== 'seconds') return;
    let frame = 0, started: number | null = null;
    const initial = seconds.current;
    const tick = (now: number) => {
      started ??= now;
      const value = (initial + (now - started) / 1000) % 60;
      seconds.current = value; controller.seek(value);
      if (slider.current) slider.current.value = String(value);
      if (output.current) output.current.value = `${value.toFixed(1)} s`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const pause = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', pause);
    const observer = new IntersectionObserver(entries => { if (!entries[0]?.isIntersecting) setPlaying(false); });
    // Observe the canvas, not the controls: playback must stop when the watch leaves view.
    const surface = host.current?.closest('.watch-story')?.querySelector('canvas');
    if (surface) observer.observe(surface);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', pause); };
  }, [playing, reduced, view, controller]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const pause = () => setPlaying(false);
    media.addEventListener('change', pause);
    return () => { media.removeEventListener('change', pause); controller.select(null); };
  }, [controller]);
  const select = (value: typeof view) => { setPlaying(false); seek(0); controller.select(value); onView(value); };
  return <fieldset className="movement-controls" ref={host}>
    <legend>Beneath the dial</legend>
    <p className="text-muted">An illustrative construction study, not a working caliber simulation.</p>
    <div className="assembly-actions">
      <Button variant="secondary" aria-pressed={view === 'movement'} onClick={() => select('movement')}>Inspect movement</Button>
      <Button variant="secondary" aria-pressed={view === 'seconds'} onClick={() => select('seconds')}>Inspect second hand</Button>
      {view && <Button variant="quiet" onClick={() => select(null)}>Return to watch</Button>}
    </div>
    {view === 'movement' && <p role="status">Movement and bridges, isolated for a closer look. The remaining watch components are temporarily hidden. These modeled details remain still.</p>}
    {view === 'seconds' && <>
      <p>The authored second hand completes one sweep in 60 seconds. This preview does not show a functioning gear train or keep live time.</p>
      {controller.supported ? <>
        <div className="assembly-slider-label"><label htmlFor={id}>Second-hand position</label><output ref={output} htmlFor={id} aria-live="off">0.0 s</output></div>
        <input ref={slider} id={id} type="range" min="0" max="60" step="0.1" defaultValue="0" onChange={event => { setPlaying(false); seek(Number(event.currentTarget.value)); }} />
        <div className="assembly-actions">
          {!reduced && <Button variant="secondary" onClick={() => setPlaying(value => !value)}>{playing ? 'Pause second hand' : 'Play second hand'}</Button>}
          <Button variant="quiet" onClick={() => { setPlaying(false); seek(0); }}>Reset second hand</Button>
        </div>
        {reduced && <p className="text-muted">Reduced motion is on. Use the slider to inspect a fixed hand position.</p>}
      </> : <p role="status">Second-hand playback is unavailable. Static detail inspection is still available.</p>}
    </>}
  </fieldset>;
}
