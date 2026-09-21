import { expect, test } from '@playwright/test';
test('homepage loads, survives refresh and reports no browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  expect((await page.goto('/'))?.status()).toBe(200);
  await expect(page).toHaveTitle('Watch | A study in time');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A study in time.');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
test('keyboard users can skip to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});
test('unknown routes return 404 and offer a working path home', async ({ page }) => {
  expect((await page.goto('/missing-page'))?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Return home' }).click();
  await expect(page.getByRole('heading', { name: 'A study in time.' })).toBeVisible();
});
for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
  test('content fits at ' + width + 'px with reduced motion', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
