import { devices, expect, type Browser, type Page } from '@playwright/test';

export async function newDevice(
  browser: Browser,
  opts: { bigText?: boolean; device?: string } = {},
) {
  const ctx = await browser.newContext({ ...devices[opts.device ?? 'iPhone 14'] });
  if (opts.bigText)
    await ctx.addInitScript(() =>
      localStorage.setItem('ft:settings', JSON.stringify({ bigText: true })),
    );
  const page = await ctx.newPage();
  trackErrors(page);
  return page;
}

/** Collects uncaught page errors so tests can assert there were none. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  (page as unknown as { __errors: string[] }).__errors = errors;
  page.on('pageerror', (e) => {
    errors.push(e.message);
    console.error('[pageerror]', e.message);
  });
  return errors;
}

export function pageErrors(page: Page): string[] {
  return (page as unknown as { __errors?: string[] }).__errors ?? [];
}

/** Signs in as a Google admin through the emulator (no popup); returns the uid. */
export async function signInAdmin(page: Page, name = 'admin'): Promise<string> {
  await page.goto('/#/settings');
  await page.waitForFunction(() => '__testSignIn' in window);
  const uid = await page.evaluate(
    (n) => (window as unknown as { __testSignIn: (n: string) => Promise<string> }).__testSignIn(n),
    name,
  );
  await expect(page.getByTestId('account')).toContainText('Đăng xuất');
  return uid;
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

export type SeedPerson = {
  name: string;
  gender: 'm' | 'f' | 'u';
  generation?: number;
  fatherId?: string;
  motherId?: string;
  spouses?: Record<string, true>;
  order?: number;
  deceased?: boolean;
  birth?: { cal: 's' | 'l'; d?: number; m?: number; y?: number; leap?: boolean };
  death?: { cal: 's' | 'l'; d?: number; m?: number; y?: number; leap?: boolean };
  note?: string;
};

/** Writes a family straight into the emulator (bypassing rules) and returns its id. */
const EMU_DB = 'http://127.0.0.1:9000';
const NS = 'demo-familytree-default-rtdb';

/** Writes any JSON straight into the emulator database, bypassing the rules. */
export async function seedRaw(path: string, value: unknown) {
  const res = await fetch(`${EMU_DB}/${path}.json?ns=${NS}`, {
    method: 'PUT',
    headers: { Authorization: 'Bearer owner' },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`seed ${path} failed: ${res.status}`);
}

/** Reads JSON straight from the emulator database. */
export async function readRaw(path: string): Promise<unknown> {
  const res = await fetch(`${EMU_DB}/${path}.json?ns=${NS}`, {
    headers: { Authorization: 'Bearer owner' },
  });
  return res.json();
}

export function randomFamilyId(): string {
  return Array.from(
    { length: 20 },
    () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)],
  ).join('');
}

/** Writes a family straight into the emulator (bypassing rules) and returns its id. */
export async function seedFamily(
  name: string,
  people: Record<string, SeedPerson>,
  opts: { admins?: string[] } = {},
) {
  const id = randomFamilyId();
  const admins = Object.fromEntries((opts.admins ?? ['seed']).map((u) => [u, true]));
  await seedRaw(`families/${id}`, {
    meta: { name, owner: opts.admins?.[0] ?? 'seed', createdAt: Date.now() },
    admins,
    people,
  });
  return id;
}

/**
 * A 4-generation family of about 40 people with in-laws, for tree / PDF / calendar tests.
 * Ông Nguyễn Văn Tổ (mất 10/3 âm) + bà Lê Thị Hiền → 3 sons, each with a wife and children…
 */
export function sampleFamily(): Record<string, SeedPerson> {
  const p: Record<string, SeedPerson> = {
    to00000001: {
      name: 'Nguyễn Văn Tổ',
      gender: 'm',
      generation: 1,
      deceased: true,
      birth: { cal: 's', y: 1900 },
      death: { cal: 'l', d: 10, m: 3, y: 1970 },
      spouses: { ba00000001: true },
    },
    ba00000001: {
      name: 'Lê Thị Hiền',
      gender: 'f',
      generation: 1,
      deceased: true,
      death: { cal: 'l', d: 1, m: 1, y: 1980 },
      spouses: { to00000001: true },
    },
  };
  const given = [
    'An',
    'Bình',
    'Cường',
    'Dũng',
    'Hùng',
    'Lan',
    'Mai',
    'Nam',
    'Phúc',
    'Quang',
    'Sơn',
    'Thảo',
  ];
  let n = 0;
  const add = (fatherId: string, motherId: string, gen: number, kids: number) => {
    for (let i = 0; i < kids; i++) {
      const id = `p${String(++n).padStart(9, '0')}`;
      const male = i % 3 !== 2;
      p[id] = {
        name: `Nguyễn ${male ? 'Văn' : 'Thị'} ${given[n % given.length]}`,
        gender: male ? 'm' : 'f',
        generation: gen,
        fatherId,
        motherId,
        order: i + 1,
        birth: { cal: 's', d: (n % 28) + 1, m: (n % 12) + 1, y: 1900 + gen * 25 + i },
      };
      if (male && gen < 4) {
        const wife = `w${String(n).padStart(9, '0')}`;
        p[wife] = {
          name: `Trần Thị ${given[(n + 5) % given.length]}`,
          gender: 'f',
          generation: gen,
          spouses: { [id]: true },
        };
        p[id].spouses = { [wife]: true };
        add(id, wife, gen + 1, gen === 2 ? 3 : 2);
      }
    }
  };
  add('to00000001', 'ba00000001', 2, 3);
  return p;
}
