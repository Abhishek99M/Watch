import { captureCanvas } from './helpers/canvas-capture';
import { expect, test } from '@playwright/test';
import { AnimationClip, BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, QuaternionKeyframeTrack, Vector3 } from 'three';
import { createMovementInspection } from '../src/three/movement-inspection';
import { createExplodedAssembly } from '../src/three/exploded-assembly';

test('movement rotation is independent of separation, reverses exactly and restores visibility', () => {
  const object = new Group();
  const hand = new Mesh(new BoxGeometry(0.1, 1, 0.1), new MeshBasicMaterial()); hand.name = 'seconds_hand';
  const movement = new Mesh(new BoxGeometry(2, 2, 0.3), new MeshBasicMaterial());
  const dial = new Mesh(new BoxGeometry(2, 2, 0.1), new MeshBasicMaterial());
  object.add(hand, movement, dial); object.rotation.set(0.1, 0.2, 0.3); object.scale.setScalar(0.6);
  const clip = new AnimationClip('Seconds_Sweep_60s', 60, [new QuaternionKeyframeTrack('seconds_hand.quaternion', [0, 30, 60], [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, -1])]);
  const asset = { object, components: { Movement: [movement], SecondHand: [hand], Dial: [dial] }, animations: [clip], dispose() {} };
  const assembly = createExplodedAssembly([{ object: hand, offset: [0, 0, 3], interval: [0, 1] }]);
  const inspection = createMovementInspection(asset)!;
  expect(inspection.supported).toBe(true);
  assembly.apply(0.5); const separated = hand.position.clone();
  inspection.select('seconds'); inspection.seek(15); const rotated = hand.quaternion.clone();
  expect(rotated.equals(new Group().quaternion)).toBe(false);
  inspection.seek(42); inspection.seek(15); expect(hand.quaternion.toArray()).toEqual(rotated.toArray());
  expect(hand.position).toEqual(separated);
  expect(() => inspection.seek(NaN)).toThrow('finite');
  inspection.seek(0); expect(hand.quaternion.toArray()).toEqual([0, 0, 0, 1]);
  inspection.seek(60); expect(hand.quaternion.toArray()).toEqual([0, 0, 0, 1]);
  inspection.select('movement'); expect(hand.visible).toBe(false); expect(movement.visible).toBe(true);
  for (const aspect of [0.45, 1, 2.1]) {
    const camera = new PerspectiveCamera(28, aspect, 0.001, 100);
    inspection.frame(camera, new Vector3());
    const vertices = movement.geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
      const point = new Vector3().fromBufferAttribute(vertices, i).applyMatrix4(movement.matrixWorld).project(camera);
      expect(Math.abs(point.x)).toBeLessThan(1); expect(Math.abs(point.y)).toBeLessThan(1); expect(Math.abs(point.z)).toBeLessThan(1);
    }
  }
  inspection.dispose(); inspection.dispose();
  expect(hand.visible).toBe(true); expect(dial.visible).toBe(true);
  inspection.seek(15); expect(hand.quaternion.toArray()).toEqual([0, 0, 0, 1]);
  assembly.dispose(); expect(hand.position.toArray()).toEqual([0, 0, 0]);
  expect(createMovementInspection({ ...asset, animations: [] })!.supported).toBe(false);
  for (const mesh of [hand, movement, dial]) { mesh.geometry.dispose(); mesh.material.dispose(); }
});

