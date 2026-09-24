'use client';
import { useEffect, useRef, useState } from 'react';
import { createRoot, type ReconcilerRoot, type RootStore } from '@react-three/fiber';
import { ACESFilmicToneMapping, Color, Euler, PCFShadowMap, PerspectiveCamera, Spherical, Vector3, WebGLRenderer, type WebGLRenderTarget } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadStudioEnvironment } from './studio-environment';
import type { AssemblyPreviewHandle } from '@/components/three/assembly-controls';
import { createV11Assembly } from './v11-assembly';
import { watchTimeline } from '@/animations/watch-timeline';
import { frameAssembly } from './exploded-assembly';
import { createWatchStudio } from './watch-studio';
import { SceneLighting } from './scene-lighting';
import { PlaceholderWatch } from './placeholder-watch';
import { SceneBoundary } from './scene-boundary';
import { loadConfiguredWatch, type LoadedWatch } from './model-loader';

export type SceneCanvasProps = { source: 'configured' | 'placeholder'; onReady: (isModel: boolean) => void; onError: () => void; onAssemblyReady?: (controller: AssemblyPreviewHandle | null) => void };

export function SceneCanvas({ source, onReady, onError, onAssemblyReady }: SceneCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  const interaction = useRef<{ reset: () => void; zoom: (factor: number) => void } | null>(null);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
    let stopped = false, failed = false, rendered = false;
    let renderer: WebGLRenderer | undefined;
    let root: ReconcilerRoot<HTMLCanvasElement> | undefined;
    let store: RootStore | undefined;
    let asset: LoadedWatch | null = null;
    let environment: WebGLRenderTarget | undefined;
    let studio: ReturnType<typeof createWatchStudio> | undefined;
    let controls: OrbitControls | undefined;
    let assembly: ReturnType<typeof createV11Assembly> | undefined;
    let storyProgress: number | null = null;
    const controller = new AbortController();
    const camera = new PerspectiveCamera(40, 1, 0.1, 50);
    const invalidate = () => { if (!stopped && !failed) store?.getState().invalidate(); };
    const fail = () => {
      if (failed || stopped) return;
      failed = true;
      queueMicrotask(() => { if (!stopped) onError(); });
    };
    const contextLost = (event: Event) => { event.preventDefault(); fail(); };
    canvas.addEventListener('webglcontextlost', contextLost);
    const pixelRatio = () => studio ? Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2) : Math.min(window.devicePixelRatio || 1, 1.5);
    const reset = () => {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / height;
      if (studio) studio.home(camera, width);
      else { camera.position.set(0, 0.25, 4.8 / Math.min(width / height, 1)); camera.lookAt(0, 0, 0); }
      if (controls) {
        controls.target.copy(studio?.target ?? new Vector3());
        if (assembly && storyProgress !== null) {
          const homePosition = camera.position.clone(), homeTarget = controls.target.clone();
          frameAssembly(camera, assembly.envelope, controls.target);
          const amount = watchTimeline(storyProgress).camera;
          camera.position.lerpVectors(homePosition, camera.position.clone(), amount);
          controls.target.lerpVectors(homeTarget, controls.target.clone(), amount);
        } else if (assembly && assembly.progress > 0) frameAssembly(camera, assembly.envelope, controls.target);
        controls.update();
      }
      invalidate();
    };
    const zoom = (factor: number) => {
      if (!controls || storyProgress !== null) return;
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(Math.max(controls.minDistance, Math.min(controls.maxDistance, offset.length() * factor)));
      camera.position.copy(controls.target).add(offset); controls.update(); invalidate();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (!controls || storyProgress !== null || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') { reset(); return; }
      if (['+','=','-'].includes(event.key)) { zoom(event.key === '-' ? 1.12 : 1 / 1.12); return; }
      const spherical = new Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      spherical.theta += event.key === 'ArrowLeft' ? 0.12 : event.key === 'ArrowRight' ? -0.12 : 0;
      spherical.phi += event.key === 'ArrowUp' ? -0.12 : event.key === 'ArrowDown' ? 0.12 : 0;
      spherical.makeSafe();
      camera.position.copy(controls.target).add(new Vector3().setFromSpherical(spherical));
      controls.update(); invalidate();
    };
    canvas.addEventListener('keydown', keyboard);
    let lastWidth = 0, lastHeight = 0;
    const resize = () => {
      if (!store || stopped || failed) return;
      try {
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        if (width !== lastWidth || height !== lastHeight) reset();
        lastWidth = width; lastHeight = height;
        store.getState().setSize(width, height);
        store.getState().setDpr(pixelRatio());
        renderer?.setSize(width, height, false);
        canvas.style.width = '100%'; canvas.style.height = '100%';
        camera.aspect = width / height; camera.updateProjectionMatrix();
        invalidate();
      } catch { fail(); }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container); window.addEventListener('resize', resize);
    async function initialize() {
      try {
        renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
        asset = source === 'placeholder' ? null : await loadConfiguredWatch(controller.signal);
        if (stopped) { asset?.dispose(); return; }
        if (asset) {
          renderer.transmissionResolutionScale = asset.studioTransform ? 1.25 : 1;
          environment = await loadStudioEnvironment(renderer, controller.signal);
          if (stopped) { environment.dispose(); asset.dispose(); return; }
          if (asset.studioTransform) {
            studio = createWatchStudio(asset, renderer);
            assembly = createV11Assembly(asset);
          }
          controls = new OrbitControls(camera, canvas);
          controls.enableDamping = false; controls.enablePan = false; controls.autoRotate = false;
          controls.minDistance = studio?.minDistance ?? 0.8; controls.maxDistance = studio?.maxDistance ?? 12;
          controls.addEventListener('change', invalidate);
          canvas.removeAttribute('aria-hidden'); canvas.tabIndex = 0;
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', 'Interactive watch. Drag to rotate, scroll or pinch to zoom. Arrow keys rotate, plus and minus zoom, Home resets the view.');
          interaction.current = { reset, zoom }; setInteractive(true);
        }
        reset();
        const draw = renderer.render.bind(renderer);
        renderer.render = (scene, activeCamera) => {
          if (stopped || failed) return;
          try {
            draw(scene, activeCamera);
            if (!rendered) { rendered = true; queueMicrotask(() => { if (!stopped && !failed) onReady(asset !== null); }); }
          } catch { fail(); }
        };
        const { width, height } = container!.getBoundingClientRect();
        root = createRoot(canvas);
        await root.configure({
          gl: renderer, camera, frameloop: 'demand', dpr: pixelRatio(),
          shadows: studio ? { type: PCFShadowMap } : false,
          size: { width, height, top: 0, left: 0 },
          scene: { background: new Color(asset ? '#08090b' : '#22221f'), environment: environment?.texture ?? null, environmentIntensity: 0.38, environmentRotation: new Euler(0, 1.2, 0) },
        });
        if (stopped) { root.unmount(); return; }
        store = root.render(<SceneBoundary onError={fail}>{studio ? <primitive object={studio.lights} /> : <SceneLighting studio={Boolean(asset)} />}{asset ? <primitive object={asset.object} /> : <PlaceholderWatch />}</SceneBoundary>);
        resize();
        if (assembly) onAssemblyReady?.({ setProgress(value) {
          if (stopped || failed || !assembly || storyProgress !== null) return;
          try {
            const wasAssembled = assembly.progress === 0;
            assembly.apply(value);
            if (wasAssembled !== (assembly.progress === 0)) reset();
            invalidate();
          } catch { fail(); }
        }, setStoryProgress(value) {
          if (stopped || failed || !assembly || !controls) return;
          try {
            const pose = watchTimeline(value ?? 0);
            const previous = storyProgress === null ? null : watchTimeline(storyProgress);
            const modeChanged = (storyProgress === null) !== (value === null);
            storyProgress = value === null ? null : pose.progress;
            controls.enabled = value === null;
            canvas.style.touchAction = value === null ? 'none' : 'pan-y';
            canvas.tabIndex = value === null ? 0 : -1;
            if (modeChanged) setInteractive(value === null);
            canvas.setAttribute('aria-label', value === null
              ? 'Interactive watch. Drag to rotate, scroll or pinch to zoom. Arrow keys rotate, plus and minus zoom, Home resets the view.'
              : 'Watch assembly controlled by page scrolling. Exit cinematic view for manual exploration.');
            if (!modeChanged && previous?.camera === pose.camera && previous.separation === pose.separation) return;
            assembly.apply(pose.separation);
            reset();
          } catch { fail(); }
        } });
      } catch { fail(); }
    }
    void initialize();
    return () => {
      stopped = true; controller.abort(); interaction.current = null;
      observer.disconnect(); window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('keydown', keyboard);
      controls?.removeEventListener('change', invalidate); controls?.dispose();
      if (root) root.unmount(); else renderer?.forceContextLoss();
      assembly?.dispose(); onAssemblyReady?.(null);
      studio?.dispose(); renderer?.dispose(); asset?.dispose(); environment?.dispose(); canvas.remove();
    };
  }, [source, onReady, onError, onAssemblyReady]);
  return <div className="scene-canvas">
    <div className="scene-render-surface" ref={host} />
    {interactive && <div className="scene-orbit-controls" aria-label="Watch view controls">
      <button type="button" onClick={() => interaction.current?.zoom(1 / 1.12)} aria-label="Zoom in">+</button>
      <button type="button" onClick={() => interaction.current?.zoom(1.12)} aria-label="Zoom out">−</button>
      <button type="button" onClick={() => interaction.current?.reset()}>Reset view</button>
    </div>}
  </div>;
}
