'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { AssemblyPreviewHandle } from './assembly-controls';
import { AssemblyControls } from './assembly-controls';
import { Button } from '@/components/ui/button';
import { watchTimeline } from '@/animations/watch-timeline';

/** Native scrolling and CSS sticky keep keyboard, touch and document navigation intact. */
export function CinematicPreview({ controller, children }: { controller: AssemblyPreviewHandle | null; children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null), caption = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState(false), [reduced, setReduced] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(media.matches); if (media.matches) setActive(false); };
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const running = active && !reduced && Boolean(controller);
  useEffect(() => {
    if (!running || !controller || !host.current) return;
    let disposed = false, cleanup: (() => void) | undefined;
    const element = host.current;
    controller.setStoryProgress(0);
    const fail = () => { if (!disposed) { setUnavailable(true); setActive(false); } };
    const deadline = setTimeout(fail, 12_000);
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      clearTimeout(deadline);
      gsap.registerPlugin(ScrollTrigger);
      let previous = -1;
      const apply = (value: number) => {
        if (disposed || value === previous) return;
        previous = value;
        const pose = watchTimeline(value);
        controller.setStoryProgress(value);
        element.dataset.progress = String(value);
        if (caption.current) caption.current.textContent = pose.chapter;
      };
      const trigger = ScrollTrigger.create({ trigger: element,
        start: () => `top ${getComputedStyle(element).getPropertyValue('--story-top').trim()}`,
        end: () => `+=${Math.max(1, element.offsetHeight - (element.firstElementChild as HTMLElement).offsetHeight)}`,
        onUpdate: self => apply(self.progress), onRefresh: self => apply(self.progress),
      });
      cleanup = () => trigger.kill();
      trigger.refresh(); apply(trigger.progress);
    }).catch(fail);
    return () => { disposed = true; clearTimeout(deadline); cleanup?.(); controller.setStoryProgress(null); delete element.dataset.progress; };
  }, [running, controller]);
  return <>
    <div ref={host} className={running ? 'watch-story is-running' : 'watch-story'}>
      <div className="watch-story-sticky">
        {children}
        {controller && <div className="watch-story-toolbar">
          {running && <>
            <p ref={caption}>Preparing cinematic view...</p>
            <p className="text-muted">Scroll to reveal the layers. Scroll back to assemble.</p>
          </>}
          {!reduced && !unavailable && <Button variant="secondary" onClick={() => setActive(value => !value)}>
            {running ? 'Exit cinematic view' : 'Start cinematic view'}
          </Button>}
          {reduced && <p className="text-muted">Reduced motion is on. Explore the layers with the controls below.</p>}
          {unavailable && <p role="status">Cinematic view is unavailable. Manual exploration is still available.</p>}
        </div>}
      </div>
    </div>
    {controller && !running && <AssemblyControls key={String(active)} controller={controller} />}
  </>;
}
