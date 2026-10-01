'use client';
import { Button, ButtonLink } from '@/components/ui/button';
import { MAX_DEMO_QUANTITY } from '@/store/cart';
import { useCart } from './cart-provider';

export function AddToDemoCart() {
  const ready = useCart(state => state.ready);
  const quantity = useCart(state => state.quantity);
  const add = useCart(state => state.add);
  const announcement = useCart(state => state.announcement);
  const notice = useCart(state => state.notice);
  return <div className="demo-cart-entry">
    <p className="eyebrow">Try the demo cart</p>
    <p>Add the original Charcoal design study to explore the cart. This is not a product for sale; illustrative dial colours are not cart options.</p>
    <div className="cart-actions">
      <Button disabled={!ready || quantity >= MAX_DEMO_QUANTITY} onClick={add}>Add to demo cart</Button>
      <ButtonLink href="/cart" variant="secondary">View demo cart</ButtonLink>
    </div>
    <p className="text-muted">Demo limit: 9 units. No price, reservation or order.</p>
    <p role="status" className="cart-status">{announcement}</p>
    {notice && <p className="text-muted">{notice}</p>}
    {!ready && <p>JavaScript is required to change the demo cart. You can still read all design information.</p>}
  </div>;
}
