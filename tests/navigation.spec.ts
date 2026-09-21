import { expect, test } from '@playwright/test';

const destinations = [
  { path: '/watch', label: 'The watch', heading: 'A closer look, soon.' },
  { path: '/story', label: 'Our story', heading: 'Every detail has a story.' },
  { path: '/cart', label: 'Cart', heading: 'Shopping is coming soon.' },
];

test('desktop navigation and logo reach each destination with current-page state', async ({ page }) => {
  await page.goto('/');
  for (const destination of destinations) {
    await page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('link', { name: destination.label, exact: true }).click();
    await expect(page).toHaveURL(destination.path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(destination.heading);
    await expect(page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('link', { name: destination.label, exact: true })).toHaveAttribute('aria-current', 'page');
  }
  await page.getByRole('link', { name: 'Watch home' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A study in time.');
});

for (const destination of destinations) {
  test(destination.path + ' supports direct access and refresh without browser errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    expect((await page.goto(destination.path))?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(destination.heading);
    expect((await page.reload())?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('mobile menu opens by keyboard, closes on Escape and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.mobile-navigation');
  const trigger = menu.locator('summary');
  for (let attempt = 0; attempt < 3; attempt++) {
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(menu).toHaveJSProperty('open', true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('navigation', { name: 'Mobile primary' }).getByRole('link', { name: 'The watch', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveJSProperty('open', false);
    await expect(trigger).toBeFocused();
  }
  await expect(page.getByRole('navigation', { name: 'Mobile primary' })).toBeHidden();
});

test('mobile menu closes on navigation, current-route links, outside click and resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.mobile-navigation');
  for (const destination of destinations) {
    await menu.locator('summary').click();
    await page.getByRole('navigation', { name: 'Mobile primary' }).getByRole('link', { name: destination.label, exact: true }).click();
    await expect(page).toHaveURL(destination.path);
    await expect(menu).toHaveJSProperty('open', false);
  }
  await menu.locator('summary').click();
  await page.getByRole('navigation', { name: 'Mobile primary' }).getByRole('link', { name: 'Cart', exact: true }).click();
  await expect(menu).toHaveJSProperty('open', false);
  await menu.locator('summary').click();
  await page.getByRole('heading', { level: 1 }).click();
  await expect(menu).toHaveJSProperty('open', false);
  await menu.locator('summary').click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(menu).toHaveJSProperty('open', false);
  await expect(page.getByRole('navigation', { name: 'Primary', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(menu).toHaveJSProperty('open', false);
});

test('mobile disclosure does not trap focus and closes when focus leaves', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/watch');
  const menu = page.locator('.mobile-navigation');
  await menu.locator('summary').click();
  await page.getByRole('navigation', { name: 'Mobile primary' }).getByRole('link', { name: 'Cart', exact: true }).focus();
  await page.keyboard.press('Tab');
  expect(await page.getByRole('main').evaluate(element => element.contains(document.activeElement))).toBe(true);
  await expect(menu).toHaveJSProperty('open', false);
});

test('mobile menu and links work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseURL + '/');
  await page.locator('.mobile-navigation summary').click();
  await page.getByRole('navigation', { name: 'Mobile primary' }).getByRole('link', { name: 'The watch', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A closer look, soon.');
  await page.getByRole('link', { name: 'Watch home' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A study in time.');
  await context.close();
});

test('touch menu supports open, route selection and history navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseURL + '/');
  await page.locator('.mobile-navigation summary').tap();
  await page.getByRole('navigation', { name: 'Mobile primary' }).getByRole('link', { name: 'Our story', exact: true }).tap();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Every detail has a story.');
  await page.locator('.mobile-navigation summary').tap();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A study in time.');
  await expect(page.locator('.mobile-navigation')).toHaveJSProperty('open', false);
  await context.close();
});

for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
  test('navigation fits at ' + width + 'px with usable targets', async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    if (width < 768) await page.locator('.mobile-navigation summary').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const controls = page.locator('.site-header a:visible, .site-header summary:visible');
    for (const control of await controls.all()) {
      const box = await control.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(48);
      expect(box?.width).toBeGreaterThanOrEqual(48);
    }
    if (width === 320 || width === 1440) await page.screenshot({ path: testInfo.outputPath('navigation.png') });
  });
}

test('sticky header preserves skip-link visibility and main-content access', async ({ page }) => {
  await page.goto('/design-system');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  const headerBottom = await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().bottom);
  const headingTop = await page.getByRole('heading', { level: 1 }).evaluate(element => element.getBoundingClientRect().top);
  expect(headingTop).toBeGreaterThanOrEqual(headerBottom);
  await page.evaluate(() => window.scrollTo(0, 900));
  expect(await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().top)).toBe(0);
});
