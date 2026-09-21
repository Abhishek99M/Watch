import { SectionHeading } from '@/components/ui/section-heading';
export default function Home() {
  return <main id="main-content" tabIndex={-1} className="container home">
    <hr className="home__rule" aria-hidden="true" />
    <SectionHeading level={1} eyebrow="Watch" title="A study in time.">
      <p>An exploration of watchmaking, detail and considered design.</p>
    </SectionHeading>
    <p className="home__note measure text-muted">Our watch experience is taking shape. More to discover soon.</p>
  </main>;
}
