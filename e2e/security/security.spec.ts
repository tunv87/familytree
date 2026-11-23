/** Security checks that need a browser (database rules are tested in tests-rules/). */
import { expect, test } from '@playwright/test';
import {
  createFamily,
  fillPerson,
  newDevice,
  pageErrors,
  sampleFamily,
  seedFamily,
  signInAdmin,
} from '../helpers';

const PAYLOADS = [
  '<img src=x onerror="window.__xss=1">',
  '<script>window.__xss=2</script>',
  '"><svg onload="window.__xss=3">',
  'javascript:window.__xss=4//',
  '{{constructor.constructor("window.__xss=5")()}}',
];

test('SEC-02 names and notes with HTML/JS are shown as text, never run', async ({ browser }) => {
  const people = sampleFamily();
  PAYLOADS.forEach((p, i) => {
    people[`xss0000000${i}`] = {
      name: p.slice(0, 100),
      gender: 'm',
      generation: 2,
      fatherId: 'to00000001',
      note: p,
      deceased: true,
      death: { cal: 'l', d: 1, m: 1, y: 2000 },
    };
  });
  const fid = await seedFamily(PAYLOADS[0], people);
  const page = await newDevice(browser);
  await page.clock.setFixedTime(new Date('2027-01-20T09:00:00+07:00'));
  await page.goto(`/#/f/${fid}`);
  for (const hash of [
    '/',
    '/people',
    '/p/xss00000000',
    '/p/xss00000001',
    '/p/xss00000002',
    '/tree',
    '/calendar',
    '/invite',
    '/families',
  ]) {
    await page.goto(`/#${hash}`);
    await page.waitForTimeout(250);
  }
  // the payload text is displayed literally
  await page.goto('/#/p/xss00000000');
  await expect(page.getByTestId('person-name')).toHaveText(PAYLOADS[0]);
  // and is in the PDF without running anything
  await page.goto('/#/tree');
  await page.getByTestId('print').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('make-pdf').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^gia-pha-[a-z0-9-]+\.pdf$/);
  expect(
    await page.evaluate(() => (window as unknown as { __xss?: number }).__xss),
  ).toBeUndefined();
  expect(pageErrors(page)).toEqual([]);
});

test('SEC-02 typing HTML into the forms stores and shows it as text', async ({ browser }) => {
  const page = await newDevice(browser);
  await signInAdmin(page, 'sec02');
  await createFamily(page, '<b>Họ</b> <img src=x onerror=window.__xss=9>');
  await fillPerson(page, { name: '<img src=x onerror="window.__xss=10">' });
  await page.goto('/');
  await expect(page.getByRole('heading').first()).toContainText('<b>Họ</b>');
  expect(
    await page.evaluate(() => (window as unknown as { __xss?: number }).__xss),
  ).toBeUndefined();
});

test('SEC-05 signing out removes editing at once; viewers cannot create a family', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  const uid = await signInAdmin(page, 'sec05');
  const fid = await seedFamily('Họ Phiên', sampleFamily(), { admins: [uid] });
  await page.goto(`/#/f/${fid}`);
  await page.goto('/#/p/to00000001');
  await expect(page.getByTestId('edit-person')).toBeVisible();
  await page.goto('/#/settings');
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page.getByTestId('sign-in-google')).toBeVisible();
  await page.goto('/#/p/to00000001');
  await expect(page.getByTestId('person-name')).toBeVisible();
  await expect(page.getByTestId('edit-person')).toHaveCount(0);
  await page.goto('/#/add?parent=to00000001');
  await expect(page.getByText('Chỉ quản trị mới sửa được')).toBeVisible();
  await page.goto('/#/new-family');
  await expect(page.getByText('Cần đăng nhập Google')).toBeVisible();
  await expect(page.getByTestId('create-family')).toHaveCount(0);
});

test('SEC-03 share links reveal only that family and are not guessable', async ({ browser }) => {
  const page = await newDevice(browser);
  const fid = await seedFamily('Họ Riêng', sampleFamily());
  await page.goto(`/#/f/${fid}`);
  await page.goto('/#/invite');
  const url = (await page.getByTestId('share-url').textContent())!;
  expect(url).toMatch(/#\/f\/[A-Za-z0-9]{20}$/);
  // nothing else (uid, admin list, other families) leaks into the link
  expect(url).not.toMatch(/uid|admin|seed/i);
});
