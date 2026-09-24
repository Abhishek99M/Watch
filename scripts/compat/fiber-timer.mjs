/** Clock-shaped adapter for Fiber 9, backed by the supported Three Timer API.
 * No DOM listeners: Fiber owns the render loop and explicit start/stop lifecycle.
 */
export function createFiberTimer(THREE) {
  const timer = new THREE.Timer();
  return {
    autoStart: true, running: false, startTime: 0, oldTime: 0, elapsedTime: 0,
    start() {
      this.startTime = performance.now();
      this.oldTime = this.startTime;
      this.elapsedTime = 0;
      this.running = true;
      timer.reset();
    },
    stop() {
      this.getElapsedTime();
      this.running = false;
      this.autoStart = false;
    },
    getDelta() {
      if (this.autoStart && !this.running) { this.start(); return 0; }
      if (!this.running) return 0;
      timer.update();
      const delta = timer.getDelta();
      this.oldTime = performance.now();
      this.elapsedTime += delta;
      return delta;
    },
    getElapsedTime() { this.getDelta(); return this.elapsedTime; },
  };
}
