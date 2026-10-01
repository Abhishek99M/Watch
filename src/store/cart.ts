import { createStore } from 'zustand/vanilla';

export const CART_KEY = 'watch.demo-cart.v1';
export const DEMO_ITEM_ID = 'aurel-veil-study';
export const MAX_DEMO_QUANTITY = 9;
type CartStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function decodeCart(raw: string | null): { quantity: number; invalid: boolean } {
  if (raw === null) return { quantity: 0, invalid: false };
  try {
    if (raw.length > 512) throw new Error('Oversized cart');
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid cart');
    const data = value as Record<string, unknown>;
    if (Object.keys(data).sort().join(',') !== 'itemId,quantity,version' || data.version !== 1 || data.itemId !== DEMO_ITEM_ID ||
      typeof data.quantity !== 'number' || !Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > MAX_DEMO_QUANTITY) throw new Error('Invalid cart');
    return { quantity: data.quantity, invalid: false };
  } catch { return { quantity: 0, invalid: true }; }
}

type CartState = {
  ready: boolean; quantity: number; persistent: boolean; notice: string; announcement: string;
  connect: (storage?: CartStorage) => void;
  receive: (raw: string | null) => void;
  add: () => void; setQuantity: (quantity: number) => void; remove: () => void;
};

/** One store per provider, never shared between server requests. No commerce data. */
export function createCartStore() {
  let storage: CartStorage | undefined;
  return createStore<CartState>()((set, get) => {
    const write = (quantity: number, announcement: string) => {
      if (!get().ready) return;
      let persistent = get().persistent;
      let notice = get().notice;
      try {
        if (storage) {
          if (quantity === 0) storage.removeItem(CART_KEY);
          else storage.setItem(CART_KEY, JSON.stringify({ version: 1, itemId: DEMO_ITEM_ID, quantity }));
        }
      } catch {
        storage = undefined; persistent = false;
        notice = 'Local saving is unavailable. This demo cart will last for this page session only.';
      }
      set({ quantity, persistent, notice, announcement });
    };
    return {
      ready: false, quantity: 0, persistent: false, notice: '', announcement: '',
      connect: nextStorage => {
        if (get().ready) return;
        storage = nextStorage;
        try {
          if (!storage) throw new Error('Unavailable');
          const result = decodeCart(storage.getItem(CART_KEY));
          if (result.invalid) storage.removeItem(CART_KEY);
          set({ ready: true, persistent: true, quantity: result.quantity,
            notice: result.invalid ? 'Saved demo cart was invalid and has been cleared.' : '' });
        } catch {
          storage = undefined;
          set({ ready: true, persistent: false, notice: 'Local saving is unavailable. This demo cart will last for this page session only.' });
        }
      },
      receive: raw => {
        const result = decodeCart(raw);
        set({ quantity: result.quantity, notice: result.invalid ? 'Saved demo cart was invalid and has been cleared.' : '', announcement: 'Demo cart updated in another tab.' });
        if (result.invalid) {
          try { storage?.removeItem(CART_KEY); } catch { storage = undefined; set({ persistent: false }); }
        }
      },
      add: () => {
        if (get().quantity < MAX_DEMO_QUANTITY) write(get().quantity + 1, 'Aurel Veil design study added to demo cart. Quantity: ' + (get().quantity + 1) + '.');
      },
      setQuantity: quantity => {
        if (Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_DEMO_QUANTITY) write(quantity, `Demo quantity updated to ${quantity}.`);
      },
      remove: () => write(0, 'Aurel Veil design study removed from demo cart.'),
    };
  });
}
