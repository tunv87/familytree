import { devices, expect, type Browser, type Page } from '@playwright/test';

export async function newDevice(browser: Browser, opts: { bigText?: boolean } = {}) {
  const ctx = await browser.newContext({ ...devices['iPhone 14'] });
  if (opts.bigText)
    await ctx.addInitScript(() =>
      localStorage.setItem('ft:settings', JSON.stringify({ bigText: true })),
    );
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  return page;
}

/** Signs in as a Google admin through the emulator (no popup). */
export async function signInAdmin(page: Page, name = 'admin') {
  await page.goto('/#/settings');
  await page.waitForFunction(() => '__testSignIn' in window);
  await page.evaluate(
    (n) => (window as unknown as { __testSignIn: (n: string) => Promise<void> }).__testSignIn(n),
    name,
  );
  await expect(page.getByTestId('account')).toContainText('Đăng xuất');
}

/** Creates a family and returns its id; leaves the page on the "add first person" form. */
export async function createFamily(page: Page, name = 'Họ Nguyễn') {
  await page.goto('/#/new-family');
  await page.getByTestId('family-name').fill(name);
  await page.getByTestId('create-family').click();
  await expect(page.getByTestId('name')).toBeVisible();
  return page.evaluate(() => JSON.parse(localStorage.getItem('ft:family')!).id as string);
}

export async function fillPerson(
  page: Page,
  p: {
    name: string;
    gender?: 'm' | 'f' | 'u';
    birth?: [number, number, number];
    death?: { d: number; m: number; y?: number; lunar?: boolean };
  },
) {
  await page.getByTestId('name').fill(p.name);
  if (p.gender) await page.getByTestId(`gender-${p.gender}`).click();
  if (p.birth) {
    await page.getByTestId('birth-d').fill(String(p.birth[0]));
    await page.getByTestId('birth-m').fill(String(p.birth[1]));
    await page.getByTestId('birth-y').fill(String(p.birth[2]));
  }
  if (p.death) {
    await page.getByTestId('deceased').click();
    if (p.death.lunar === false) await page.getByTestId('death-s').click();
    await page.getByTestId('death-d').fill(String(p.death.d));
    await page.getByTestId('death-m').fill(String(p.death.m));
    if (p.death.y) await page.getByTestId('death-y').fill(String(p.death.y));
  }
  await page.getByTestId('save').click();
  await expect(page.getByTestId('person-name')).toHaveText(p.name);
}
