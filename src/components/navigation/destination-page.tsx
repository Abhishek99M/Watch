import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

export function DestinationPage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <main id="main-content" tabIndex={-1} className="container home">
    <SectionHeading level={1} eyebrow={eyebrow} title={title}><p>{description}</p></SectionHeading>
    <div className="home__note"><ButtonLink href="/" variant="secondary">Return home</ButtonLink></div>
  </main>;
}
