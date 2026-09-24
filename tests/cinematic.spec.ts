import { expect, test, type Page } from '@playwright/test';

async function seek(page: Page, progress: number) {
  await expect(page.locator('.watch-story')).toHaveAttribute('data-progress', /.+/);
  await page.locator('.watch-story.is-running').evaluate((element, value) => {
    const top = parseFloat(getComputedStyle(element).getPropertyValue('--story-top'));
    const start = element.getBoundingClientRect().top + scrollY - top;
    const distance = (element as HTMLElement).offsetHeight - (element.firstElementChild as HTMLElement).offsetHeight;
    window.scrollTo(0, start + distance * value);
  }, progress);
  await expect.poll(async () => Number(await page.locator('.watch-story').getAttribute('data-progress')), { timeout: 20_000 }).toBeCloseTo(progress, 2);
}

test('V11 cinematic scroll reverses, holds, releases controls and restores the assembled image', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('slider')).toBeVisible({ timeout: 15_000 });
  const canvas = page.locator('canvas');
  const style = await page.addStyleTag({ content: '.scene-orbit-controls{visibility:hidden}header{visibility:hidden}' });
  const home = await canvas.screenshot();
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  await seek(page, 0.55);
  const middle = await canvas.screenshot({ path: testInfo.outputPath('cinematic-middle.png') });
  await seek(page, 0.85);
  const hold = await canvas.screenshot({ path: testInfo.outputPath('cinematic-hold.png') });
  expect(hold.equals(middle)).toBe(false);
  await seek(page, 0.95); expect((await canvas.screenshot()).equals(hold)).toBe(true);
  await seek(page, 0.55); expect((await canvas.screenshot()).equals(middle)).toBe(true);
  await seek(page, 0);
  await style.evaluate(element => element.parentNode?.removeChild(element));
  await canvas.hover(); const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  await page.getByRole('button', { name: 'Exit cinematic view' }).focus();
  const wheelPosition = await page.evaluate(() => scrollY);
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 20_000 }).toBeGreaterThan(wheelPosition);
  await page.getByRole('button', { name: 'Exit cinematic view' }).click();
  await expect(page.getByRole('slider')).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Start cinematic view' })).toBeFocused();
  const hide = await page.addStyleTag({ content: '.scene-orbit-controls{visibility:hidden}header{visibility:hidden}' });
  expect((await canvas.screenshot()).equals(home)).toBe(true);
  await hide.evaluate(element => element.parentNode?.removeChild(element));
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 }); await seek(page, 0.85);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Exit cinematic view' })).toBeInViewport();
    if (width === 320 || width === 1440) await page.screenshot({ path: testInfo.outputPath(`cinematic-${width}.png`) });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.is-running')).toHaveCount(0);
  await expect(page.getByRole('slider')).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Start cinematic view' })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  await seek(page, 0.55);
  await page.reload();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Load 3D preview' })).toBeVisible();
  expect(errors).toEqual([]);
});


test('cinematic touch scrolling, idle rendering and context-loss recovery retain manual access', async ({ page, context }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    const scope = window as unknown as { cinematicDraws: number }; scope.cinematicDraws = 0;
    for (const key of ['drawArrays', 'drawElements'] as const) {
      const original = WebGL2RenderingContext.prototype[key];
      WebGL2RenderingContext.prototype[key] = function (...args: Parameters<typeof original>) {
        scope.cinematicDraws++; return Reflect.apply(original, this, args);
      };
    }
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await page.getByRole('button', { name: 'Start cinematic view' }).click({ timeout: 15_000 });
  await seek(page, 0.4);
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const before = await page.evaluate(() => scrollY);
  await expect(page.locator('canvas')).toHaveCSS('touch-action', 'pan-y');
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 500 }] });
  for (const y of [450, 400, 350, 300, 250]) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await seek(page, 0.85); await page.locator('canvas').screenshot();
  await page.waitForTimeout(300);
  const draws = await page.evaluate(() => (window as unknown as { cinematicDraws: number }).cinematicDraws);
  await seek(page, 0.95); await page.waitForTimeout(350);
  expect(await page.evaluate(() => (window as unknown as { cinematicDraws: number }).cinematicDraws)).toBe(draws);
  await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.locator('.is-running')).toHaveCount(0);
  await expect(page.getByRole('alert').filter({ hasText: '3D preview unavailable' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry 3D preview' }).click();
  await expect(page.getByRole('slider')).toHaveValue('0', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Start cinematic view' }).click(); await seek(page, 0.5);
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
});


test('failed cinematic chunks restore manual exploration without losing the loaded model', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 600, height: 700 });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('slider')).toHaveValue('0', { timeout: 15_000 });
  // Only the cinematic modules remain lazy after the complete scene is ready.
  await page.route('**/_next/static/chunks/**', route => route.abort());
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Cinematic view is unavailable' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.is-running')).toHaveCount(0);
  await expect(page.getByRole('slider')).toHaveValue('0');
  await page.getByRole('button', { name: 'Separate parts', exact: true }).click();
  await expect(page.getByRole('slider')).toHaveValue('100');
  await expect(page.locator('canvas')).toBeVisible();
});
