// Verifies that an installed PWA picks up a new deployment on the next open
// (without the user having to clear cache): build A → open → build B → open → expect B.
import { chromium } from '@playwright/test';
import { execSync, spawn } from 'node:child_process';

const PORT = 4180;
const url = `http://127.0.0.1:${PORT}/`;
const env = { ...process.env, VITE_BASE: '/' };
const build = () => execSync('npx vite build', { env, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

build();
const server = spawn(
  'npx',
  ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'],
  {
    env,
    stdio: 'ignore',
    detached: true,
  },
);
let ok = false;
try {
  await sleep(2500);
  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  const version = async () => {
    await page.goto(url + '#/settings');
    return (await page.locator('text=/^v\\d/').first().textContent()).trim();
  };
  await page.goto(url);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
    timeout: 15000,
  });
  const a = await version();
  await sleep(1500); // build time has 1s resolution
  build();
  await page.goto(url);
  await page.waitForTimeout(5000);
  const b = await version();
  ok = a !== b;
  console.log(
    `before: ${a}\nafter:  ${b}\n${ok ? 'PWA auto-update OK' : 'PWA still serves the old version'}`,
  );
  await browser.close();
} finally {
  process.kill(-server.pid);
}
process.exit(ok ? 0 : 1);
