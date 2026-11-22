/**
 * Walks every screen on an iPhone-sized viewport (normal and large text) and checks that:
 *  - all text uses the bundled Nunito font and its Vietnamese subset is loaded
 *  - nothing overflows horizontally
 * Screenshots go to test-results/screens/<variant>-<screen>.png for a visual pass.
 */
import { devices, expect, test, type Browser, type Page } from '@playwright/test';

const VARIANTS = { normal: false, big: true } as const;
type Variant = keyof typeof VARIANTS;

async function open(browser: Browser, variant: Variant) {
  const ctx = await browser.newContext({ ...devices['iPhone 14'] });
  await ctx.addInitScript((bigText) => {
    localStorage.setItem('ft:settings', JSON.stringify({ bigText }));
  }, VARIANTS[variant]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  return page;
}

async function checkScreen(page: Page, variant: Variant, screen: string) {
  await page.waitForTimeout(350); // let pop/fade animations finish
  const report = await page.evaluate(async () => {
    await document.fonts.ready;
    const badFont: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent ?? '';
      if (!/\p{L}|\p{N}/u.test(text)) continue; // emoji / whitespace only
      const el = n.parentElement!;
      if (el.closest('.log-view')) continue; // intentionally monospace
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const first = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
      if (first !== 'Nunito')
        badFont.push(`${el.tagName}.${el.className}: "${text.trim().slice(0, 20)}" → ${first}`);
    }
    const faces = [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === 'Nunito');
    const vietLoaded = faces.some(
      (f) => f.status === 'loaded' && f.unicodeRange.includes('U+1EA0'),
    );
    const hasVietText = /[ạ-ỹđăâêôơư]/i.test(document.body.innerText);
    return {
      badFont,
      vietLoaded,
      hasVietText,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  await page.screenshot({ path: `test-results/screens/${variant}-${screen}.png` });
  expect(report.badFont, `${screen}: elements not using Nunito`).toEqual([]);
  if (report.hasVietText)
    expect(report.vietLoaded, `${screen}: Vietnamese font subset loaded`).toBe(true);
  expect(report.overflow, `${screen}: horizontal overflow (px)`).toBeLessThanOrEqual(0);
}

for (const variant of Object.keys(VARIANTS) as Variant[]) {
  test(`all screens look right (${variant} text)`, async ({ browser }) => {
    const page = await open(browser, variant);
    await page.goto('/');
    await checkScreen(page, variant, 'home');
    for (const [id, screen] of [
      ['home-tree', 'tree'],
      ['home-calendar', 'calendar'],
      ['home-invite', 'invite'],
    ]) {
      await page.getByTestId(id).click();
      await expect(page.getByTestId('coming-soon')).toBeVisible();
      await checkScreen(page, variant, screen);
      await page.getByRole('button', { name: 'Quay lại' }).click();
    }
    await page.getByRole('button', { name: 'Cài đặt' }).click();
    await checkScreen(page, variant, 'settings');
    await page.getByRole('button', { name: /Nhật ký lỗi/ }).click();
    await checkScreen(page, variant, 'debug');
  });
}
