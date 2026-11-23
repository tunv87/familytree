import { expect, test } from '@playwright/test';
import {
  createFamily,
  fillPerson,
  newDevice,
  sampleFamily,
  seedFamily,
  signInAdmin,
} from './helpers';

test('LG-12 invite screen shows a QR code and the link a relative can open', async ({
  browser,
}) => {
  const fid = await seedFamily('Họ Trần', sampleFamily());
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await page.getByTestId('home-invite').click();
  await expect(page.getByTestId('qr').locator('svg')).toBeVisible();
  const url = (await page.getByTestId('share-url').textContent())!;
  expect(url).toMatch(new RegExp(`#/f/${fid}$`));
  await page.screenshot({ path: 'test-results/screens/invite.png' });

  // another phone opens the link and remembers the family
  const other = await newDevice(browser);
  await other.goto(url.replace(/^https?:\/\/[^/]+/, ''));
  await expect(other.getByRole('heading', { name: 'Họ Trần' })).toBeVisible();
  await other.goto('/#/families');
  await expect(other.getByTestId(`family-${fid}`)).toContainText('Họ Trần');
  // a viewer can't rename
  await other.goto('/#/invite');
  await expect(other.getByTestId('rename-input')).toHaveCount(0);
});

test('LG-12 admin renames the family; it shows everywhere', async ({ browser }) => {
  const admin = await newDevice(browser);
  await signInAdmin(admin, 'rename-admin');
  await createFamily(admin, 'Họ Lê');
  await fillPerson(admin, { name: 'Lê Văn Một' });
  await admin.goto('/#/invite');
  await admin.getByTestId('rename-input').fill('Họ Lê — chi trưởng');
  await admin.getByTestId('rename').click();
  await expect(admin.getByTestId('rename')).toHaveText('✓');
  await admin.goto('/');
  await expect(admin.getByRole('heading', { name: 'Họ Lê — chi trưởng' })).toBeVisible();
  await admin.goto('/#/families');
  await expect(admin.locator('.card', { hasText: 'Họ Lê — chi trưởng' })).toBeVisible();
});

test('LG-12 closing a family forgets it on this device', async ({ browser }) => {
  const fid = await seedFamily('Họ Phạm', sampleFamily());
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByRole('heading', { name: 'Họ Phạm' })).toBeVisible();
  await page.goto('/#/families');
  await page.getByRole('button', { name: /Đóng gia phả/ }).click();
  await page.getByTestId('confirm-close-family').click();
  await expect(page.getByTestId('home-new-family')).toBeVisible();
  await page.goto('/#/families');
  await expect(page.getByTestId(`family-${fid}`)).toHaveCount(0);
});
