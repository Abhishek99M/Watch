import { SectionHeading } from '@/components/ui/section-heading';
import { ButtonLink } from '@/components/ui/button';
export default function NotFound() {
  return <main id="main-content" tabIndex={-1} className="container home">
    <SectionHeading level={1} eyebrow="404" title="Page not found">
      <p>We could not find the page you requested.</p>
    </SectionHeading>
    <div className="home__note"><ButtonLink href="/">Return home</ButtonLink></div>
  </main>;
}
