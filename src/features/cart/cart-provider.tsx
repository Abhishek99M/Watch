'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { CART_KEY, createCartStore } from '@/store/cart';

const CartContext = createContext<ReturnType<typeof createCartStore> | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createCartStore);
  useEffect(() => {
    let storage: Storage | undefined;
    try { storage = window.localStorage; } catch { /* Private/blocked storage: in-memory cart. */ }
    store.getState().connect(storage);
    const sync = (event: StorageEvent) => {
      if (storage && event.storageArea === storage && (event.key === CART_KEY || event.key === null)) {
        store.getState().receive(event.newValue);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [store]);
  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}
export function useCart<T>(selector: (state: ReturnType<ReturnType<typeof createCartStore>['getState']>) => T) {
  const store = useContext(CartContext);
  if (!store) throw new Error('CartProvider is required');
  return useStore(store, selector);
}
export function CartCount() {
  const quantity = useCart(state => state.quantity);
  return quantity > 0 ? <span className="cart-count" aria-hidden="true">{quantity}</span> : null;
}
