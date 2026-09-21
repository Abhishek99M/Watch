'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/feedback';

export function InteractionPreview() {
  const [count, setCount] = useState(0);
  const [recovered, setRecovered] = useState(false);
  return <div className="preview-stack">
    <div className="preview-row">
      <Button onClick={() => setCount(value => value + 1)}>Test action</Button>
      <Button variant="secondary" disabled>Unavailable</Button>
      <Button busy>Loading</Button>
    </div>
    <p role="status">Action activated {count} times.</p>
    {recovered
      ? <div className="feedback"><p role="status">Preview recovered.</p><Button variant="quiet" onClick={() => setRecovered(false)}>Reset error example</Button></div>
      : <ErrorState title="Preview unavailable" action={<Button variant="secondary" onClick={() => setRecovered(true)}>Retry preview</Button>}><p>This is a simulated error for reviewing recovery controls.</p></ErrorState>}
  </div>;
}
