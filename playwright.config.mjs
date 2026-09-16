import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const PORT = 4173;
// Use a preinstalled Chromium when one is provided (CI images, remote sandboxes); otherwise Playwright's own.
const PRESET = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : '');
const launchOptions = {
  ...(PRESET ? { executablePath: PRESET } : {}),
  // Software WebGL so the galaxy renders in headless runs.
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Software WebGL on CI runners is slow enough that a galaxy test starves any other worker.
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    launchOptions,
  },
  webServer: {
    command: `node scripts/serve.mjs ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
