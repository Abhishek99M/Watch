import { expect, test } from '@playwright/test';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector3 } from 'three';
import { createCraftsmanshipInspection } from '../src/three/craftsmanship-inspection';
import { craftsmanshipViews } from '../src/data/craftsmanship';
import { captureCanvas } from './helpers/canvas-capture';

test('detail framing fits transformed focus geometry without changing surfaces or transforms', () => {
  const object = new Group(); object.rotation.set(0.1, 0.2, 0.3); object.scale.setScalar(0.6);
  const make = (name: string, y = 0) => {
    const mesh = new Mesh(new BoxGeometry(2, 1, 0.3), new MeshBasicMaterial());
    mesh.name = name; mesh.position.y = y; object.add(mesh); return mesh;
  };
  const components = { Dial: [make('dial')], Bezel: [make('bezel')], Case: [make('case')], Crown: [make('crown')],
    Strap: [make('end_link_lower', -1), ...[1, 2, 3].map(i => make(`bracelet_lower_0${i}`, -1-i))] };
  const asset = { object, components, dispose() {} };
  const inspection = createCraftsmanshipInspection(asset)!;
  object.updateMatrixWorld(true);
  const meshes = Object.values(components).flat();
  const before = meshes.map(mesh => ({ matrix: mesh.matrixWorld.toArray(), visible: mesh.visible, material: mesh.material.uuid }));
  for (const aspect of [0.45, 1, 2.8]) {
    const camera = new PerspectiveCamera(28, aspect, 0.001, 100), target = new Vector3();
    for (const view of craftsmanshipViews) {
      inspection.frame(view, camera, target);
      const focus = view === 'dial' ? [...components.Dial, ...components.Bezel] : view === 'case' ? [...components.Case, ...components.Crown, ...components.Bezel] : components.Strap;
      for (const mesh of focus) {
        const positions = mesh.geometry.getAttribute('position');
        for (let i = 0; i < positions.count; i++) {
          const point = new Vector3().fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld).project(camera);
          expect(Math.abs(point.x)).toBeLessThan(1); expect(Math.abs(point.y)).toBeLessThan(1); expect(Math.abs(point.z)).toBeLessThan(1);
        }
      }
      const pose = [...camera.position.toArray(), ...camera.quaternion.toArray(), ...target.toArray()];
      inspection.frame('bracelet', camera, target); inspection.frame(view, camera, target);
      expect([...camera.position.toArray(), ...camera.quaternion.toArray(), ...target.toArray()]).toEqual(pose);
    }
  }
  expect(meshes.map(mesh => ({ matrix: mesh.matrixWorld.toArray(), visible: mesh.visible, material: mesh.material.uuid }))).toEqual(before);
  expect(createCraftsmanshipInspection({ ...asset, components: { ...components, Strap: [] } })).toBeNull();
  for (const mesh of meshes) { mesh.geometry.dispose(); mesh.material.dispose(); }
});

