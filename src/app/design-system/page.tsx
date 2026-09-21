import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { SectionHeading } from '@/components/ui/section-heading';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavLink } from '@/components/ui/nav-link';
import { ProductCard } from '@/components/ui/product-card';
import { LoadingState } from '@/components/ui/feedback';
import { InteractionPreview } from './interaction-preview';
export const metadata: Metadata = { title: 'Design system | Watch', robots: { index: false, follow: false } };
const swatches = [
  ['Canvas', '#171715', 'var(--color-canvas)'],
  ['Surface', '#22221f', 'var(--color-surface)'],
  ['Ivory', '#f5f5f0', 'var(--color-ink)'],
  ['Brass', '#e2c692', 'var(--color-accent)'],
];
export default function DesignSystem() {
  return <main id="main-content" tabIndex={-1} className="container preview">
    <SectionHeading level={1} eyebrow="Watch / design reference" title="Considered in every detail.">
      <p>A working reference for typography, color and interface components. All product content below is illustrative.</p>
    </SectionHeading>
    <section className="preview-section" aria-labelledby="palette">
      <SectionHeading id="palette" eyebrow="01 / Foundations" title="A restrained palette." />
      <div className="swatches">{swatches.map(([name, hex, color]) => <div className="swatch" key={name}><div className="swatch__color" style={{ '--swatch': color } as CSSProperties} aria-hidden="true" /><p>{name}</p><code>{hex}</code></div>)}</div>
      <div className="preview-grid"><div className="preview-stack"><h3 className="card-title">Editorial typography</h3><p className="text-muted">Georgia brings character to headings. A familiar sans serif keeps labels and longer passages clear. System fonts load without an external request.</p></div><div className="preview-stack"><h3 className="card-title">Room to breathe</h3><p className="text-muted">A consistent spacing scale and fluid page margins give details room at every screen size.</p></div></div>
    </section>
    <section className="preview-section" aria-labelledby="controls">
      <SectionHeading id="controls" eyebrow="02 / Controls" title="Clear intent. Quiet feedback." />
      <div className="preview-row"><ButtonLink href="/">Return home</ButtonLink><ButtonLink href="#cards" variant="secondary">View card example</ButtonLink><ButtonLink href="#states" variant="quiet">View loading state</ButtonLink></div>
      <nav aria-label="Navigation style examples" className="preview-row"><NavLink href="/design-system" current>Design reference</NavLink><NavLink href="/">Home</NavLink></nav>
      <div className="preview-row"><Badge>Example label</Badge><Badge tone="accent">Selected</Badge></div>
      <InteractionPreview />
    </section>
    <section id="cards" className="preview-section" aria-labelledby="card-heading">
      <SectionHeading id="card-heading" eyebrow="03 / Product presentation" title="Space for the object." />
      <div className="preview-grid">
        <ProductCard title="Watch concept" label="Illustrative content" description="A reserved image area and a simple content hierarchy. Approved photography and product details will be added in later phases." href="/" actionLabel="Return to Watch" />
        <ProductCard title="Details forthcoming" label="Preview only" description="Cards can remain informational until an approved product destination is available." />
      </div>
    </section>
    <section id="states" className="preview-section" aria-labelledby="state-heading">
      <SectionHeading id="state-heading" eyebrow="04 / Feedback" title="Always a clear next step." />
      <LoadingState label="Loading example — static component preview" />
      <p className="text-muted">The skeleton reserves space and stops animating when reduced motion is enabled. Error recovery can be tested in the controls section.</p>
    </section>
  </main>;
}
