'use client';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { dialToneKeys, dialTones, type DialTone } from '@/data/watch-configuration';

export function ConfigurationControls({ value, onChange }: { value: DialTone; onChange: (value: DialTone) => void }) {
  const id = useId();
  return <fieldset className="configuration-controls" aria-describedby={`${id}-help`}>
    <legend>Dial colour study</legend>
    <p id={`${id}-help`} className="text-muted">Illustrative colours for the existing dial. These are not available product variants.</p>
    <div className="configuration-options">
      {dialToneKeys.map(tone => <label key={tone} className="configuration-option">
        <input type="radio" name={id} value={tone} checked={value === tone} onChange={() => onChange(tone)} />
        <span className="configuration-swatch" style={{ backgroundColor: dialTones[tone].swatch }} aria-hidden="true" />
        <span>{dialTones[tone].label}{tone === 'charcoal' && <small>Original</small>}</span>
      </label>)}
    </div>
    <div className="configuration-summary">
      <p role="status" aria-live="polite" aria-atomic="true">Selected: {dialTones[value].label}{value !== 'charcoal' && ' (illustrative)'}</p>
      <Button variant="quiet" disabled={value === 'charcoal'} onClick={() => onChange('charcoal')}>Reset appearance</Button>
    </div>
  </fieldset>;
}