test('V11 surface studies reverse exactly and restore an orbited, separated watch', async ({ page }, info) => {
  test.setTimeout(180_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  const dial = page.getByRole('button', { name: 'Inspect dial', exact: true });
  await expect(dial).toBeVisible({ timeout: 15_000 });
  await page.addStyleTag({ content: 'header{visibility:hidden}.scene-orbit-controls{visibility:hidden}' });
  const separation = page.getByRole('slider', { name: 'Component separation' }), canvas = page.locator('canvas');
  await separation.fill('65'); await canvas.focus(); await page.keyboard.press('ArrowLeft');
  // Compare the rendered watch with the same focus state, not the canvas focus ring.
  await canvas.evaluate(element => (element as HTMLElement).blur());
  const home = await captureCanvas(canvas, { path: info.outputPath('prior-watch.png') });
  await dial.focus(); await page.keyboard.press('Enter');
  await expect(dial).toBeFocused(); await expect(dial).toHaveAttribute('aria-pressed', 'true');
  await expect(separation).toBeHidden(); await expect(page.getByRole('button', { name: 'Inspect movement', exact: true })).toBeHidden();
  const dialImage = await captureCanvas(canvas, { path: info.outputPath('dial-desktop.png') });
  for (const view of ['case', 'bracelet']) {
    await page.getByRole('button', { name: `Inspect ${view}`, exact: true }).click();
    const image = await captureCanvas(canvas, { path: info.outputPath(`${view}-desktop.png`) });
    expect(image.equals(dialImage)).toBe(false);
  }
  await dial.click(); expect((await captureCanvas(canvas)).equals(dialImage)).toBe(true);
  await page.locator('.craftsmanship-controls').scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('craftsmanship-desktop-ui.png') });
  await page.getByRole('button', { name: 'Return to watch' }).click();
  await expect(separation).toHaveValue('65'); expect((await captureCanvas(canvas, { path: info.outputPath('restored-watch.png') })).equals(home)).toBe(true);
  await page.getByRole('button', { name: 'Inspect second hand' }).click();
  await page.getByRole('slider', { name: 'Second-hand position' }).fill('15');
  await page.getByRole('button', { name: 'Return to watch' }).click();
  await dial.click(); expect((await captureCanvas(canvas)).equals(dialImage)).toBe(true);
  await page.getByRole('button', { name: 'Use static view' }).click();
  await expect(canvas).toHaveCount(0); expect(errors).toEqual([]);
});

test('surface studies stay usable across sizes, reduced motion, cinematic handoff and recovery', async ({ page }, info) => {
  test.setTimeout(240_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('button', { name: 'Inspect dial', exact: true })).toBeVisible({ timeout: 15_000 });
  const canvas = page.locator('canvas');
  await page.getByRole('button', { name: 'Inspect bracelet', exact: true }).click();
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('button', { name: 'Return to watch' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 320 || width === 1440) await captureCanvas(canvas, { path: info.outputPath(`bracelet-${width}.png`) });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const view of craftsmanshipViews) {
    await page.getByRole('button', { name: `Inspect ${view}`, exact: true }).click();
    await captureCanvas(canvas, { path: info.outputPath(`${view}-mobile.png`) });
  }
  await page.locator('.craftsmanship-controls').scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('craftsmanship-mobile-ui.png') });
  const still = await captureCanvas(canvas); expect((await captureCanvas(canvas)).equals(still)).toBe(true);
  await expect(page.getByRole('button', { name: 'Start cinematic view' })).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  await expect(page.getByRole('button', { name: 'Inspect bracelet', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Exit cinematic view' }).click();
  await expect(page.getByRole('slider', { name: 'Component separation' })).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Return to watch' })).toBeHidden();
  await page.getByRole('button', { name: 'Inspect case', exact: true }).click();
  await canvas.evaluate(element => element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.getByText('3D preview unavailable', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect case', exact: true })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Character in the details.' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry 3D preview' }).click();
  await expect(page.getByRole('button', { name: 'Inspect case', exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Return to watch' })).toBeHidden();
  await page.getByRole('button', { name: 'Use static view' }).click(); await expect(canvas).toHaveCount(0);
});

test('craftsmanship copy survives no JavaScript and a failed model without unsupported controls', async ({ browser, page, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const staticPage = await context.newPage(); await staticPage.goto('/watch');
  await expect(staticPage.getByRole('heading', { name: 'Character in the details.' })).toBeVisible();
  await expect(staticPage.getByText('physical materials and manufacturing specifications are not yet confirmed.', { exact: false })).toBeVisible();
  await expect(staticPage.locator('canvas')).toHaveCount(0); await context.close();
  await page.route('**/models/aurel-veil.glb', route => route.abort());
  await page.goto('/watch'); await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByText('3D preview unavailable', { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Inspect dial', exact: true })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Character in the details.' })).toBeVisible();
});
