import type { Locator } from '@playwright/test';
import sharp from 'sharp';

/** Fractional scroll positions can include one CSS surround pixel in a canvas crop.
 * Compare every interior pixel exactly; preserve the unmodified capture on disk.
 */
export async function captureCanvas(canvas: Locator, options?: Parameters<Locator['screenshot']>[0]) {
  // Manual sticky detail crops must use the same document position each time.
  // Never move a cinematic scene: its document position is its animation clock.
  await canvas.evaluate(element => {
    const story = element.closest('.watch-story');
    if (story && !story.classList.contains('is-running')) story.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  const image = sharp(await canvas.screenshot(options));
  const { width, height } = await image.metadata();
  if (!width || !height || width < 3 || height < 3) throw new Error('Canvas capture is empty');
  return image.extract({ left: 1, top: 1, width: width - 2, height: height - 2 }).png().toBuffer();
}
