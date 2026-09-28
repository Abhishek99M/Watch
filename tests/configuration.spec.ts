import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { BoxGeometry, Group, Matrix4, Mesh, MeshPhysicalMaterial, Texture } from 'three';
import { createWatchConfiguration } from '../src/three/watch-configuration';
import { isDialTone, type DialTone } from '../src/data/watch-configuration';
import { captureCanvas } from './helpers/canvas-capture';
import { captureCinematicCanvas, seek } from './helpers/cinematic-scroll';

test('V11 exposes one textured dial material and no authored variant collection', () => {
  const bytes = readFileSync('public/models/aurel-veil.glb');
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  expect(json.extensionsUsed).not.toContain('KHR_materials_variants');
  const definition = JSON.parse(readFileSync('public/models/watch.json', 'utf8')).model;
  const slots: number[] = [];
  const visit = (index: number) => {
    const node = json.nodes[index];
    if (node.mesh !== undefined) for (const part of json.meshes[node.mesh].primitives) {
      if (json.materials[part.material].name === 'Black sunray dial') slots.push(part.material);
    }
    for (const child of node.children ?? []) visit(child);
  };
  definition.components.Dial.forEach(visit);
  expect(slots).toEqual([8]);
  expect(json.materials[8].pbrMetallicRoughness.baseColorTexture.index).toBe(4);
});

test('configuration isolates shared materials, restores exact assignments and disposes only its clone', () => {
  const texture = new Texture(), material = new MeshPhysicalMaterial({ map: texture, normalMap: texture, roughness: 0.38, metalness: 0.48, anisotropy: 0.48 });
  material.name = 'Black sunray dial';
  const other = new MeshPhysicalMaterial(), geometry = new BoxGeometry();
  const dial = new Mesh(geometry, [other, material]), shared = new Mesh(geometry, material), object = new Group();
  dial.position.set(1, 2, 3); object.add(dial, shared); object.updateMatrixWorld(true);
  const original = dial.material, color = material.color.toArray(), matrix = dial.matrixWorld.toArray();
  const asset = { object, components: { Dial: [dial] }, studioTransform: new Matrix4(), dispose() {} };
  const controller = createWatchConfiguration(asset)!;
  expect(controller).not.toBeNull(); expect(dial.material).toBe(original);
  let originalsDisposed = 0, texturesDisposed = 0, clonesDisposed = 0;
  material.addEventListener('dispose', () => originalsDisposed++); texture.addEventListener('dispose', () => texturesDisposed++);
  controller.select('midnight'); const clone = dial.material[1] as MeshPhysicalMaterial;
  clone.addEventListener('dispose', () => clonesDisposed++);
  expect(clone).not.toBe(material); expect(shared.material).toBe(material);
  expect(material.color.toArray()).toEqual(color); expect(clone.color.toArray()).not.toEqual(color);
  expect(clone.map).toBe(texture); expect(clone.normalMap).toBe(texture);
  expect(clone.roughness).toBe(material.roughness); expect(clone.metalness).toBe(material.metalness); expect(clone.anisotropy).toBe(material.anisotropy);
  for (let i = 0; i < 100; i++) {
    controller.select('forest'); expect(dial.material[1]).toBe(clone);
    controller.select('charcoal'); expect(dial.material).toBe(original);
    controller.select('midnight');
  }
  expect(dial.matrixWorld.toArray()).toEqual(matrix); expect(dial.visible).toBe(true);
  expect(() => controller.select('__proto__' as DialTone)).toThrow('Unsupported'); expect(controller.value).toBe('midnight');
  expect(isDialTone('constructor')).toBe(false); expect(isDialTone(null)).toBe(false);
  controller.dispose(); controller.dispose(); expect(dial.material).toBe(original);
  expect(clonesDisposed).toBe(1); expect(originalsDisposed).toBe(0); expect(texturesDisposed).toBe(0);
  expect(() => controller.select('forest')).toThrow('disposed');
  expect(createWatchConfiguration({ ...asset, studioTransform: undefined })).toBeNull();
  expect(createWatchConfiguration({ ...asset, components: { Dial: [dial, shared] } })).toBeNull();
  expect(createWatchConfiguration({ ...asset, components: {} })).toBeNull();
  geometry.dispose(); material.dispose(); other.dispose(); texture.dispose();
});

