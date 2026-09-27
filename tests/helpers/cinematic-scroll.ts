import { captureCanvas } from './canvas-capture';
import { expect, test, type Page, type Locator } from '@playwright/test';

export async function seek(page: Page, progress: number) {
  await expect(page.locator('.watch-story')).toHaveAttribute('data-progress', /.+/);
  await page.locator('.watch-story.is-running').evaluate((element, value) => {
    const top = parseFloat(getComputedStyle(element).getPropertyValue('--story-top'));
    const start = element.getBoundingClientRect().top + scrollY - top;
    const distance = (element as HTMLElement).offsetHeight - (element.firstElementChild as HTMLElement).offsetHeight;
    // Native scroll positions round to physical pixels. Seek before the start
    // for a true zero rather than a tiny positive approach sample.
    window.scrollTo(0, value === 0 ? Math.floor(start) : start + distance * value);
  }, progress);
  try {
    await expect.poll(async () => Number(await page.locator('.watch-story').getAttribute('data-progress')), { timeout: 20_000 }).toBeCloseTo(progress, 2);
  } catch (error) {
    const geometry = await page.locator('.watch-story').evaluate(element => ({
      scrollY, top: element.getBoundingClientRect().top, height: (element as HTMLElement).offsetHeight,
      stickyHeight: (element.firstElementChild as HTMLElement).offsetHeight,
      inset: getComputedStyle(element).getPropertyValue('--story-top'), progress: (element as HTMLElement).dataset.progress,
    }));
    await test.info().attach('cinematic-seek-geometry', { body: JSON.stringify({ requested: progress, ...geometry }), contentType: 'application/json' });
    throw error;
  }
}

/** Sticky entry/exit can put the canvas on fractional CSS pixels. Normalize only
 * screenshot compositing at a fixed viewport origin, without moving scroll,
 * resizing the canvas, or changing
 * the render. Every interior pixel still compares exactly, with no tolerance. */
export async function captureCinematicCanvas(canvas: Locator, options?: Parameters<Locator['screenshot']>[0]) {
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error('Cinematic canvas is not visible');
  return captureCanvas(canvas, { ...options,
    style: `header { visibility: hidden !important; } canvas { position: fixed !important; left: 0 !important; top: 0 !important; width: ${rect.width}px !important; height: ${rect.height}px !important; transform: none !important; z-index: 9999 !important; }`,
  });
}
