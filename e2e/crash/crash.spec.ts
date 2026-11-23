/** Crash / robustness: the app must never show a blank page or throw, whatever happens. */
import { expect, test, type Page } from '@playwright/test';
import {
  createFamily,
  fillPerson,
  newDevice,
  pageErrors,
  randomFamilyId,
  readRaw,
  sampleFamily,
  seedFamily,
  seedRaw,
  signInAdmin,
  type SeedPerson,
} from '../helpers';

const SCREENS = ['/', '/people', '/tree', '/calendar', '/invite', '/families', '/settings'];

async function expectAlive(page: Page, where: string) {
  await expect.soft(page.getByTestId('crash'), `${where}: crash screen shown`).toHaveCount(0);
  const text = await page.evaluate(() => document.body.innerText.trim().length);
  expect.soft(text, `${where}: blank page`).toBeGreaterThan(0);
}

/** cuts / restores the app's Firebase connection (Chromium's offline mode can keep an open socket) */
async function setNetwork(page: Page, on: boolean) {
  await page.evaluate(
    (v) => (window as unknown as { __testNetwork: (on: boolean) => void }).__testNetwork(v),
    on,
  );
}

/** small seeded PRNG so a failing monkey run can be replayed */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

async function monkey(page: Page, steps: number, seed: number) {
  const rand = rng(seed);
  const log: string[] = [];
  for (let i = 0; i < steps; i++) {
    if (rand() < 0.08) {
      const hash = SCREENS[Math.floor(rand() * SCREENS.length)];
      log.push(`goto ${hash}`);
      await page.goto(`/#${hash}`);
      continue;
    }
    // close dialogs from time to time
    if (rand() < 0.1) await page.keyboard.press('Escape');
    const targets = await page
      .locator(
        // not: Google sign-in (opens a popup), sign-out (would end the admin run), the OS share sheet
        'button:visible:enabled:not([data-testid="sign-in-google"]):not([data-testid="share"]):not(:text-is("Đăng xuất")), input:visible:enabled, select:visible:enabled, textarea:visible:enabled, [data-testid^="card-"]:visible, [data-testid^="toggle-"]:visible',
      )
      .all();
    if (targets.length === 0) {
      await page.goto('/#/');
      continue;
    }
    const el = targets[Math.floor(rand() * targets.length)];
    const tag = await el
      .evaluate((e) => `${e.tagName}:${(e as HTMLInputElement).type ?? ''}`)
      .catch(() => '');
    try {
      if (
        tag.startsWith('INPUT:text') ||
        tag.startsWith('INPUT:search') ||
        tag === 'TEXTAREA:textarea'
      ) {
        const junk = ['', 'Nguyễn', '<b>x</b>', '9999', '😀'.repeat(5), 'a'.repeat(120)][
          Math.floor(rand() * 6)
        ];
        log.push(`fill ${junk.slice(0, 10)}`);
        await el.fill(junk, { timeout: 800 });
      } else if (tag.startsWith('SELECT')) {
        const n = await el.locator('option').count();
        if (n) await el.selectOption({ index: Math.floor(rand() * n) }, { timeout: 800 });
        log.push('select');
      } else {
        log.push(
          `click ${(await el.getAttribute('data-testid')) ?? (await el.textContent())?.slice(0, 15)}`,
        );
        await el.click({ timeout: 800 });
      }
    } catch {
      // element went away between listing and acting — fine
    }
    if (await page.getByTestId('crash').count()) {
      throw new Error(`crash screen after: ${log.slice(-8).join(' → ')}`);
    }
  }
  return log;
}

test('CR-01 monkey test: 200 random actions as a viewer and as an admin', async ({ browser }) => {
  test.setTimeout(600_000);
  const viewer = await newDevice(browser);
  const fid = await seedFamily('Họ Ngẫu Nhiên', sampleFamily());
  await viewer.goto(`/#/f/${fid}`);
  await expect(viewer.getByTestId('home-tree')).toBeVisible();
  await monkey(viewer, 200, 20261123);
  expect(pageErrors(viewer), 'CR-01 viewer: uncaught errors').toEqual([]);

  const admin = await newDevice(browser);
  const uid = await signInAdmin(admin, 'monkey');
  const fid2 = await seedFamily('Họ Ngẫu Nhiên 2', sampleFamily(), { admins: [uid] });
  await admin.goto(`/#/f/${fid2}`);
  await expect(admin.getByTestId('home-tree')).toBeVisible();
  // don't sign out halfway (it would just turn this into the viewer run)
  await monkey(admin, 200, 7);
  expect(pageErrors(admin), 'CR-01 admin: uncaught errors').toEqual([]);
});

