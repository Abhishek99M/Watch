'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType } from 'react';
import Image from 'next/image';
import { AssemblyControls, type AssemblyPreviewHandle } from './assembly-controls';
import { StaticWatch } from './static-watch';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/feedback';
import { SceneBoundary } from '@/three/scene-boundary';
import type { SceneCanvasProps } from '@/three/scene-canvas';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
function WatchPoster() {
  return <Image className="scene-static" src="/images/aurel-veil.jpg" alt="Aurel Veil design study with a charcoal dial, champagne hands and a steel bracelet" width={1800} height={1350} loading="eager" unoptimized />;
}
const modelCaption = 'Aurel Veil design study. Studio image and live 3D use different lighting; the movement is illustrative.';
const placeholderCaption = 'Illustrative watch prototype. Design, materials and proportions are placeholders, not product specifications.';

function SceneAttempt({ source, onRetry, onClose, onPlaceholder }: {
  source: 'configured' | 'placeholder'; onRetry: () => void; onClose: () => void; onPlaceholder: () => void;
}) {
  const [Scene, setScene] = useState<ComponentType<SceneCanvasProps> | null>(null);
  const [ready, setReady] = useState(false);
  const [assembly, setAssembly] = useState<AssemblyPreviewHandle | null>(null);
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
      {source === 'placeholder' ? <StaticWatch /> : <WatchPoster />}
      {!failed && Scene && <SceneBoundary onError={onError}><Scene source={source} onReady={onReady} onError={onError} onAssemblyReady={setAssembly} /></SceneBoundary>}
      {!failed && !ready && <p className="scene-status" role="status">Loading 3D preview…</p>}
    </div>
    {ready && !failed && assembly && <AssemblyControls controller={assembly} />}
    <div className="scene-controls">
      {failed
        ? <ErrorState title="3D preview unavailable" action={<Button variant="secondary" onClick={onRetry}>Retry 3D preview</Button>}>
          <p>The static watch and all page information are still available. You can try again or continue without 3D.</p>
        </ErrorState>
        : <p role="status" className="text-muted">{ready ? (modelLoaded ? '3D preview ready. Drag to rotate; scroll or pinch to zoom.' : '3D preview ready. The scene stays still.') : 'Preparing the watch preview.'}</p>}
      {(failed || modelLoaded) && source !== 'placeholder' && <Button variant="secondary" onClick={onPlaceholder}>View placeholder watch</Button>}
      <Button variant="quiet" onClick={onClose}>Use static view</Button>
    </div>
    <figcaption className="text-muted">{modelLoaded && !failed
      ? modelCaption
      : source === 'placeholder' ? placeholderCaption : modelCaption}</figcaption>
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
        <div className="scene-stage"><WatchPoster /></div>
        <div className="scene-controls">
          <p className="text-muted">A charcoal dial, champagne hands and a steel bracelet. Load the optional 3D view to rotate and explore the watch.</p>
          {hydrated && <Button onClick={() => { setSource('configured'); setEnabled(true); }}>Load 3D preview</Button>}
        </div>
        <figcaption className="text-muted">{modelCaption}</figcaption>
      </>}
  </figure>;
}
