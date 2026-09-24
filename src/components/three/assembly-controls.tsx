'use client';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';

export type AssemblyPreviewHandle = { setProgress: (value: number) => void; setStoryProgress: (value: number | null) => void };

export function AssemblyControls({ controller }: { controller: AssemblyPreviewHandle }) {
  const id = useId();
  const [progress, setProgress] = useState(0);
  const change = (value: number) => { controller.setProgress(value / 100); setProgress(value); };
  return <fieldset className="assembly-controls">
    <legend>Explore the assembly</legend>
    <p id={`${id}-help`} className="text-muted">Separate the layers to inspect the watch. The case and bracelet stay together; the movement is illustrative.</p>
    <div className="assembly-slider-label"><label htmlFor={id}>Component separation</label><output htmlFor={id}>{progress}%</output></div>
    <input id={id} type="range" min="0" max="100" step="1" value={progress}
      aria-describedby={`${id}-help`} aria-valuetext={progress === 0 ? 'Assembled' : progress === 100 ? 'Fully separated' : `${progress}% separated`}
      onChange={event => change(Number(event.currentTarget.value))} />
    <div className="assembly-actions">
      <Button variant="secondary" onClick={() => change(100)} disabled={progress === 100}>Separate parts</Button>
      <Button variant="secondary" onClick={() => change(0)} disabled={progress === 0}>Reassemble</Button>
    </div>
  </fieldset>;
}