test('CR-02 damaged data in the database never crashes a screen', async ({ browser }) => {
  const people = {
    ok00000001: { name: 'Người Bình Thường', gender: 'm', spouses: { self000001: true } },
    noname0001: { gender: 'm', generation: 2, fatherId: 'ok00000001' },
    numname001: { name: 12345, gender: 'x', generation: 'hai' },
    ghost00001: {
      name: 'Cha Không Tồn Tại',
      gender: 'f',
      fatherId: 'khong-co',
      motherId: 'cung-khong',
    },
    loopa00001: { name: 'Vòng A', gender: 'm', fatherId: 'loopb00001' },
    loopb00001: { name: 'Vòng B', gender: 'm', fatherId: 'loopa00001' },
    self000001: {
      name: 'Tự Lấy Mình',
      gender: 'f',
      spouses: { self000001: true, ok00000001: true },
    },
    baddate001: {
      name: 'Ngày Sai',
      gender: 'm',
      deceased: true,
      birth: { cal: 's', d: 45, m: 13, y: -5 },
      death: { cal: 'l', d: 31, m: 0, y: 99999 },
    },
    nocal00001: { name: 'Thiếu Lịch', gender: 'f', death: { d: 1, m: 1 }, deceased: true },
    nullish001: { name: 'Rỗng', gender: 'm', spouses: null, birth: null },
    junk000001: 5,
    junk000002: 'chỉ là chữ',
  };
  const cases: [string, unknown][] = [
    [
      'broken people',
      { meta: { name: 'Họ Dữ Liệu Hỏng', owner: 'x', createdAt: 1 }, admins: { x: true }, people },
    ],
    [
      'people is a list',
      {
        meta: { name: 'Họ Mảng', owner: 'x', createdAt: 1 },
        admins: { x: true },
        people: [people.ok00000001],
      },
    ],
    ['no meta', { admins: { x: true }, people }],
    ['meta without name', { meta: { owner: 'x' }, admins: { x: true }, people: 'chuỗi' }],
  ];
  const page = await newDevice(browser);
  for (const [label, data] of cases) {
    const fid = randomFamilyId();
    await seedRaw(`families/${fid}`, data);
    await page.goto(`/#/f/${fid}`);
    await page.waitForTimeout(400);
    for (const hash of [
      ...SCREENS,
      '/p/ok00000001',
      '/p/self000001',
      '/p/loopa00001',
      '/p/baddate001',
      '/p/noname0001',
      '/relations/loopa00001',
      '/tree?root=loopa00001',
    ]) {
      await page.goto(`/#${hash}`);
      await page.waitForTimeout(150);
      await expectAlive(page, `CR-02 ${label} ${hash}`);
    }
  }
  expect(pageErrors(page), 'CR-02 uncaught errors').toEqual([]);
});

test('CR-03 a 1,000-person family: tree, list, calendar and PDF still work', async ({
  browser,
}) => {
  test.setTimeout(240_000);
  const people: Record<string, SeedPerson> = {
    r000000001: { name: 'Đỗ Văn Tổ', gender: 'm', generation: 1, spouses: { w000000001: true } },
    w000000001: { name: 'Bà Tổ', gender: 'f', generation: 1, spouses: { r000000001: true } },
  };
  let n = 0;
  const queue: [string, string, number][] = [['r000000001', 'w000000001', 1]];
  while (queue.length && n < 998) {
    const [f, m, gen] = queue.shift()!;
    for (let i = 0; i < 3 && n < 998; i++) {
      const c = `c${String(++n).padStart(9, '0')}`;
      people[c] = {
        name: `Đỗ Văn Cháu ${n}`,
        gender: 'm',
        generation: gen + 1,
        fatherId: f,
        motherId: m,
        order: i + 1,
        deceased: n % 4 === 0,
        death: n % 4 === 0 ? { cal: 'l', d: (n % 29) + 1, m: (n % 12) + 1, y: 1990 } : undefined,
        birth: { cal: 's', d: (n % 28) + 1, m: (n % 12) + 1, y: 1900 + gen * 20 },
      };
      if (n < 998) {
        const w = `w${String(++n).padStart(9, '0')}`;
        people[w] = { name: `Vợ ${n}`, gender: 'f', generation: gen + 1, spouses: { [c]: true } };
        people[c].spouses = { [w]: true };
        queue.push([c, w, gen + 1]);
      }
    }
  }
  const total = Object.keys(people).length;
  const fid = await seedFamily('Họ Đỗ', people);
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-people')).toContainText(`${total} người`);
  const t = Date.now();
  await page.getByTestId('home-tree').click();
  await expect(page.locator('[data-testid^="card-"]')).toHaveCount(total, { timeout: 15_000 });
  const treeMs = Date.now() - t;
  await page.goto('/#/people');
  await page.getByTestId('search').fill('chau 777');
  await expect(page.locator('.person-row')).toHaveCount(1);
  await page.goto('/#/calendar');
  await expect(page.getByTestId('cal-grid')).toBeVisible();
  await page.goto('/#/tree');
  await page.getByTestId('print').click();
  await page.getByTestId('mode-one').click();
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 120_000 }),
    page.getByTestId('make-pdf').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  test
    .info()
    .annotations.push({ type: 'timings (ms)', description: JSON.stringify({ total, treeMs }) });
  expect.soft(treeMs, `CR-03 1,000-person tree drawn in ${treeMs}ms`).toBeLessThan(5000);
  expect(pageErrors(page)).toEqual([]);
});

