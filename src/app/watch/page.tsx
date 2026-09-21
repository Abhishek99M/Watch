import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/section-heading';
import { ButtonLink } from '@/components/ui/button';
import { ScenePreview } from '@/components/three/scene-preview';
export const metadata: Metadata = { title: 'The watch | Watch' };
export default function WatchPage() {
  return <main id="main-content" tabIndex={-1} className="container watch-foundation">
    <SectionHeading level={1} eyebrow="The watch" title="A closer look, soon.">
      <p>Our watch experience is taking shape. Explore a quiet study of form and light while product details are prepared.</p>
    </SectionHeading>
    <ScenePreview />
    <ButtonLink href="/" variant="secondary">Return home</ButtonLink>
  </main>;
}
