import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Timer } from 'three';
import { createFiberTimer } from './compat/fiber-timer.mjs';

test('Fiber Timer preserves seconds, start/stop, elapsed reset and manual advance fields', () => {
  let now = 1000;
  mock.method(performance, 'now', () => now);
  try {
    const clock = createFiberTimer({ Timer });
    assert.equal(clock.getDelta(), 0);
    now += 250;
    assert.equal(clock.getDelta(), 0.25);
    assert.equal(clock.elapsedTime, 0.25);
    now += 500;
    assert.equal(clock.getElapsedTime(), 0.75);
    clock.stop();
    now += 10000;
    assert.equal(clock.getDelta(), 0);
    assert.equal(clock.elapsedTime, 0.75);
    clock.start();
    assert.equal(clock.elapsedTime, 0);
    now += 100;
    assert.equal(clock.getDelta(), 0.1);
    // Fiber's setFrameloop('never') stops and resets elapsedTime, then advance
    // directly assigns elapsedTime and oldTime rather than ticking the timer.
    clock.stop(); clock.elapsedTime = 0;
    clock.oldTime = clock.elapsedTime; clock.elapsedTime = 42;
    assert.equal(clock.getDelta(), 0);
    assert.equal(clock.getElapsedTime(), 42);
    clock.start(); now += 50;
    assert.equal(clock.getDelta(), 0.05);
    assert.equal(clock.elapsedTime, 0.05);
  } finally { mock.restoreAll(); }
});
