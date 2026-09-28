'use client';
import { dialTones, type DialTone } from '@/data/watch-configuration';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { craftsmanshipDetails, craftsmanshipViews, type CraftsmanshipView } from '@/data/craftsmanship';
import type { AssemblyPreviewHandle } from './assembly-controls';

export function CraftsmanshipControls({ controller, view, onView, dialTone }: {
  dialTone: DialTone;
  controller: NonNullable<AssemblyPreviewHandle['craftsmanship']>;
  view: CraftsmanshipView | null; onView: (view: CraftsmanshipView | null) => void;
}) {
  const host = useRef<HTMLFieldSetElement>(null);
  const select = (value: CraftsmanshipView | null) => {
    controller.select(value); onView(value);
    if (value === null && view) host.current?.querySelector<HTMLButtonElement>(`[data-detail="${view}"]`)?.focus();
  };
  return <fieldset className="craftsmanship-controls" ref={host}>
    <legend>Surface & detail</legend>
    <p className="text-muted">Look closer at the dial, case and bracelet. Each view stays still until you explore it.</p>
    <div className="assembly-actions">
      {craftsmanshipViews.map(value => <Button key={value} data-detail={value} variant="secondary" aria-pressed={view === value}
        onClick={() => select(value)}>Inspect {value}</Button>)}
      {view && <Button variant="quiet" onClick={() => select(null)}>Return to watch</Button>}
    </div>
    {view && <div className="craftsmanship-caption" role="status" aria-live="polite" aria-atomic="true">
      <h3>{craftsmanshipDetails[view].title}</h3>
      <p>{view === 'dial' && dialTone !== 'charcoal'
        ? `Fine radial lines remain visible beneath the ${dialTones[dialTone].label.toLowerCase()} colour study. The champagne-toned markers and hands retain their original appearance.`
        : craftsmanshipDetails[view].description}</p>
      <p className="text-muted">A close-up of the assembled design study; surrounding parts may extend beyond the frame.</p>
    </div>}
  </fieldset>;
}
