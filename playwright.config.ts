import { defineConfig, devices } from '@playwright/test';

const PORT = 5174;
const PROD_PORT = 5175;
const emuEnv = { VITE_USE_EMULATOR: '1', VITE_EMULATOR_HOST: '127.0.0.1', VITE_BASE: '/' };

// Chromium only (WebKit is not installed here): phone sizes are emulated on Chromium.
const chromium = { browserName: 'chromium' as const };

/** Screen sizes for the UI matrix (UI-xx). */
const SCREENS = {
  'iphone-se': devices['iPhone SE'],
  'iphone-14': devices['iPhone 14'],
  'iphone-14-pro-max': devices['iPhone 14 Pro Max'],
  'galaxy-s8': devices['Galaxy S8'],
  'pixel-7': devices['Pixel 7'],
  'iphone-14-landscape': devices['iPhone 14 landscape'],
  'ipad-mini': devices['iPad Mini'],
  'laptop-1366': { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 },
  'desktop-1920': { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 },
};

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.PW_JSON
    ? [['list'], ['json', { outputFile: process.env.PW_JSON }]]
    : process.env.CI
      ? [['list'], ['html', { open: 'never' }]]
      : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    // functional, UX, crash and security tests on a typical phone
    {
      name: 'iphone',
      testIgnore: [/ui\//, /prod\//],
      use: { ...devices['iPhone 14'], ...chromium },
    },
    // production build (service worker, load time)
    {
      name: 'prod',
      testMatch: /prod\/.*\.spec\.ts/,
      use: { ...devices['iPhone 14'], ...chromium, baseURL: `http://127.0.0.1:${PROD_PORT}/` },
    },
    // UI matrix: every screen on every common screen size
    ...Object.entries(SCREENS).map(([name, device]) => ({
      name: `ui-${name}`,
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...device, ...chromium },
    })),
  ],
  webServer: [
    {
      command: `vite --port ${PORT} --strictPort --host 127.0.0.1`,
      url: `http://127.0.0.1:${PORT}/`,
      reuseExistingServer: !process.env.CI,
      env: emuEnv,
    },
    {
      // a real build pointed at the emulators
      command: `vite build --outDir dist-emu && vite preview --outDir dist-emu --port ${PROD_PORT} --strictPort --host 127.0.0.1`,
      url: `http://127.0.0.1:${PROD_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: emuEnv,
    },
  ],
});
