import { expect, test } from '@playwright/test';

const ready = '3D preview ready. Drag to rotate; scroll or pinch to zoom.';
test('selected V11 loads on seven widths, stays still and can be reopened', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  const assets: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if(message.type() === 'error' || /THREE.Clock|X4122/.test(message.text())) errors.push(message.text()); });
  page.on('request', request => { if(/\.(glb|hdr)$/.test(request.url())) assets.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/watch');
  expect(assets).toEqual([]);
  await expect(page.getByRole('img', {name: /Aurel Veil design study/})).toBeVisible();
  await page.getByRole('button', {name:'Load 3D preview'}).click();
  await expect(page.getByText(ready)).toBeVisible({timeout:15_000});
  expect(assets.some(url => url.endsWith('/models/aurel-veil.glb'))).toBe(true);
  expect(assets.some(url => url.endsWith('/textures/studio-small-09.hdr'))).toBe(true);
  // Synchronize the software GPU's first paint before measuring resize results.
  await page.locator('canvas').screenshot();
  for (const width of [320,375,390,768,1024,1440,1920]) {
    await page.setViewportSize({width, height:900});
    await expect.poll(() => page.locator('.scene-stage canvas').evaluate(canvas => {
      const node=canvas as HTMLCanvasElement;
      return node.width>0 && node.width<=Math.ceil(node.getBoundingClientRect().width*2);
    }), {timeout:30_000}).toBe(true);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width===320 || width===1440) await page.screenshot({path:testInfo.outputPath(`actual-watch-${width}.png`),fullPage:true});
  }
  await page.getByRole('button',{name:'Use static view'}).click();
  await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
  await page.getByRole('button',{name:'Load 3D preview'}).click();
  await expect(page.getByText(ready)).toBeVisible({timeout:15_000});
  await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  await expect(page.getByRole('alert').filter({hasText:'3D preview unavailable'})).toContainText('3D preview unavailable');
  await page.getByRole('button',{name:'Retry 3D preview'}).click();
  await expect(page.getByText(ready)).toBeVisible({timeout:15_000});
  await page.getByRole('link',{name:'Return home',exact:true}).click();
  await expect(page.locator('.scene-stage canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('studio download failure preserves the poster and procedural fallback', async ({page}) => {
  await page.route('**/textures/studio-small-09.hdr', route => route.fulfill({status:503,body:'Unavailable'}));
  await page.goto('/watch');
  await page.getByRole('button',{name:'Load 3D preview'}).click();
  await expect(page.getByRole('alert').filter({hasText:'3D preview unavailable'})).toContainText('3D preview unavailable',{timeout:15_000});
  await expect(page.getByRole('img',{name:/Aurel Veil design study/})).toBeVisible();
  await page.getByRole('button',{name:'View placeholder watch'}).click();
  await expect(page.getByText('3D preview ready. The scene stays still.')).toBeVisible({timeout:15_000});
});
