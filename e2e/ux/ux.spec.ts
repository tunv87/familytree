/** UX — the app should feel instant, forgiving and never leave the user stuck. */
import { expect, test, type Page } from '@playwright/test';
import {
  createFamily,
  fillPerson,
  newDevice,
  readRaw,
  sampleFamily,
  seedFamily,
  signInAdmin,
} from '../helpers';

async function openSeeded(page: Page, admins?: string[]) {
  const fid = await seedFamily('Họ Nguyễn', sampleFamily(), admins ? { admins } : {});
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-tree')).toBeVisible();
  return fid;
}

/** ms from a click until `target` is visible */
async function timeTo(page: Page, click: () => Promise<void>, target: string) {
  const t0 = Date.now();
  await click();
  await page.locator(target).first().waitFor({ state: 'visible' });
  return Date.now() - t0;
}

test('UX-01 screens open within 500 ms and buttons react when pressed', async ({ browser }) => {
  const page = await newDevice(browser);
  await openSeeded(page);
  // warm up once (first visit compiles modules on the dev server)
  for (const [card, target] of [
    ['home-people', '.person-row'],
    ['home-tree', '[data-testid="tree-svg"]'],
    ['home-calendar', '[data-testid="cal-grid"]'],
    ['home-invite', '[data-testid="qr"] svg'],
  ] as const) {
    await page.getByTestId(card).click();
    await page.locator(target).first().waitFor();
    await page.goBack();
  }
  const timings: Record<string, number> = {};
  for (const [card, target] of [
    ['home-people', '.person-row'],
    ['home-tree', '[data-testid="tree-svg"]'],
    ['home-calendar', '[data-testid="cal-grid"]'],
    ['home-invite', '[data-testid="qr"] svg'],
  ] as const) {
    timings[card] = await timeTo(page, () => page.getByTestId(card).click(), target);
    await page.goBack();
    await expect(page.getByTestId('home-tree')).toBeVisible();
  }
  test.info().annotations.push({ type: 'timings (ms)', description: JSON.stringify(timings) });
  for (const [k, ms] of Object.entries(timings))
    expect.soft(ms, `UX-01 opening ${k} took ${ms}ms`).toBeLessThan(500);

  // pressed buttons move down (visible feedback the instant the finger touches)
  const btn = page.getByTestId('home-people');
  const box = (await btn.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const transform = await btn.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.up();
  expect(transform, 'UX-01 a pressed card shows feedback').not.toBe('none');
});

test('UX-02 no dead ends: every screen has a way back, browser Back works', async ({ browser }) => {
  const page = await newDevice(browser);
  await openSeeded(page);
  for (const hash of [
    '/people',
    '/p/to00000001',
    '/tree',
    '/calendar',
    '/invite',
    '/settings',
    '/debug',
    '/families',
    '/new-family',
    '/relations/to00000001',
    '/add?parent=to00000001',
    '/p/does-not-exist',
  ]) {
    await page.goto(`/#${hash}`);
    await expect
      .soft(page.getByRole('button', { name: 'Quay lại' }), `UX-02 ${hash} has a Back button`)
      .toBeVisible();
  }
  // Back through history
  await page.goto('/#/');
  await page.getByTestId('home-people').click();
  await page.locator('.person-row', { hasText: 'Nguyễn Văn Tổ' }).click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Tổ');
  await page.goBack();
  await expect(page.getByTestId('search')).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId('home-tree')).toBeVisible();
  // the in-app Back button also returns
  await page.getByTestId('home-calendar').click();
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByTestId('home-tree')).toBeVisible();
});

