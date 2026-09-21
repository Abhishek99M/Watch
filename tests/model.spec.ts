import { expect, test, type Page } from '@playwright/test';
import { fixtureGlb, fixtureManifest } from './fixtures/glb';
import { parseModelDefinition } from '../src/three/model-definition';
import { inspectGlb, prepareWatch } from '../src/three/model-loader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';

async function manifest(page: Page, value: unknown = fixtureManifest) {
  await page.route('**/models/watch.json', route => route.fulfill({ json: value }));
}
async function activate(page: Page) {
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
}
const modelCaption = '3D model preview. The static illustration remains an illustrative placeholder.';

test('embedded textured GLB loads, labels the model and offers the procedural placeholder', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await manifest(page);
  await page.route('**/models/test-watch.glb', route => route.fulfill({ body: fixtureGlb({ texture: 'valid' }), contentType: 'model/gltf-binary' }));
  await activate(page);
  await expect(page.getByText(modelCaption)).toBeVisible({ timeout: 15_000 });
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'View placeholder watch' }).click();
  await expect(page.getByText('3D preview ready. The scene stays still.')).toBeVisible();
  await expect(page.getByRole('figure')).toContainText('Design, materials and proportions are placeholders');
});

test('explicit source indices resolve duplicate names and normalize asset scale without flattening transforms', async () => {
  const bytes = fixtureGlb({ scale: 1000 });
  const buffer = Uint8Array.from(bytes).buffer;
  inspectGlb(buffer);
  const gltf = await new GLTFLoader().parseAsync(buffer, '');
  const definition = parseModelDefinition(fixtureManifest)!;
  const loaded = await prepareWatch(gltf, definition);
  expect(loaded.components.Case?.[0]).not.toBe(loaded.components.Dial?.[0]);
  expect(loaded.components.Case?.[0].scale.x).toBe(500);
  expect(loaded.components.Dial?.[0].position.z).toBe(120);
  const bounds = new Box3().setFromObject(loaded.object);
  const size = bounds.getSize(new Vector3());
  expect(Math.max(size.x, size.y, size.z)).toBeCloseTo(2.8);
  expect(bounds.getCenter(new Vector3()).length()).toBeCloseTo(0);
  let disposed = 0;
  gltf.scene.traverse(object => {
    if ('geometry' in object) (object.geometry as { addEventListener: (name: string, callback: () => void) => void }).addEventListener('dispose', () => disposed++);
  });
  loaded.dispose();
  const count = disposed;
  expect(count).toBeGreaterThan(0);
  loaded.dispose();
  expect(disposed).toBe(count);
});