test('CR-04 losing the connection while saving never leaves the form stuck', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  await signInAdmin(page, 'cr04');
  const fid = await createFamily(page, 'Họ Mất Mạng');
  await fillPerson(page, { name: 'Người Có Mạng' });
  await page.getByTestId('add-child').click();
  await page.getByTestId('name').fill('Người Lúc Mất Mạng');
  await setNetwork(page, false);
  await page.getByTestId('save').click();
  // within 10 s the user gets an answer: saved (queued) or a clear error — not an endless spinner
  await expect
    .poll(
      async () =>
        (await page.getByTestId('person-name').count()) > 0 ||
        (await page.getByTestId('form-error').count()) > 0,
      { timeout: 10_000, message: 'CR-04 no answer 10 s after pressing Save offline' },
    )
    .toBe(true);
  // the user is told the change is kept on the phone for now
  if (await page.getByTestId('person-name').count())
    await expect(page.getByTestId('toast')).toContainText('Đã lưu trên máy');
  await setNetwork(page, true);
  // once back online the person reaches the server
  await expect
    .poll(
      async () =>
        Object.values(
          ((await readRaw(`families/${fid}/people`)) ?? {}) as Record<string, { name: string }>,
        ).some((p) => p.name === 'Người Lúc Mất Mạng'),
      { timeout: 20_000, message: 'CR-04 queued save reaches the server after reconnecting' },
    )
    .toBe(true);
  expect(pageErrors(page)).toEqual([]);
});

test('CR-05 broken or blocked local storage', async ({ browser }) => {
  const fid = await seedFamily('Họ Bộ Nhớ', sampleFamily());
  // corrupt saved data
  const ctx = await browser.newContext();
  await ctx.addInitScript((id) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('ft:family', '{not json');
    localStorage.setItem('ft:settings', '"bigText"');
    localStorage.setItem(`ft:cache:${id}`, JSON.stringify({ family: { people: 5 } }));
    localStorage.setItem('ft:recent', 'null');
  }, fid);
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expectAlive(page, 'CR-05 corrupt storage');
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByRole('heading', { name: 'Họ Bộ Nhớ' })).toBeVisible();
  for (const hash of SCREENS) {
    await page.goto(`/#${hash}`);
    await expectAlive(page, `CR-05 corrupt storage ${hash}`);
  }
  // storage that throws (Safari private mode, blocked cookies)
  const ctx2 = await browser.newContext();
  await ctx2.addInitScript(() => {
    const boom = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    Storage.prototype.getItem = boom;
    Storage.prototype.setItem = boom;
  });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', (e) => errors.push(e.message));
  await p2.goto(`/#/f/${fid}`);
  await expect(p2.getByRole('heading', { name: 'Họ Bộ Nhớ' })).toBeVisible();
  await p2.getByTestId('home-tree').click();
  await expect(p2.getByTestId('tree-svg')).toBeVisible();
  expect(errors, 'CR-05 uncaught errors').toEqual([]);
});

test('CR-06 odd addresses: unknown route, missing person, malformed family code', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  for (const hash of [
    '/khong-co-trang-nay',
    '/p/',
    '/edit/khong-co',
    '/relations/khong-co',
    '/f/abc',
    '/f/%3Cscript%3E',
    '/tree?root=khong-co&focus=khong-co',
    '/add?parent=khong-co&spouse=x&child=y',
  ]) {
    await page.goto(`/#${hash}`);
    await page.waitForTimeout(250);
    await expectAlive(page, `CR-06 ${hash}`);
  }
  expect(pageErrors(page)).toEqual([]);
});

test('CR-08 if a screen crashes, a friendly page appears and Home recovers', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  await page.goto('/#/__crash');
  await expect(page.getByTestId('crash')).toContainText('Có lỗi xảy ra');
  await page.getByRole('button', { name: /Trang chủ/ }).click();
  await expect(page.getByTestId('home-new-family')).toBeVisible();
  // the crash is recorded in the error log
  await page.goto('/#/debug');
  await expect(page.locator('.log-view')).toContainText('intentional test crash');
});
