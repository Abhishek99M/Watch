import { expect, test } from '@playwright/test';
import { watchTimeline } from '../src/animations/watch-timeline';

test('timeline frames before separation and holds an exact endpoint in either direction', () => {
  expect(watchTimeline(0)).toMatchObject({ camera: 0, separation: 0 });
  expect(watchTimeline(0.3)).toMatchObject({ camera: 1, separation: 0 });
  expect(watchTimeline(0.8)).toMatchObject({ camera: 1, separation: 1 });
  expect(watchTimeline(1)).toMatchObject({ camera: 1, separation: 1 });
  expect(watchTimeline(-1)).toEqual(watchTimeline(0));
  expect(watchTimeline(2)).toEqual(watchTimeline(1));
  for (const value of [NaN, Infinity, -Infinity]) expect(() => watchTimeline(value)).toThrow();
  const forward = Array.from({ length: 101 }, (_, index) => watchTimeline(index / 100));
  for (let repeat = 0; repeat < 100; repeat++) {
    for (let index = 100; index >= 0; index--) expect(watchTimeline(index / 100)).toEqual(forward[index]);
  }
});
