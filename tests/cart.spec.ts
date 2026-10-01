import { expect, test } from '@playwright/test';
import { CART_KEY, DEMO_ITEM_ID, createCartStore, decodeCart } from '../src/store/cart';

const saved = (quantity: number) => JSON.stringify({ version: 1, itemId: DEMO_ITEM_ID, quantity });

test('cart validates saved data, bounds mutations and isolates provider instances', () => {
  for (const raw of ['broken', '{}', 'null', '[]', saved(0), saved(-1), saved(10), saved(1.5), saved(Infinity), saved(1).replace('1,', '2,'), saved(1).replace(DEMO_ITEM_ID, 'unknown'), JSON.stringify({ version: 1, itemId: DEMO_ITEM_ID, quantity: '1' }), JSON.stringify({ version: 1, itemId: DEMO_ITEM_ID, quantity: 1, price: 0 }), 'x'.repeat(513)]) {
    expect(decodeCart(raw)).toEqual({ quantity: 0, invalid: true });
  }
  expect(decodeCart(null)).toEqual({ quantity: 0, invalid: false });
  expect(decodeCart(saved(9))).toEqual({ quantity: 9, invalid: false });
  let value: string | null = null;
  const storage = { getItem: () => value, setItem: (_: string, next: string) => { value = next; }, removeItem: () => { value = null; } };
  const first = createCartStore(), second = createCartStore();
  first.getState().add(); expect(first.getState().quantity).toBe(0);
  first.getState().connect(storage);
  for (let i = 0; i < 12; i++) first.getState().add();
  expect(first.getState().quantity).toBe(9); expect(value).toBe(saved(9)); expect(second.getState().quantity).toBe(0);
  for (const invalid of [0, -1, 10, 1.1, NaN, Infinity]) first.getState().setQuantity(invalid);
  expect(first.getState().quantity).toBe(9);
  first.getState().remove(); expect(value).toBeNull(); expect(first.getState().quantity).toBe(0);
  first.getState().receive('invalid'); expect(value).toBeNull(); expect(first.getState().notice).toContain('invalid');
});

test('blocked and quota-limited storage preserve an in-memory cart', () => {
  const store = createCartStore();
  store.getState().connect({ getItem: () => saved(2), setItem: () => { throw new Error('Quota'); }, removeItem: () => {} });
  store.getState().add(); expect(store.getState().quantity).toBe(3); expect(store.getState().persistent).toBe(false);
  store.getState().add(); expect(store.getState().quantity).toBe(4);
  store.getState().remove(); expect(store.getState().quantity).toBe(0);
  const blocked = createCartStore(); blocked.getState().connect(); blocked.getState().add();
  expect(blocked.getState().quantity).toBe(1); expect(blocked.getState().notice).toContain('session only');
});

test('add, quantity, navigation, reload and removal preserve a single demo line', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/watch#product-information');
  await page.getByRole('button', { name: 'Add to demo cart', exact: true }).click();
  await page.getByRole('button', { name: 'Add to demo cart', exact: true }).click();
  await page.getByRole('link', { name: 'View demo cart', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your demo cart.');
  await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('2');
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await page.getByLabel('Quantity', { exact: true }).selectOption('9');
  await page.reload(); await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('9');
  await page.getByRole('link', { name: 'Continue exploring' }).click();
  await expect(page.getByRole('button', { name: 'Add to demo cart', exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'View demo cart', exact: true }).click();
  await page.getByRole('button', { name: 'Remove Aurel Veil' }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Your demo cart is empty.' })).toBeFocused();
  await page.reload(); await expect(page.getByRole('heading', { name: 'Your demo cart is empty.' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), CART_KEY)).toBeNull();
  expect(errors).toEqual([]);
});

test('invalid saved data recovers without rendering untrusted content or sale claims', async ({ page }) => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({ version: 1, itemId: '<script>bad</script>', quantity: 2, price: 10 })), { key: CART_KEY });
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Your demo cart is empty.' })).toBeVisible();
  await expect(page.getByText('Saved demo cart was invalid and has been cleared.')).toBeVisible();
  await expect(page.locator('.cart-content')).not.toContainText('<script>');
  expect(await page.evaluate(key => localStorage.getItem(key), CART_KEY)).toBeNull();
  await expect(page.getByRole('button', { name: /checkout|buy|pay/i })).toHaveCount(0);
});

test('cart synchronizes across tabs including removal', async ({ context, page }) => {
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Your demo cart is empty.' })).toBeVisible();
  const other = await context.newPage();
  await other.goto('/watch#product-information');
  await other.getByRole('button', { name: 'Add to demo cart', exact: true }).click();
  await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('1');
  await page.getByRole('button', { name: 'Remove Aurel Veil' }).click();
  await expect(other.locator('.demo-cart-entry [role="status"]')).toHaveText('Demo cart updated in another tab.');
  await other.getByRole('link', { name: 'View demo cart', exact: true }).click();
  await expect(other.getByRole('heading', { name: 'Your demo cart is empty.' })).toBeVisible();
});

test('blocked browser storage still allows add and remove across client navigation', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }));
  await page.goto('/watch#product-information');
  await page.getByRole('button', { name: 'Add to demo cart', exact: true }).click();
  await page.getByRole('link', { name: 'View demo cart', exact: true }).click();
  await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('1');
  await expect(page.getByText(/Local saving is unavailable/)).toBeVisible();
  await page.getByRole('button', { name: 'Remove Aurel Veil' }).click();
  await expect(page.getByRole('heading', { name: 'Your demo cart is empty.' })).toBeVisible();
});

test('cart stays readable without JavaScript and never offers a working purchase action', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage(); await page.goto('/cart');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your demo cart.');
    await expect(page.getByText(/Enable JavaScript to load/)).toBeVisible();
    await page.getByRole('link', { name: 'Explore the design' }).click();
    await expect(page.getByRole('button', { name: 'Add to demo cart', exact: true })).toBeDisabled();
    await expect(page.getByText(/JavaScript is required to change/)).toBeVisible();
  } finally { await context.close(); }
});

test('cart controls fit seven widths, work by keyboard and remain still under reduced motion', async ({ page }, info) => {
  const downloads: string[] = []; page.on('request', request => { if (request.url().endsWith('.glb')) downloads.push(request.url()); });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: CART_KEY, value: saved(2) });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/cart');
  const quantity = page.getByLabel('Quantity', { exact: true }); await expect(quantity).toHaveValue('2');
  await quantity.focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(quantity).toHaveValue('3');
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(quantity).toBeVisible();
    if (width === 390 || width === 1440) {
      await page.locator('.cart-item img').evaluate((image: HTMLImageElement) => image.decode());
      await page.screenshot({ path: info.outputPath(`cart-${width}.png`), fullPage: true });
    }
  }
  expect(downloads).toEqual([]);
});
