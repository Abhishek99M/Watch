import { expect, test } from '@playwright/test';

const sectionName = 'Aurel Veil.';

test('product information and native disclosures work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/watch#product-information');
    const section = page.getByRole('region', { name: sectionName, exact: true });
    await expect(section).toBeVisible();
    await expect(section.locator('dt')).toHaveText(['Dial', 'Case', 'Bracelet', 'Movement preview']);
    await expect(section).toContainText('not physical product specifications');
    const colours = section.locator('summary').filter({ hasText: 'About the colour studies' });
    await colours.focus(); await page.keyboard.press('Enter');
    await expect(section.getByText(/not available physical variants/)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(section.locator('summary').filter({ hasText: 'Physical specifications' })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(section.getByText(/Price and availability are also unconfirmed/)).toBeVisible();
    await page.keyboard.press('Space');
    await expect(section.getByText(/Price and availability are also unconfirmed/)).toBeHidden();
    await expect(page.locator('canvas')).toHaveCount(0);
  } finally { await context.close(); }
});

test('product information remains readable across widths and reduced motion without loading 3D', async ({ page }, info) => {
  const sceneRequests: string[] = [];
  page.on('request', request => { if (/\.(glb|gltf)(\?|$)/.test(request.url())) sceneRequests.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/watch#product-information');
  const section = page.getByRole('region', { name: sectionName, exact: true });
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await section.getByRole('img').scrollIntoViewIfNeeded();
    await expect.poll(() => section.getByRole('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await section.getByRole('img').evaluate((image: HTMLImageElement) => image.decode());
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: sectionName, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const row of await section.locator('dd').all()) {
      const box = await row.boundingBox();
      expect(box).not.toBeNull(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    if (width === 390 || width === 1440) await section.screenshot({ path: info.outputPath(`product-information-${width}.png`) });
  }
  expect(sceneRequests).toEqual([]);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('failed model loading leaves product information usable and honestly labeled', async ({ page }) => {
  await page.route('**/models/watch.json', route => route.abort());
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByText('3D preview unavailable', { exact: true })).toBeVisible({ timeout: 20_000 });
  const section = page.getByRole('region', { name: sectionName, exact: true });
  await expect(section.getByRole('img')).toHaveAttribute('src', '/images/aurel-veil.jpg');
  await expect(section).toContainText('not a simulation of a working mechanical caliber');
  await section.locator('summary').filter({ hasText: 'About the colour studies' }).click();
  await expect(section.getByText(/not available physical variants/)).toBeVisible();
  await page.getByRole('button', { name: 'Use static view' }).click();
  await expect(section.getByRole('heading')).toBeVisible();
});
