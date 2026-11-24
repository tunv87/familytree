/**
 * Đợt 1 (UX for relatives aged 60+): giỗ reminders in the phone calendar + Zalo message,
 * the first-open guide, labels under icon buttons, "Sắp tới" on Home, and Hoàn tác.
 */
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { newDevice, pageErrors, sampleFamily, seedFamily, signInAdmin } from './helpers';

// two weeks before ông Tổ's giỗ: 10/3 ÂL 2027 = Thứ Sáu 16/4/2027
const DAY = new Date('2027-04-01T09:00:00+07:00');

async function openFamily(page: Page, fid: string) {
  await page.clock.setFixedTime(DAY);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-tree')).toBeVisible();
}

test('LG-18 giỗ go into the phone calendar, reminding 3 days and 1 day before', async ({
  browser,
}) => {
  const fid = await seedFamily('Họ Nguyễn', sampleFamily());
  const page = await newDevice(browser);
  await openFamily(page, fid);
  await page.getByTestId('home-calendar').click();
  await expect(page.getByTestId('add-to-calendar')).toHaveText(
    '📅 Thêm ngày giỗ của 2 người vào lịch',
  );
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('add-to-calendar').click(),
  ]);
  expect(download.suggestedFilename()).toBe('ngay-gio-ho-nguyen.ics');
  const ics = readFileSync(await download.path(), 'utf8').replace(/\r\n /g, '');
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(20); // 2 people × 10 years
  expect(ics).toContain('SUMMARY:Giỗ ông Nguyễn Văn Tổ (10/3 ÂL)');
  expect(ics).toContain('DTSTART;VALUE=DATE:20270416');
  expect(ics.match(/TRIGGER:-P2DT16H/g)).toHaveLength(20);
  expect(ics.match(/TRIGGER:-PT16H/g)).toHaveLength(20);
  await expect(page.getByText('Đã tạo file lịch')).toBeVisible();
  expect(pageErrors(page)).toEqual([]);
});

test('LG-18 "Nhắn cả nhà": a ready message to paste in Zalo', async ({ browser }) => {
  const fid = await seedFamily('Họ Nguyễn', sampleFamily());
  const page = await newDevice(browser);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await openFamily(page, fid);
  await page.goto('/#/calendar');
  await page.getByTestId('message-to00000001').click();
  const text = page.getByTestId('message-text');
  await expect(text).toHaveValue(/^🕯️ Giỗ ông Nguyễn Văn Tổ\n/);
  await expect(text).toHaveValue(/Ngày 10\/3 âm lịch, tức Thứ Sáu 16\/4\/2027\./);
  await expect(text).toHaveValue(new RegExp(`Xem gia phả: .*#/f/${fid}`));
  // the message can be changed before sending
  await text.fill('Giỗ ông nội, nhớ về nhé');
  await page.getByTestId('message-copy').click();
  await expect(page.getByText('Đã chép tin nhắn')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Giỗ ông nội, nhớ về nhé');
});

test('UX-16 "Sắp tới" on Home: up to 3 giỗ/birthdays in the next 30 days', async ({ browser }) => {
  const fid = await seedFamily('Họ Nguyễn', sampleFamily());
  const page = await newDevice(browser);
  await openFamily(page, fid);
  const rows = page.locator('.upcoming-row');
  expect(await rows.count()).toBeGreaterThan(0);
  expect(await rows.count()).toBeLessThanOrEqual(3);
  const gio = page.getByTestId('upcoming-gio-to00000001');
  await expect(gio).toContainText('Giỗ Nguyễn Văn Tổ');
  await expect(gio).toContainText('Thứ Sáu 16/4 · 10/3 ÂL');
  await expect(gio).toContainText('15 ngày');
  await gio.click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Tổ');
  await page.goBack();
  await page.getByTestId('upcoming-more').click();
  await expect(page.getByTestId('cal-grid')).toBeVisible();

  // nothing within 30 days → no section at all
  await page.clock.setFixedTime(new Date('2027-07-01T09:00:00+07:00'));
  const quiet = await seedFamily('Họ Vắng', {
    a: { name: 'Trần Văn A', gender: 'm', deceased: true, death: { cal: 'l', d: 1, m: 1 } },
  });
  await page.goto(`/#/f/${quiet}`);
  await expect(page.getByTestId('home-tree')).toBeVisible();
  await expect(page.getByTestId('upcoming')).toHaveCount(0);
});

test('UX-17 Hoàn tác for 10 seconds after deleting a person or saving an edit', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  const uid = await signInAdmin(page, 'undo');
  const fid = await seedFamily('Họ Hoàn Tác', sampleFamily(), { admins: [uid] });
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-people')).toBeVisible();
  const before = (await page.getByTestId('home-people').textContent())!;

  // delete ông Bình (he has a father, a wife and children), then undo
  await page.goto('/#/p/p000000001');
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Bình');
  await page.getByTestId('delete-person').click();
  await page.getByTestId('confirm-delete').click();
  await expect(page.getByText('Đã xoá Nguyễn Văn Bình khỏi gia phả')).toBeVisible();
  await page.getByTestId('toast-action').click();
  await expect(page.getByText('Đã khôi phục Nguyễn Văn Bình')).toBeVisible();
  await page.goto('/#/');
  await expect(page.getByTestId('home-people')).toHaveText(before);
  // the links came back too: he is ông Tổ's son again
  await page.goto('/#/p/to00000001');
  await expect(page.locator('main').getByText('Nguyễn Văn Bình')).toBeVisible();

  // edit a name, then undo
  await page.goto('/#/p/p000000001');
  await page.getByTestId('edit-person').click();
  await page.getByTestId('name').fill('Nguyễn Văn Bình Sửa Nhầm');
  await page.getByTestId('save').click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Bình Sửa Nhầm');
  await expect(page.getByText('Đã lưu thay đổi')).toBeVisible();
  await page.getByTestId('toast-action').click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Bình');

  // the undo button goes away by itself after 10 seconds
  await page.getByTestId('edit-person').click();
  await page.getByTestId('name').fill('Nguyễn Văn Bình');
  await page.getByTestId('save').click();
  await expect(page.getByTestId('toast-action')).toBeVisible();
  await expect(page.getByTestId('toast-action')).toHaveCount(0, { timeout: 13_000 });
  expect(pageErrors(page)).toEqual([]);
});

