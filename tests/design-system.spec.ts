import { expect, test } from '@playwright/test';

test('shared controls preserve keyboard, disabled and recovery behavior', async ({ page }) => {
  await page.goto('/design-system');
  await page.getByRole('button', { name: 'Test action' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Action activated' })).toHaveText('Action activated 1 times.');
  await expect(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Loading', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Loading', exact: true })).toHaveAttribute('aria-busy', 'true');
  await page.getByRole('button', { name: 'Retry preview' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Preview recovered.' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset error example' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Preview unavailable' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Design reference', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'View card example' }).click();
  await expect(page).toHaveURL(/#cards$/);
});

test('preview is not indexed and remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:43170/design-system');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('heading', { name: 'Space for the object.' })).toBeVisible();
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A study in time.' })).toBeVisible();
  await context.close();
});

test('text tokens meet 7:1 contrast on supported surfaces', async ({ page }) => {
  await page.goto('/design-system');
  const ratios = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const luminance = (token: string) => {
      const hex = style.getPropertyValue(token).trim().replace('#', '');
      const channels = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255)
        .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    return ['--color-canvas', '--color-surface', '--color-raised'].flatMap(background =>
      ['--color-ink', '--color-muted', '--color-accent', '--color-danger'].map(foreground => {
        const a = luminance(background), b = luminance(foreground);
        return { foreground, background, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
      }));
  });
  for (const pair of ratios) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(7);
});

for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
  test('design system fits at ' + width + 'px with accessible targets and reduced motion', async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/design-system');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const button of await page.locator('.button, .nav-link').all()) {
      const box = await button.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(48);
      expect(box?.width).toBeGreaterThanOrEqual(48);
    }
    await expect(page.locator('.skeleton')).toHaveCSS('animation-name', 'none');
    await page.getByRole('button', { name: 'Test action' }).focus();
    await expect(page.getByRole('button', { name: 'Test action' })).toHaveCSS('outline-style', 'solid');
    if (width === 320 || width === 1440) await page.screenshot({ path: testInfo.outputPath('design-system.png'), fullPage: true });
  });
}