test('dial choices use native keyboard selection, preserve texture detail and reset exactly', async ({ page }, info) => {
  test.setTimeout(180_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  let downloads = 0; page.on('request', request => { if (request.url().endsWith('/aurel-veil.glb')) downloads++; });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  const charcoal = page.getByRole('radio', { name: /Charcoal/ });
  await expect(charcoal).toBeChecked({ timeout: 15_000 });
  const canvas = page.locator('canvas');
  await page.addStyleTag({ content: 'header{visibility:hidden}.scene-orbit-controls{visibility:hidden}' });
  await page.getByRole('button', { name: 'Inspect dial', exact: true }).click();
  const original = await captureCanvas(canvas, { path: info.outputPath('charcoal-dial.png') });
  await charcoal.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Midnight blue' })).toBeChecked();
  const blue = await captureCanvas(canvas, { path: info.outputPath('midnight-dial.png') }); expect(blue.equals(original)).toBe(false);
  await page.getByRole('radio', { name: 'Forest green' }).check();
  const green = await captureCanvas(canvas, { path: info.outputPath('forest-dial.png') }); expect(green.equals(original)).toBe(false); expect(green.equals(blue)).toBe(false);
  await expect(page.locator('.craftsmanship-caption')).toContainText('forest green colour study');
  await page.getByRole('radio', { name: 'Midnight blue' }).check(); expect((await captureCanvas(canvas)).equals(blue)).toBe(true);
  await page.getByRole('button', { name: 'Reset appearance', exact: true }).click();
  await expect(charcoal).toBeChecked(); expect((await captureCanvas(canvas)).equals(original)).toBe(true);
  await expect(page.getByRole('button', { name: 'Reset appearance' })).toBeDisabled();
  expect(downloads).toBe(1); expect(errors).toEqual([]);
});

test('selected colour survives assembly, movement, craftsmanship and the complete cinematic story', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  const blue = page.getByRole('radio', { name: 'Midnight blue' }); await expect(blue).toBeVisible({ timeout: 15_000 }); await blue.check();
  const separation = page.getByRole('slider', { name: 'Component separation' }); await separation.fill('65');
  await page.getByRole('button', { name: 'Inspect movement', exact: true }).click();
  await expect(blue).toBeChecked(); await page.getByRole('button', { name: 'Return to watch' }).click(); await expect(separation).toHaveValue('65');
  await page.getByRole('button', { name: 'Inspect second hand' }).click(); await page.getByRole('slider', { name: 'Second-hand position' }).fill('15');
  await page.getByRole('button', { name: 'Return to watch' }).click();
  await page.getByRole('button', { name: 'Inspect case', exact: true }).click(); await expect(blue).toBeChecked();
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  await expect(page.getByRole('radio')).toHaveCount(0);
  const canvas = page.locator('canvas'); await seek(page, 0); const start = await captureCinematicCanvas(canvas);
  await seek(page, 0.6); await captureCinematicCanvas(canvas); await seek(page, 0.8); await captureCinematicCanvas(canvas);
  await seek(page, 0.96); expect((await captureCinematicCanvas(canvas)).equals(start)).toBe(true);
  await seek(page, 0.6); await seek(page, 0);
  await page.getByRole('button', { name: 'Exit cinematic view' }).click(); await expect(blue).toBeChecked(); await expect(separation).toHaveValue('0');
  await page.getByRole('button', { name: 'Inspect dial', exact: true }).click();
  await expect(page.locator('.craftsmanship-caption')).toContainText('midnight blue colour study');
});

test('configuration is responsive, reduced-motion friendly and idle', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const scope = window as unknown as { configDraws: number }; scope.configDraws = 0;
    const original = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...args) { scope.configDraws++; return Reflect.apply(original, this, args); };
  });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('radio', { name: 'Forest green' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Inspect dial', exact: true }).click();
  await page.getByRole('radio', { name: 'Forest green' }).check();
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.configuration-controls').scrollIntoViewIfNeeded();
    await expect(page.getByRole('radio', { name: 'Forest green' })).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390 || width === 1440) await page.screenshot({ path: info.outputPath(`configuration-${width}.png`) });
  }
  await page.locator('canvas').screenshot(); await page.waitForTimeout(300);
  const draws = await page.evaluate(() => (window as unknown as { configDraws: number }).configDraws);
  await page.waitForTimeout(400); expect(await page.evaluate(() => (window as unknown as { configDraws: number }).configDraws)).toBe(draws);
  await expect(page.getByRole('button', { name: 'Play second hand' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Start cinematic view' })).toHaveCount(0);
});

test('saved selection recovers after context loss and static exit without colouring the poster', async ({ page }, info) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  const forest = page.getByRole('radio', { name: 'Forest green' }); await expect(forest).toBeVisible({ timeout: 15_000 }); await forest.check();
  await page.locator('canvas').evaluate(element => {
    const extension = (element as HTMLCanvasElement).getContext('webgl2')?.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('Context-loss simulation is unavailable');
    extension.loseContext();
  });
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(page.locator('.configuration-saved')).toContainText('Forest green');
  await page.getByRole('button', { name: 'Retry 3D preview' }).click(); await expect(forest).toBeChecked({ timeout: 15_000 });
  const recovered = await captureCinematicCanvas(page.locator('canvas'), { path: info.outputPath('after-retry.png') });
  // Compare against explicitly selecting the saved tone in this same recovered
  // context. Separate GPU contexts can differ even on untouched surfaces.
  await page.getByRole('button', { name: 'Reset appearance' }).click();
  expect((await captureCinematicCanvas(page.locator('canvas'))).equals(recovered)).toBe(false);
  await forest.check(); expect((await captureCinematicCanvas(page.locator('canvas'))).equals(recovered)).toBe(true);
  await page.getByRole('button', { name: 'Use static view' }).click(); await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.configuration-note')).toContainText('static image shows the original Charcoal');
  await page.getByRole('button', { name: 'Load 3D preview' }).click(); await expect(forest).toBeChecked({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Use static view' }).click(); await page.getByRole('button', { name: 'Reset appearance' }).click();
  await expect(page.locator('.configuration-saved')).toHaveCount(0);
  await page.reload(); await expect(page.locator('canvas')).toHaveCount(0); await expect(page.getByRole('radio')).toHaveCount(0);
});

test('static, no-JavaScript and unsupported previews do not offer false configuration', async ({ page, browser }) => {
  test.setTimeout(60_000);
  const context = await browser.newContext({ javaScriptEnabled: false }); const staticPage = await context.newPage();
  await staticPage.goto('/watch'); await expect(staticPage.locator('.configuration-note')).toContainText('illustrative');
  await expect(staticPage.getByRole('radio')).toHaveCount(0); await context.close();
  await page.route('**/models/aurel-veil.glb', route => route.abort());
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('button', { name: 'Retry 3D preview' })).toBeVisible({ timeout: 15_000 }); await expect(page.getByRole('radio')).toHaveCount(0);
  await page.getByRole('button', { name: 'View placeholder watch' }).click();
  await expect(page.getByText('3D preview ready. The scene stays still.')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('radio')).toHaveCount(0);
});