test('UX-03 double-tapping Save or Create does not make duplicates', async ({ browser }) => {
  const page = await newDevice(browser);
  await signInAdmin(page, 'ux03');
  await page.goto('/#/new-family');
  await page.getByTestId('family-name').fill('Họ Bấm Đúp');
  await page.getByTestId('create-family').dblclick();
  await expect(page.getByTestId('name')).toBeVisible();
  const fid = await page.evaluate(() => JSON.parse(localStorage.getItem('ft:family')!).id);
  await page.getByTestId('name').fill('Người Bấm Đúp');
  await page.getByTestId('save').dblclick();
  await expect(page.getByTestId('person-name')).toHaveText('Người Bấm Đúp');
  const people = (await readRaw(`families/${fid}/people`)) as Record<string, unknown>;
  expect(Object.keys(people ?? {}), 'UX-03 one person saved').toHaveLength(1);
  // families created by this admin
  await page.goto('/#/families');
  await expect(page.locator('.card', { hasText: 'Họ Bấm Đúp' })).toHaveCount(1);
});

test('UX-04 destructive actions always ask first', async ({ browser }) => {
  const page = await newDevice(browser);
  await signInAdmin(page, 'ux04');
  await createFamily(page, 'Họ Hỏi Trước');
  await fillPerson(page, { name: 'Người Một' });
  // delete person → confirm dialog; cancelling keeps the person
  await page.getByTestId('delete-person').click();
  await expect(page.getByTestId('confirm-delete')).toBeVisible();
  await page.getByRole('button', { name: 'Huỷ' }).click();
  await expect(page.getByTestId('person-name')).toHaveText('Người Một');
  // leaving an edited form → confirm
  await page.getByTestId('edit-person').click();
  await page.getByTestId('name').fill('Người Một (sửa)');
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByTestId('confirm-discard')).toBeVisible();
  await page.getByTestId('keep-editing').click();
  await expect(page.getByTestId('name')).toHaveValue('Người Một (sửa)');
  // closing a family on this device → confirm
  await page.goto('/#/families');
  await page.getByRole('button', { name: /Đóng gia phả/ }).click();
  await expect(
    page.getByTestId('confirm-close-family'),
    'UX-04 closing a family asks first',
  ).toBeVisible();
});

test('UX-05 forms: focus, inline errors, keep what was typed, Enter saves', async ({ browser }) => {
  const page = await newDevice(browser);
  await signInAdmin(page, 'ux05');
  await createFamily(page, 'Họ Biểu Mẫu');
  // the name box is focused straight away
  await expect(page.getByTestId('name')).toBeFocused();
  // saving with no name: error shown, focus goes back to the name box
  await page.getByTestId('save').click();
  await expect(page.getByTestId('form-error')).toBeVisible();
  await expect(page.getByTestId('form-error')).toBeInViewport();
  await expect(page.getByTestId('name'), 'UX-05 name box focused after error').toBeFocused();
  // an impossible date: inline error, nothing lost
  await page.getByTestId('name').fill('Ông Thử');
  await page.getByTestId('birth-d').fill('31');
  await page.getByTestId('birth-m').fill('2');
  await page.getByTestId('birth-y').fill('1950');
  await expect(page.getByTestId('birth')).toContainText('Ngày này không có trong lịch');
  await page.getByTestId('save').click();
  await expect(page.getByTestId('name')).toHaveValue('Ông Thử');
  await expect(page.getByTestId('birth-d')).toHaveValue('31');
  // fix the date and press Enter in the name box to save
  await page.getByTestId('birth-d').fill('28');
  await page.getByTestId('name').press('Enter');
  await expect(page.getByTestId('person-name')).toHaveText('Ông Thử');
});

