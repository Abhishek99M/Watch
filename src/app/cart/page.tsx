import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/section-heading';
import { CartContents } from '@/features/cart/cart-contents';
export const metadata: Metadata = { title: 'Demo cart | Watch', robots: { index: false, follow: false } };
export default function CartPage() {
  return <main id="main-content" tabIndex={-1} className="container cart-page">
    <SectionHeading level={1} eyebrow="Demonstration only" title="Your demo cart.">
      <p>Explore the cart with the Aurel Veil design study. Nothing here is offered for sale, reserved or ordered.</p>
    </SectionHeading>
    <CartContents />
  </main>;
}
