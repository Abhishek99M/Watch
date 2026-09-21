import { expect, test } from '@playwright/test';

const readyText = '3D preview ready. The scene stays still.';
const errorTitle = '3D preview unavailable';

test('3D is opt-in and renders successfully without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/watch');
  await expect(page.getByRole('button', { name: 'Load 3D preview' })).toBeVisible();
  await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('status').filter({ hasText: readyText })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.scene-stage canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Use static view' }).click();
  await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Load 3D preview' })).toBeVisible();
});

test('unsupported WebGL shows safe fallback and retries on restored support', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(window, 'restoreCanvasContext', { value: () => { HTMLCanvasElement.prototype.getContext = original; } });
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { configurable: true, writable: true, value: () => null });
  });
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('alert').filter({ hasText: errorTitle })).toBeVisible();
  await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A closer look, soon.');
  await page.evaluate(() => (window as unknown as { restoreCanvasContext: () => void }).restoreCanvasContext());
  await page.getByRole('button', { name: 'Retry 3D preview' }).click();
  await expect(page.getByRole('status').filter({ hasText: readyText })).toBeVisible({ timeout: 15_000 });
});

test('lost graphics context replaces the canvas and retry creates a fresh one', async ({ page }) => {
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('status').filter({ hasText: readyText })).toBeVisible({ timeout: 15_000 });
  const supported = await page.locator('.scene-stage canvas').evaluate(canvas => {
    const extension = (canvas as HTMLCanvasElement).getContext('webgl2')?.getExtension('WEBGL_lose_context');
    extension?.loseContext();
    return !!extension;
  });
  expect(supported).toBe(true);
  await expect(page.getByRole('alert').filter({ hasText: errorTitle })).toBeVisible();
  await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry 3D preview' }).click();
  await expect(page.getByRole('status').filter({ hasText: readyText })).toBeVisible({ timeout: 15_000 });
});

test('renderer draw exceptions produce a safe fallback', async ({ page }) => {
  await page.addInitScript(() => {
    WebGL2RenderingContext.prototype.drawElements = () => { throw new Error('private-renderer-error'); };
    WebGL2RenderingContext.prototype.drawArrays = () => { throw new Error('private-renderer-error'); };
  });
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('alert').filter({ hasText: errorTitle })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('main')).not.toContainText('private-renderer-error');
  await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
});

test('slow scene download times out instead of spinning indefinitely', async ({ page }) => {
  await page.goto('/watch');
  await expect(page.getByRole('button', { name: 'Load 3D preview' })).toBeVisible();
  // Keep lazy chunks pending, without interfering with initial hydration.
  await page.route('**/_next/static/chunks/**', () => {});
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Loading 3D preview' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: errorTitle })).toBeVisible({ timeout: 16_000 });
  await expect(page.getByRole('status').filter({ hasText: 'Loading 3D preview' })).toHaveCount(0);
  await expect(page.locator('.scene-static')).toBeVisible();
});

test('failed lazy download keeps static content and page navigation available', async ({ page }) => {
  await page.goto('/watch');
  await expect(page.getByRole('button', { name: 'Load 3D preview' })).toBeVisible();
  await page.route('**/_next/static/chunks/**', route => route.abort());
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('alert').filter({ hasText: errorTitle })).toBeVisible({ timeout: 15_000 });
  await page.unrouteAll();
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A study in time.');
});

test('static description and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:43170/watch');
  await expect(page.locator('.scene-static')).toBeVisible();
  await expect(page.getByText('A faceted form in warm light. The 3D view is optional and stays still.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Load 3D preview' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A study in time.');
  await context.close();
});

test('responsive canvas caps pixel density and reduced motion has no continuous rendering', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const scope = window as unknown as { studyDraws: number };
    scope.studyDraws = 0;
    const drawArrays = WebGL2RenderingContext.prototype.drawArrays;
    WebGL2RenderingContext.prototype.drawArrays = function (...args) {
      scope.studyDraws++;
      return drawArrays.apply(this, args);
    };
    const draw = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      scope.studyDraws++;
      return draw.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('status').filter({ hasText: readyText })).toBeVisible({ timeout: 15_000 });
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.locator('.scene-stage canvas').evaluate(canvas => {
      const node = canvas as HTMLCanvasElement;
      const bounds = node.getBoundingClientRect();
      return node.width > 0 && node.width <= Math.ceil(bounds.width * 1.5) && node.height > 0 && bounds.width <= window.innerWidth;
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width === 320 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath('scene-' + width + '.png'), fullPage: true });
    }
  }
  // Observe a settled interval: a static demand-rendered scene must not draw continuously.
  await page.waitForTimeout(250);
  const before = await page.evaluate(() => (window as unknown as { studyDraws: number }).studyDraws);
  expect(before).toBeGreaterThan(0);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => (window as unknown as { studyDraws: number }).studyDraws)).toBe(before);
});

test('repeated mount, static view and route exit leave no stale canvases', async ({ page }) => {
  await page.goto('/watch');
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByRole('button', { name: 'Load 3D preview' }).click();
    await expect(page.getByRole('status').filter({ hasText: readyText })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.scene-stage canvas')).toHaveCount(1);
    await page.getByRole('button', { name: 'Use static view' }).click();
    await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
});
