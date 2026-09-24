import { expect, test } from '@playwright/test';
import { fixtureGlb, fixtureManifest } from './fixtures/glb';

const ready='3D preview ready. Drag to rotate; scroll or pinch to zoom.';

test('actual V11 separation reverses visually, survives resize and stays idle under reduced motion',async({page},testInfo)=>{
  test.setTimeout(180_000);
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'||/THREE.Clock|X4122/.test(message.text()))errors.push(message.text());});
  await page.addInitScript(()=>{
    const scope=window as unknown as {assemblyDraws:number};scope.assemblyDraws=0;
    for(const key of ['drawArrays','drawElements'] as const){
      const original=WebGL2RenderingContext.prototype[key];
      // Both signatures are retained; only the test counts calls.
      WebGL2RenderingContext.prototype[key]=function(...args: Parameters<typeof original>){scope.assemblyDraws++;return Reflect.apply(original,this,args);};
    }
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1000,height:900});
  await page.goto('/watch');await page.getByRole('button',{name:'Load 3D preview'}).click();
  await expect(page.getByText(ready)).toBeVisible({timeout:15_000});
  const slider=page.getByRole('slider',{name:'Component separation'}),canvas=page.locator('.scene-stage canvas');
  await expect(slider).toHaveValue('0');await expect(page.getByRole('button',{name:'Reassemble',exact:true})).toBeDisabled();
  const captureStyle=await page.addStyleTag({content:'.scene-orbit-controls{opacity:0}header{visibility:hidden}'});
  const home=await canvas.screenshot();
  const captures:Buffer[]=[];
  for(const value of ['25','50','75','100']){
    await slider.fill(value);await expect(slider).toHaveValue(value);
    const capture=await canvas.screenshot({path:testInfo.outputPath(`assembly-${value}.png`)});
    expect(capture.equals(home)).toBe(false);captures.push(capture);
  }
  expect(new Set(captures.map(buffer=>buffer.toString('base64'))).size).toBe(4);
  for(const value of ['75','50','25']) {await slider.fill(value);expect((await canvas.screenshot()).equals(captures[Number(value)/25-1])).toBe(true);}
  await page.getByRole('button',{name:'Reassemble',exact:true}).click();
  expect((await canvas.screenshot()).equals(home)).toBe(true);
  await captureStyle.evaluate(style=>style.parentNode?.removeChild(style));
  await slider.focus();await page.keyboard.press('End');await expect(slider).toHaveValue('100');
  await page.keyboard.press('Home');await expect(slider).toHaveValue('0');
  for(const value of ['100','0','75','25','100'])await slider.fill(value);
  for(const width of [320,375,390,768,1024,1440,1920]){
    await page.setViewportSize({width,height:900});await expect(slider).toHaveValue('100');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width===320||width===1440){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:testInfo.outputPath(`assembly-width-${width}.png`),fullPage:true});}
  }
  await canvas.screenshot();await page.waitForTimeout(250);
  const before=await page.evaluate(()=>(window as unknown as {assemblyDraws:number}).assemblyDraws);
  await page.waitForTimeout(350);expect(await page.evaluate(()=>(window as unknown as {assemblyDraws:number}).assemblyDraws)).toBe(before);
  // Re-entry runs at the original viewport after the seven-width stress pass.
  await page.setViewportSize({width:1000,height:900});
  await canvas.screenshot();
  await page.getByRole('button',{name:'Use static view'}).click();await expect(slider).toHaveCount(0);
  await page.getByRole('button',{name:'Load 3D preview'}).click();await expect(slider).toHaveValue('0',{timeout:15_000});
  await page.getByRole('button',{name:'Separate parts',exact:true}).click();await expect(slider).toHaveValue('100');
  await page.locator('canvas').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  await expect(slider).toHaveCount(0);await page.getByRole('button',{name:'Retry 3D preview'}).click();
  await expect(slider).toHaveValue('0',{timeout:15_000});
  await page.getByRole('link',{name:'Return home',exact:true}).click();await expect(page.locator('canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('invalid V11 assembly metadata uses recovery and never exposes unusable controls',async({page})=>{
  await page.route('**/models/watch.json',route=>route.fulfill({json:{model:{...fixtureManifest.model,presentation:'aurel-veil-v11'}}}));
  await page.route('**/models/test-watch.glb',route=>route.fulfill({body:fixtureGlb(),contentType:'model/gltf-binary'}));
  await page.goto('/watch');await page.getByRole('button',{name:'Load 3D preview'}).click();
  await expect(page.getByRole('alert').filter({hasText:'3D preview unavailable'})).toBeVisible({timeout:15_000});
  await expect(page.getByRole('slider')).toHaveCount(0);
  await page.getByRole('button',{name:'View placeholder watch'}).click();
  await expect(page.getByText('3D preview ready. The scene stays still.')).toBeVisible({timeout:15_000});
  await expect(page.getByRole('slider')).toHaveCount(0);
});
