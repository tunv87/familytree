/**
 * Walks every screen on an iPhone-sized viewport (normal and large text) and checks that:
 *  - all text uses the bundled Nunito font and its Vietnamese subset is loaded
 *  - nothing overflows horizontally
 * Screenshots go to test-results/screens/<variant>-<screen>.png for a visual pass.
 */
import { expect, test, type Page } from '@playwright/test';
import { createFamily, fillPerson, newDevice, signInAdmin } from './helpers';

const VARIANTS = { normal: false, big: true } as const;
type Variant = keyof typeof VARIANTS;

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
    const page = await newDevice(browser, { bigText: VARIANTS[variant] });
    await page.goto('/');
    await checkScreen(page, variant, 'welcome');
    await signInAdmin(page, `ui-${variant}`);
    await checkScreen(page, variant, 'settings');
    await page.getByRole('button', { name: /Nhật ký lỗi/ }).click();
    await checkScreen(page, variant, 'debug');

    await createFamily(page, 'Họ Nguyễn — làng Đông Ngạc, Hà Nội');
    await checkScreen(page, variant, 'add-first');
    await fillPerson(page, {
      name: 'Nguyễn Văn Trường Giang',
      birth: [1, 1, 1920],
      death: { d: 10, m: 3, y: 1990 },
    });
    await checkScreen(page, variant, 'person');
    await page.getByTestId('add-child').click();
    await page.getByTestId('deceased').click();
    await checkScreen(page, variant, 'person-form');
    await page.getByRole('button', { name: 'Quay lại' }).click();

    await page.goto('/');
    await checkScreen(page, variant, 'home');
    for (const [id, screen] of [
      ['home-people', 'people'],
      ['home-tree', 'tree'],
      ['home-calendar', 'calendar'],
      ['home-invite', 'invite'],
    ]) {
      await page.getByTestId(id).click();
      await checkScreen(page, variant, screen);
      await page.getByRole('button', { name: 'Quay lại' }).click();
    }
    await page.goto('/#/families');
    await checkScreen(page, variant, 'families');
  });
}