for (const failure of ['missing', 'malformed', 'broken texture', 'external texture', 'missing mapping', 'oversized'] as const) {
  test(failure + ' model preserves static fallback and can recover to the placeholder', async ({ page }) => {
    await manifest(page, failure === 'missing mapping' ? {
      model: { ...fixtureManifest.model, components: { Case: [0], Dial: [99] } },
    } : fixtureManifest);
    const external: string[] = [];
    page.on('request', request => { if (request.url().includes('example.invalid')) external.push(request.url()); });
    await page.route('**/models/test-watch.glb', route => {
      if (failure === 'missing') return route.fulfill({ status: 404 });
      if (failure === 'malformed') return route.fulfill({ body: Buffer.from('invalid') });
      if (failure === 'oversized') return route.fulfill({ body: Buffer.alloc(8 * 1024 * 1024 + 1) });
      return route.fulfill({ body: fixtureGlb({ texture: failure === 'broken texture' ? 'broken' : failure === 'external texture' ? 'external' : undefined }) });
    });
    await activate(page);
    await expect(page.getByRole('alert').filter({ hasText: '3D preview unavailable' })).toContainText('3D preview unavailable', { timeout: 15_000 });
    await expect(page.locator('.scene-static')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(external).toEqual([]);
    await page.getByRole('button', { name: 'View placeholder watch' }).click();
    await expect(page.getByText('3D preview ready. The scene stays still.')).toBeVisible();
  });
}

test('failed model retries a fresh download successfully', async ({ page }) => {
  await manifest(page);
  let attempts = 0;
  await page.route('**/models/test-watch.glb', route => {
    attempts++;
    return attempts === 1 ? route.fulfill({ status: 503 }) : route.fulfill({ body: fixtureGlb() });
  });
  await activate(page);
  await expect(page.getByRole('alert').filter({ hasText: '3D preview unavailable' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry 3D preview' }).click();
  await expect(page.getByText(modelCaption)).toBeVisible();
  expect(attempts).toBe(2);
});

test('pending GLB times out and preserves static recovery', async ({ page }) => {
  await manifest(page);
  await page.route('**/models/test-watch.glb', () => {});
  await activate(page);
  await expect(page.getByRole('status').filter({ hasText: 'Loading 3D preview' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: '3D preview unavailable' })).toBeVisible({ timeout: 16_000 });
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Use static view' }).click();
  await expect(page.getByRole('button', { name: 'Load 3D preview' })).toBeVisible();
});

test('route exit aborts a pending GLB request', async ({ page }) => {
  await manifest(page);
  const requested = page.waitForRequest('**/models/test-watch.glb');
  await page.route('**/models/test-watch.glb', () => {});
  await activate(page);
  await requested;
  const cancelled = page.waitForEvent('requestfailed', { predicate: request => request.url().endsWith('/test-watch.glb') });
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await cancelled;
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('manifest rejects missing provenance, remote URLs and reused component nodes', () => {
  for (const model of [
    { ...fixtureManifest.model, license: '' },
    { ...fixtureManifest.model, url: 'https://example.invalid/watch.glb' },
    { ...fixtureManifest.model, components: { Case: [0], Dial: [0] } },
    { ...fixtureManifest.model, components: { Case: [0] } },
  ]) expect(() => parseModelDefinition({ model })).toThrow();
  expect(parseModelDefinition({ model: null })).toBeNull();
});

test('configured model stays still across responsive sizes and recovers from context loss', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const scope = window as unknown as { modelDraws: number };
    scope.modelDraws = 0;
    const draw = WebGL2RenderingContext.prototype.drawArrays;
    WebGL2RenderingContext.prototype.drawArrays = function (...args) {
      scope.modelDraws++;
      return draw.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await manifest(page);
  await page.route('**/models/test-watch.glb', route => route.fulfill({ body: fixtureGlb({ texture: 'valid', scale: 1000 }) }));
  await activate(page);
  await expect(page.getByText(modelCaption)).toBeVisible({ timeout: 15_000 });
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.locator('.scene-stage canvas').evaluate(node => {
      const canvas = node as HTMLCanvasElement;
      return canvas.width > 0 && canvas.width <= Math.ceil(canvas.getBoundingClientRect().width * 1.5);
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width === 320 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath('fixture-' + width + '.png'), fullPage: true });
    }
  }
  await page.waitForTimeout(250);
  const before = await page.evaluate(() => (window as unknown as { modelDraws: number }).modelDraws);
  expect(before).toBeGreaterThan(0);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => (window as unknown as { modelDraws: number }).modelDraws)).toBe(before);
  await page.locator('.scene-stage canvas').evaluate(node => {
    const extension = (node as HTMLCanvasElement).getContext('webgl2')?.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('Test browser lacks context-loss extension');
    extension.loseContext();
  });
  await expect(page.getByRole('alert').filter({ hasText: '3D preview unavailable' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry 3D preview' }).click();
  await expect(page.getByText(modelCaption)).toBeVisible();
});

test('mapping rejects nested roles that would share transforms', async () => {
  const gltf = await new GLTFLoader().parseAsync(Uint8Array.from(fixtureGlb()).buffer, '');
  const loaded = await prepareWatch(gltf, parseModelDefinition(fixtureManifest)!);
  loaded.components.Case![0].add(loaded.components.Dial![0]);
  await expect(prepareWatch(gltf, parseModelDefinition(fixtureManifest)!)).rejects.toThrow('overlap');
  loaded.dispose();
});