test('UX-06 tree gestures: pinch zooms around the fingers, limits, fit, big toggle targets', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  await openSeeded(page);
  await page.goto('/#/tree?focus=to00000001');
  const pz = page.getByTestId('panzoom');
  await expect(pz).toHaveAttribute('data-scale', '1.000');
  const scale = async () => Number(await pz.getAttribute('data-scale'));

  // two-finger pinch out around a card: the card stays under the fingers
  const card = page.getByTestId('card-to00000001');
  const c0 = (await card.boundingBox())!;
  const cx = c0.x + c0.width / 2;
  const cy = c0.y + c0.height / 2;
  await pz.evaluate(
    async (el, [x, y]) => {
      const fire = (type: string, id: number, px: number) =>
        el.dispatchEvent(
          new PointerEvent(type, { pointerId: id, clientX: px, clientY: y, bubbles: true }),
        );
      fire('pointerdown', 1, x - 30);
      fire('pointerdown', 2, x + 30);
      for (let i = 1; i <= 10; i++) {
        fire('pointermove', 1, x - 30 - i * 6);
        fire('pointermove', 2, x + 30 + i * 6);
        await new Promise((r) => requestAnimationFrame(r));
      }
      fire('pointerup', 1, x - 90);
      fire('pointerup', 2, x + 90);
    },
    [cx, cy],
  );
  expect(await scale(), 'UX-06 pinch out zooms in').toBeGreaterThan(1.5);
  const c1 = (await card.boundingBox())!;
  expect(
    Math.abs(c1.x + c1.width / 2 - cx),
    'UX-06 zoom keeps the point under the fingers',
  ).toBeLessThan(15);

  // zoom limits
  for (let i = 0; i < 15; i++) await page.getByRole('button', { name: 'Phóng to' }).click();
  expect(await scale()).toBeLessThanOrEqual(3);
  for (let i = 0; i < 25; i++) await page.getByRole('button', { name: 'Thu nhỏ' }).click();
  expect(await scale()).toBeGreaterThanOrEqual(0.08);
  // fit brings the whole tree back into view
  await page.getByTestId('fit').click();
  const svg = (await page.getByTestId('tree-svg').boundingBox())!;
  const box = (await pz.boundingBox())!;
  expect(svg.width).toBeLessThanOrEqual(box.width + 1);
  expect(svg.x).toBeGreaterThanOrEqual(box.x - 1);

  // the +/− branch toggle is big enough to hit with a finger at normal zoom
  // open the tree the way a user does from a profile, so it starts at normal zoom
  await page.goto('/#/p/to00000001');
  await page.getByTestId('show-on-tree').click();
  await expect(page.getByTestId('panzoom')).toHaveAttribute('data-scale', '1.000');
  const toggle = (await page.getByTestId('toggle-to00000001').boundingBox())!;
  expect(
    Math.min(toggle.width, toggle.height),
    'UX-06 branch toggle hit area ≥ 44px',
  ).toBeGreaterThanOrEqual(44);
});

test('UX-07 deep links keep working after a reload', async ({ browser }) => {
  const page = await newDevice(browser);
  const fid = await openSeeded(page);
  await page.goto('/#/p/to00000001');
  await page.reload();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Tổ');
  await page.goto('/#/tree?focus=ba00000001');
  await page.reload();
  await expect(page.getByTestId('card-ba00000001')).toHaveClass(/focus/);
  // a share link opened on a brand-new phone
  const other = await newDevice(browser);
  await other.goto(`/#/f/${fid}`);
  await expect(other.getByRole('heading', { name: 'Họ Nguyễn' })).toBeVisible();
});

