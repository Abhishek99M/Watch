import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:43170';
const suite = process.env.PLAYWRIGHT_SUITE;
if (suite !== undefined && suite !== 'core' && suite !== 'movement' && suite !== 'craftsmanship' && suite !== 'configuration') {
  throw new Error('PLAYWRIGHT_SUITE must be core, movement, craftsmanship or configuration, or unset for all tests.');
}
export default defineConfig({
  // Detail suites get fresh browser processes in CI; all partitions are disjoint.
  ...(suite === 'movement' ? { testMatch: '**/movement.spec.ts' } : {}),
  ...(suite === 'craftsmanship' ? { testMatch: '**/craftsmanship.spec.ts' } : {}),
  ...(suite === 'configuration' ? { testMatch: '**/configuration.spec.ts' } : {}),
  ...(suite === 'core' ? { testIgnore: ['**/movement.spec.ts', '**/craftsmanship.spec.ts', '**/configuration.spec.ts'] } : {}),
  // SwiftShader watch scenes saturate shared CI CPUs; concurrent GLB retries
  // can exceed the real application deadline even though isolated runs pass.
  testDir: './tests', fullyParallel: true, workers: process.env.CI ? 1 : 2, forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure', channel: process.env.PLAYWRIGHT_CHANNEL, launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.TEST_PRODUCTION === '1' ? 'npm run start -- --hostname 127.0.0.1 --port 43170' : 'npm run dev -- --hostname 127.0.0.1 --port 43170',
    url: baseURL, reuseExistingServer: !!process.env.PLAYWRIGHT_BASE_URL, timeout: 120_000,
  },
});
