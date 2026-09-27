import { expect, test } from '@playwright/test';
import { captureCinematicCanvas as captureCanvas, seek } from './helpers/cinematic-scroll';

test('V11 closes exactly, reverses its closing pose and releases detail ownership', async ({ page }, info) => {
  test.setTimeout(180_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('slider', { name: 'Component separation' })).toBeVisible({ timeout: 15_000 });
  await page.addStyleTag({ content: 'header{visibility:hidden}.scene-orbit-controls{visibility:hidden}' });
  // Cinema must clear an actively sampled second-hand rotation before it owns transforms.
  await page.getByRole('button', { name: 'Inspect second hand' }).click();
  await page.getByRole('slider', { name: 'Second-hand position' }).fill('15');
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  const canvas = page.locator('canvas');
  await seek(page, 0); const start = await captureCanvas(canvas, { path: info.outputPath('start-desktop.png') });
  await seek(page, 0.6); const open = await captureCanvas(canvas, { path: info.outputPath('inspection-desktop.png') });
  await seek(page, 0.8); const closing = await captureCanvas(canvas, { path: info.outputPath('closing-desktop.png') });
  await expect(page.locator('.watch-story-toolbar')).toContainText('Each layer returns');
  expect(closing.equals(open)).toBe(false); expect(closing.equals(start)).toBe(false);
  await seek(page, 0.96);
  await expect(page.locator('.watch-story-toolbar')).toContainText('Whole again');
  expect((await captureCanvas(canvas, { path: info.outputPath('assembled-desktop.png') })).equals(start)).toBe(true);
  await seek(page, 1); expect((await captureCanvas(canvas, { path: info.outputPath('endpoint-desktop.png') })).equals(start)).toBe(true);
  await seek(page, 0.8); expect((await captureCanvas(canvas)).equals(closing)).toBe(true);
  await seek(page, 0.6); expect((await captureCanvas(canvas)).equals(open)).toBe(true);
  await seek(page, 0.96);
  await page.getByRole('button', { name: 'Exit cinematic view' }).click();
  await expect(page.getByRole('slider', { name: 'Component separation' })).toHaveValue('0');
  await page.getByRole('button', { name: 'Inspect bracelet', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Inspect bracelet', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  await seek(page, 0.96); expect((await captureCanvas(canvas)).equals(start)).toBe(true);
  await page.getByRole('button', { name: 'Use static view' }).click();
  await expect(canvas).toHaveCount(0); expect(errors).toEqual([]);
});

test('reassembly reframes on mobile and exits safely when motion preference changes', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('slider')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  const canvas = page.locator('canvas');
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    await seek(page, 0.8);
    await expect(page.getByRole('button', { name: 'Exit cinematic view' })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) await page.screenshot({ path: info.outputPath('closing-mobile.png') });
    await seek(page, 0.96);
    await expect(page.locator('.watch-story-toolbar')).toContainText('Whole again');
    if (width === 390) await page.screenshot({ path: info.outputPath('assembled-mobile.png') });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await seek(page, 0); const start = await captureCanvas(canvas, { path: info.outputPath('start-mobile.png') });
  await seek(page, 0.96); expect((await captureCanvas(canvas, { path: info.outputPath('final-mobile.png') })).equals(start)).toBe(true);
  await seek(page, 0.8); await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.is-running')).toHaveCount(0);
  await expect(page.getByRole('slider')).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Start cinematic view' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Inspect dial', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Inspect dial', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