test('UX-09 empty, missing and offline states explain themselves', async ({ browser }) => {
  const page = await newDevice(browser);
  await signInAdmin(page, 'ux09');
  await createFamily(page, 'Họ Trống');
  await page.goto('/#/people');
  await expect(page.getByText('Gia phả chưa có ai.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Thêm thủy tổ/ })).toBeVisible();
  await page.goto('/#/tree');
  await expect(page.getByText('Gia phả chưa có ai.')).toBeVisible();
  await page.goto('/#/p/khong-co');
  await expect(page.getByText('Không tìm thấy người này.')).toBeVisible();
  await page.goto('/#/f/AAAAAAAAAAAAAAAAAAAA');
  await expect(page.getByTestId('family-status')).toContainText('Không tìm thấy');
  await page.goto('/#/tree');
  await expect(page.getByTestId('family-status')).toContainText('Không tìm thấy');
});

test('UX-10 icon-only buttons have names; keyboard users can reach and see focus', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  await openSeeded(page);
  const unnamed: string[] = [];
  for (const hash of [
    '/',
    '/people',
    '/p/to00000001',
    '/tree',
    '/calendar',
    '/invite',
    '/settings',
  ]) {
    await page.goto(`/#${hash}`);
    await page.waitForTimeout(200);
    unnamed.push(
      ...(await page.evaluate(() =>
        [...document.querySelectorAll('button')]
          .filter((b) => !/\p{L}|\p{N}/u.test(b.textContent ?? '') && !b.getAttribute('aria-label'))
          .map((b) => `${location.hash} ${b.outerHTML.slice(0, 80)}`),
      )),
    );
  }
  expect(unnamed, 'UX-10 icon buttons without a name').toEqual([]);
  await page.goto('/#/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { tag: el.tagName, outline: s.outlineStyle, width: s.outlineWidth, shadow: s.boxShadow };
  });
  expect(focus.tag).toBe('BUTTON');
  expect(
    focus.outline !== 'none' && focus.width !== '0px',
    `UX-10 focused button is visibly marked (${JSON.stringify(focus)})`,
  ).toBe(true);
});

test('UX-13 ← goes to the parent screen, 🏠 to the home page (mock: H2, P2)', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  const uid = await signInAdmin(page, 'ux13');
  const fid = await seedFamily('Họ Nguyễn', sampleFamily(), { admins: [uid] });
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-tree')).toBeVisible();
  const back = () => page.getByTestId('nav-back').click();
  const home = () => page.getByTestId('nav-home').click();

  // 🏠 on every screen but the home page; none on the home page itself
  await expect(page.getByTestId('nav-home')).toHaveCount(0);
  for (const hash of [
    '/people',
    '/p/to00000001',
    '/tree',
    '/calendar',
    '/invite',
    '/settings',
    '/edit/to00000001',
  ]) {
    await page.goto(`/#${hash}`);
    await expect.soft(page.getByTestId('nav-home'), `UX-13 ${hash} has 🏠`).toBeVisible();
  }
  await home();
  await expect(page.getByTestId('home-tree')).toBeVisible();

  // a deep link (e.g. opened from Zalo): ← goes to its parent, never out of the app
  await page.goto('/#/p/p000000001');
  await page.reload();
  await expect(page.getByTestId('person-name')).toBeVisible();
  await back();
  await expect(page.getByTestId('search')).toBeVisible(); // Danh sách
  await back();
  await expect(page.getByTestId('home-tree')).toBeVisible();

  // edit → save goes to the profile; ← from there goes to the list, not back into the form
  await page.goto('/#/p/p000000001');
  await page.getByTestId('edit-person').click();
  await page.getByTestId('place').fill('Huế');
  await page.getByTestId('save').click();
  await expect(page.getByTestId('person-place')).toContainText('Huế');
  await back();
  await expect(page.getByTestId('search')).toBeVisible();

  // from the tree: profile ← returns to the tree, centred on that person (P2)
  await page.goto('/#/tree');
  await page.getByTestId('card-p000000001').click();
  await expect(page.getByTestId('person-name')).toBeVisible();
  await back();
  await expect(page).toHaveURL(/#\/tree\?focus=p000000001/);
  await expect(page.getByTestId('card-p000000001')).toHaveClass(/focus/);

  // from the calendar: back to the calendar
  await page.goto('/#/calendar');
  const event = page.locator('[data-testid^="event-"]').first();
  await event.click();
  await expect(page.getByTestId('person-name')).toBeVisible();
  await back();
  await expect(page).toHaveURL(/#\/calendar/);

  // deeper screens: settings → debug ← settings; 🏠 from anywhere
  await page.goto('/#/debug');
  await back();
  await expect(page).toHaveURL(/#\/settings$/);
  await page.goto('/#/relations/p000000001');
  await home();
  await expect(page.getByTestId('home-tree')).toBeVisible();
});