test('UX-15 icon buttons at the top always have a word under them', async ({ browser }) => {
  const fid = await seedFamily('Họ Nguyễn', sampleFamily());
  const page = await newDevice(browser);
  await openFamily(page, fid);
  const label = (sel: string) =>
    page
      .locator(sel)
      .first()
      .evaluate((el) => getComputedStyle(el, '::after').content);
  expect(await label('.topbar .icon-btn[aria-label="Cài đặt"]')).toBe('"Cài đặt"');
  expect(await label('.topbar .icon-btn[data-label="Gia phả"]')).toBe('"Gia phả"');
  await page.getByTestId('home-tree').click();
  expect(await label('[data-testid="nav-home"]')).not.toBe('none');
  expect(await label('.topbar .icon-btn[data-label="Tìm"]')).toBe('"Tìm"');
  expect(await label('.topbar .icon-btn[data-label="In"]')).toBe('"In"');
  // every label fits on screen
  for (const btn of await page.locator('.topbar .icon-btn').all()) {
    const box = await btn.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
});

test('UX-14 first open of a link: 3 steps, each with "Để sau", shown once', async ({ browser }) => {
  const fid = await seedFamily('Họ Nguyễn', sampleFamily());
  const page = await newDevice(browser, { onboarded: false });
  await page.goto(`/#/f/${fid}`);
  const guide = page.getByTestId('onboarding');
  await expect(guide).toContainText('Bước 1/3');
  await expect(guide.getByRole('heading', { name: 'Họ Nguyễn' })).toBeVisible();
  await expect(guide).toContainText('Chỉ xem, không sửa được. Không cần tài khoản.');
  await expect(guide).toContainText('4 đời');
  await page.screenshot({ path: 'test-results/screens/onboarding-1.png' });
  await page.getByTestId('onb-next').click();

  // step 2: find yourself without typing accents
  await expect(guide).toContainText('Bạn là ai trong gia phả?');
  await page.getByTestId('onb-search').fill('binh');
  const me = page.getByTestId('onb-pick-p000000001');
  await expect(me).toContainText('con ông Nguyễn Văn Tổ');
  await page.screenshot({ path: 'test-results/screens/onboarding-2.png' });
  await me.click();

  // step 3: Add to Home Screen; iPhone steps on an iPhone
  await expect(guide).toContainText('Bước 3/3');
  await expect(page.getByTestId('onb-ios')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('onb-install-steps')).toContainText('Thêm vào MH chính');
  await page.getByTestId('onb-android').click();
  await expect(page.getByTestId('onb-install-steps')).toContainText('Thêm vào màn hình chính');
  await page.screenshot({ path: 'test-results/screens/onboarding-3.png' });
  await page.getByTestId('onb-done').click();
  await expect(page.getByTestId('home-tree')).toBeVisible();

  // "Bạn là ai" was remembered: profiles say how to address people
  await page.goto('/#/p/to00000001');
  await expect(page.getByTestId('kinship-call')).toBeVisible();
  // not shown again, even when the link is opened again
  await page.goto(`/#/f/${fid}`);
  await page.reload();
  await expect(page.getByTestId('home-tree')).toBeVisible();
  await expect(page.getByTestId('onboarding')).toHaveCount(0);

  // "Để sau" on the first step skips the whole guide, for good
  const later = await newDevice(browser, { onboarded: false });
  await later.goto(`/#/f/${fid}`);
  await later.getByTestId('onb-later').click();
  await expect(later.getByTestId('home-tree')).toBeVisible();
  await later.reload();
  await expect(later.getByTestId('home-tree')).toBeVisible();
  await expect(later.getByTestId('onboarding')).toHaveCount(0);
  expect(pageErrors(page)).toEqual([]);
});
