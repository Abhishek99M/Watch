import type { ReactNode } from 'react';
import { ButtonLink } from './button';
import { Badge } from './badge';
type Props = { title: string; description: string; label?: string; media?: ReactNode; href?: string; actionLabel?: string };
export function ProductCard({ title, description, label, media, href, actionLabel = 'Explore watch' }: Props) {
  return <article className="product-card">
    <div className="product-card__media">{media ?? <span className="eyebrow">Image forthcoming</span>}</div>
    <div className="product-card__body">
      {label && <Badge>{label}</Badge>}
      <h3 className="card-title">{title}</h3>
      <p className="text-muted">{description}</p>
      {href && <ButtonLink href={href} variant="secondary">{actionLabel}</ButtonLink>}
    </div>
  </article>;
}
