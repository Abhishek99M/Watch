'use client';
import { useEffect, useRef } from 'react';
import { createRoot, type ReconcilerRoot, type RootStore } from '@react-three/fiber';
import { Color, PerspectiveCamera, WebGLRenderer } from 'three';
import { SceneLighting } from './scene-lighting';
import { PlaceholderWatch } from './placeholder-watch';
import { SceneBoundary } from './scene-boundary';

export type SceneCanvasProps = { onReady: () => void; onError: () => void };

/** Own the canvas so asynchronous renderer setup and draw failures are catchable. */
export function SceneCanvas({ onReady, onError }: SceneCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    // A fresh node per mount avoids sharing a context during Strict Mode cleanup.
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
    let stopped = false;
    let failed = false;
    let rendered = false;
    let renderer: WebGLRenderer | undefined;
    let root: ReconcilerRoot<HTMLCanvasElement> | undefined;
    let store: RootStore | undefined;
    const camera = new PerspectiveCamera(40, 1, 0.1, 50);

    const fail = () => {
      if (failed || stopped) return;
      failed = true;
      queueMicrotask(() => { if (!stopped) onError(); });
    };
    const contextLost = (event: Event) => { event.preventDefault(); fail(); };
    canvas.addEventListener('webglcontextlost', contextLost);

    const resize = () => {
      if (!store || stopped || failed) return;
      try {
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        camera.position.set(0, 0.25, 4.8 / Math.min(width / height, 1));
        camera.lookAt(0, 0, 0);
        store.getState().setSize(width, height);
        store.getState().setDpr(Math.min(window.devicePixelRatio || 1, 1.5));
        store.getState().invalidate();
      } catch { fail(); }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    async function initialize() {
      try {
        renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
        const draw = renderer.render.bind(renderer);
        renderer.render = (scene, activeCamera) => {
          if (stopped || failed) return;
          try {
            draw(scene, activeCamera);
            if (!rendered) {
              rendered = true;
              queueMicrotask(() => { if (!stopped && !failed) onReady(); });
            }
          } catch { fail(); }
        };
        const { width, height } = container!.getBoundingClientRect();
        root = createRoot(canvas);
        await root.configure({
          gl: renderer, camera, frameloop: 'demand',
          dpr: Math.min(window.devicePixelRatio || 1, 1.5),
          size: { width, height, top: 0, left: 0 },
          scene: { background: new Color('#22221f') },
        });
        if (stopped) { root.unmount(); return; }
        store = root.render(<SceneBoundary onError={fail}><SceneLighting /><PlaceholderWatch /></SceneBoundary>);
        resize();
      } catch { fail(); }
    }
    void initialize();
    return () => {
      stopped = true;
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', contextLost);
      if (root) root.unmount();
      renderer?.dispose();
      canvas.remove();
    };
  }, [onReady, onError]);
  return <div className="scene-canvas" ref={host} />;
}
