import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:43170';
export default defineConfig({
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
