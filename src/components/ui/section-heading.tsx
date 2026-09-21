import type { ReactNode } from 'react';
type Props = { eyebrow?: string; title: string; children?: ReactNode; id?: string; level?: 1 | 2 | 3 };
export function SectionHeading({ eyebrow, title, children, id, level = 2 }: Props) {
  const Heading = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
  return <div className="section-heading">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <Heading id={id} className={level === 1 ? 'display' : 'section-title'}>{title}</Heading>
    {children && <div className="measure text-muted section-description">{children}</div>}
  </div>;
}
