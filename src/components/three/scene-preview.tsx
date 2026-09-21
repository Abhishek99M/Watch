'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType } from 'react';
import { StaticWatch } from './static-watch';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/feedback';
import { SceneBoundary } from '@/three/scene-boundary';
import type { SceneCanvasProps } from '@/three/scene-canvas';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const placeholderCaption = 'Illustrative watch prototype. Design, materials and proportions are placeholders, not product specifications.';

function SceneAttempt({ source, onRetry, onClose, onPlaceholder }: {
  source: 'configured' | 'placeholder'; onRetry: () => void; onClose: () => void; onPlaceholder: () => void;
}) {
  const [Scene, setScene] = useState<ComponentType<SceneCanvasProps> | null>(null);
  const [ready, setReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onError = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setFailed(true);
  }, []);
  const onReady = useCallback((isModel: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    setModelLoaded(isModel);
    setReady(true);
  }, []);
  useEffect(() => {
    let active = true;
    timer.current = setTimeout(() => { if (active) setFailed(true); }, 12_000);
    import('@/three/scene-canvas')
      .then(module => { if (active) setScene(() => module.SceneCanvas); })
      .catch(() => { if (active) onError(); });
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onError]);

  return <>
    <div className="scene-stage">
      <StaticWatch />
      {!failed && Scene && <SceneBoundary onError={onError}><Scene source={source} onReady={onReady} onError={onError} /></SceneBoundary>}
      {!failed && !ready && <p className="scene-status" role="status">Loading 3D preview…</p>}
    </div>
    <div className="scene-controls">
      {failed
        ? <ErrorState title="3D preview unavailable" action={<Button variant="secondary" onClick={onRetry}>Retry 3D preview</Button>}>
          <p>The static watch and all page information are still available. You can try again or continue without 3D.</p>
        </ErrorState>
        : <p role="status" className="text-muted">{ready ? '3D preview ready. The scene stays still.' : 'Preparing the watch preview.'}</p>}
      {(failed || modelLoaded) && source !== 'placeholder' && <Button variant="secondary" onClick={onPlaceholder}>View placeholder watch</Button>}
      <Button variant="quiet" onClick={onClose}>Use static view</Button>
    </div>
    <figcaption className="text-muted">{modelLoaded && !failed
      ? '3D model preview. The static illustration remains an illustrative placeholder.'
      : placeholderCaption}</figcaption>
  </>;
}

export function ScenePreview() {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [enabled, setEnabled] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [source, setSource] = useState<'configured' | 'placeholder'>('configured');
  return <figure className="scene-preview" aria-label="Watch preview">
    {enabled
      ? <SceneAttempt key={attempt} source={source} onRetry={() => setAttempt(value => value + 1)} onClose={() => setEnabled(false)}
        onPlaceholder={() => { setSource('placeholder'); setAttempt(value => value + 1); }} />
      : <>
        <div className="scene-stage"><StaticWatch /></div>
        <div className="scene-controls">
          <p className="text-muted">A round case, dark dial and brown strap. The 3D view is optional and stays still.</p>
          {hydrated && <Button onClick={() => { setSource('configured'); setEnabled(true); }}>Load 3D preview</Button>}
        </div>
        <figcaption className="text-muted">{placeholderCaption}</figcaption>
      </>}
  </figure>;
}
