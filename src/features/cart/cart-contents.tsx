'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';
import { MAX_DEMO_QUANTITY } from '@/store/cart';
import { useCart } from './cart-provider';

export function CartContents() {
  const ready = useCart(state => state.ready);
  const quantity = useCart(state => state.quantity);
  const setQuantity = useCart(state => state.setQuantity);
  const remove = useCart(state => state.remove);
  const persistent = useCart(state => state.persistent);
  const notice = useCart(state => state.notice);
  const announcement = useCart(state => state.announcement);
  const emptyHeading = useRef<HTMLHeadingElement>(null);
  return <section className="cart-content" aria-label="Demo cart contents">
    {!ready ? <>
      <p>Enable JavaScript to load and change your locally saved demo cart.</p>
      <ButtonLink href="/watch#product-information" variant="secondary">Explore the design</ButtonLink>
    </> : quantity === 0 ? <div className="cart-empty">
      <p className="eyebrow">A clean slate</p>
      <h2 ref={emptyHeading} tabIndex={-1}>Your demo cart is empty.</h2>
      <p>Explore Aurel Veil, then add the original design study to try the cart.</p>
      <ButtonLink href="/watch#product-information">Explore the design</ButtonLink>
    </div> : <div className="cart-layout">
      <article className="cart-item" aria-labelledby="cart-item-heading">
        <Image src="/images/aurel-veil.jpg" alt="Aurel Veil original Charcoal design study" width={1800} height={1350} unoptimized loading="eager" />
        <div className="cart-item__details">
          <p className="eyebrow">Demonstration item</p>
          <h2 id="cart-item-heading">Aurel Veil</h2>
          <p>Original Charcoal design study</p>
          <p className="text-muted">A digital design, not a saleable watch. Colour studies from the preview are not included.</p>
          <label htmlFor="cart-quantity">Quantity</label>
          <select id="cart-quantity" value={quantity} onChange={event => setQuantity(Number(event.target.value))}>
            {Array.from({ length: MAX_DEMO_QUANTITY }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
          </select>
          <p className="text-muted">Demo limit: 9 units, not an inventory count.</p>
          <Button variant="quiet" onClick={() => { remove(); requestAnimationFrame(() => emptyHeading.current?.focus()); }}>Remove Aurel Veil</Button>
        </div>
      </article>
      <aside className="cart-summary" aria-labelledby="cart-summary-heading">
        <p className="eyebrow">At a glance</p>
        <h2 id="cart-summary-heading">Demo summary</h2>
        <dl><div><dt>Design studies</dt><dd>1</dd></div><div><dt>Total demo quantity</dt><dd>{quantity}</dd></div></dl>
        <p>Pricing and availability are unconfirmed. No total is calculated and no order can be placed.</p>
        <ButtonLink href="/watch#product-information" variant="secondary">Continue exploring</ButtonLink>
      </aside>
    </div>}
    <p role="status" className="cart-status">{announcement}</p>
    {ready && <p className="cart-storage text-muted">{notice || (persistent ? 'Saved in this browser. Changes sync across tabs; clearing browser storage removes the demo cart.' : 'This demo cart lasts for this page session only.')}</p>}
  </section>;
}