test('V11 movement details, authored playback, reduced motion and exact return', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1000, height: 1000 });
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  await expect(page.getByRole('button', { name: 'Inspect movement', exact: true })).toBeVisible({ timeout: 15_000 });
  const canvas = page.locator('canvas');
  await page.addStyleTag({ content: 'header{visibility:hidden}.scene-orbit-controls{visibility:hidden}' });
  const home = await captureCanvas(canvas);
  await page.getByRole('button', { name: 'Inspect movement', exact: true }).click();
  await expect(page.getByText('Movement and bridges, isolated', { exact: false })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Component separation' })).toBeHidden();
  const movement = await captureCanvas(canvas, { path: testInfo.outputPath('movement-desktop.png') });
  expect(movement.equals(home)).toBe(false);
  await page.getByRole('button', { name: 'Inspect second hand' }).click();
  const start = await captureCanvas(canvas, { path: testInfo.outputPath('seconds-desktop.png') });
  const slider = page.getByRole('slider', { name: 'Second-hand position' });
  await slider.fill('15'); const rotated = await captureCanvas(canvas); expect(rotated.equals(start)).toBe(false);
  await slider.fill('42'); await slider.fill('15'); expect((await captureCanvas(canvas)).equals(rotated)).toBe(true);
  await page.getByRole('button', { name: 'Reset second hand' }).click(); expect((await captureCanvas(canvas, { path: testInfo.outputPath('seconds-reset.png') })).equals(start)).toBe(true);
  await page.getByRole('button', { name: 'Play second hand' }).click();
  await expect.poll(() => slider.inputValue(), { timeout: 20_000 }).not.toBe('0');
  await page.getByRole('button', { name: 'Pause second hand' }).click();
  const paused = await captureCanvas(canvas); expect((await captureCanvas(canvas)).equals(paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Play second hand' })).toBeHidden();
  await slider.fill('30');
  await page.getByRole('button', { name: 'Return to watch' }).click(); expect((await captureCanvas(canvas)).equals(home)).toBe(true);
  await page.getByRole('button', { name: 'Inspect movement', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 800 });
  await captureCanvas(canvas, { path: testInfo.outputPath('movement-mobile.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Return to watch' }).click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Start cinematic view' }).click();
  await expect(page.getByRole('button', { name: 'Inspect movement', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Exit cinematic view' }).click();
  await expect(page.getByRole('slider', { name: 'Component separation' })).toHaveValue('0');
  await page.getByRole('button', { name: 'Use static view' }).click();
  await expect(canvas).toHaveCount(0); expect(errors).toEqual([]);
});

test('movement inspection restores separated state and recovers from context loss', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await page.goto('/watch');
  await page.getByRole('button', { name: 'Load 3D preview' }).click();
  const separation = page.getByRole('slider', { name: 'Component separation' });
  await expect(separation).toBeVisible({ timeout: 15_000 });
  await page.addStyleTag({ content: 'header{visibility:hidden}.scene-orbit-controls{visibility:hidden}' });
  await separation.fill('65');
  const canvas = page.locator('canvas');
  const separated = await captureCanvas(canvas, { path: testInfo.outputPath('separated.png') });
  await page.getByRole('button', { name: 'Inspect movement', exact: true }).click();
  await page.getByRole('button', { name: 'Return to watch' }).click();
  await expect(separation).toHaveValue('65');
  expect((await captureCanvas(canvas, { path: testInfo.outputPath('separated-restored.png') })).equals(separated)).toBe(true);
  await page.getByRole('button', { name: 'Inspect movement', exact: true }).click();
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await captureCanvas(canvas, { path: testInfo.outputPath(`movement-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await canvas.evaluate(element => element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.getByText('3D preview unavailable', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect movement', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Retry 3D preview' }).click();
  await expect(separation).toHaveValue('0', { timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Return to watch' })).toBeHidden();
  await page.getByRole('button', { name: 'Inspect second hand' }).click();
  await page.getByRole('button', { name: 'Play second hand' }).click();
  await page.evaluate(() => { const spacer = document.createElement('div'); spacer.style.height = '1500px'; document.body.append(spacer); window.scrollTo(0, document.documentElement.scrollHeight); });
  await expect(page.getByRole('button', { name: 'Play second hand' })).toBeAttached({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Use static view' }).click();
  await expect(canvas).toHaveCount(0);
});
