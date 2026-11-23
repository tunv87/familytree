import { expect, test } from '@playwright/test';
import { createFamily, fillPerson, newDevice, signInAdmin } from './helpers';

test('LG-04 UX-11 admin builds a small family; a relative opens the link and can only view', async ({
  browser,
}) => {
  const admin = await newDevice(browser);
  await signInAdmin(admin, 'truong-ho');
  const fid = await createFamily(admin, 'Họ Nguyễn Văn');

  // thủy tổ, died on 10/3 âm lịch
  await fillPerson(admin, {
    name: 'Nguyễn Văn An',
    birth: [1, 1, 1920],
    death: { d: 10, m: 3, y: 1990 },
  });
  await expect(admin.getByTestId('next-gio')).toBeVisible();
  await expect(admin.getByText('(âm)')).toBeVisible();

  // his wife
  await admin.getByTestId('add-spouse').click();
  await expect(admin.getByText('Vợ/chồng của Nguyễn Văn An')).toBeVisible();
  await expect(admin.getByTestId('gender-f')).toHaveAttribute('aria-pressed', 'true');
  await fillPerson(admin, { name: 'Trần Thị Bình' });

  // their son — the other parent is picked automatically, generation suggested
  await admin.getByTestId('person-' + (await idByName(admin, 'Nguyễn Văn An'))).click();
  await admin.getByTestId('add-child').click();
  await expect(admin.getByTestId('other-parent')).toContainText('Trần Thị Bình');
  await expect(admin.getByTestId('generation')).toHaveValue('2');
  await fillPerson(admin, { name: 'Nguyễn Văn Cường', birth: [15, 8, 1950] });
  await expect(admin.getByText('Cha mẹ')).toBeVisible();
  await expect(admin.getByText('Nguyễn Văn An')).toBeVisible();
  await expect(admin.getByText('Trần Thị Bình')).toBeVisible();

  // invalid lunar date is caught in the form
  await admin.getByTestId('add-child').click();
  await admin.getByTestId('name').fill('Thử');
  await admin.getByTestId('deceased').click();
  await admin.getByTestId('death-d').fill('1');
  await admin.getByTestId('death-m').fill('5');
  await admin.getByTestId('death-y').fill('2025');
  await admin.getByText('Tháng nhuận').click();
  await expect(admin.getByText('Năm 2025 không có tháng 5 nhuận')).toBeVisible();
  // leaving with unsaved changes asks first
  await admin.getByRole('button', { name: 'Quay lại' }).click();
  await admin.getByTestId('confirm-discard').click();

  // list + search without diacritics
  await admin.goto('/#/people');
  await expect(admin.getByText('Đời thứ 1')).toBeVisible();
  await admin.getByTestId('search').fill('cuong');
  await expect(admin.locator('.person-row')).toHaveCount(1);
  await admin.screenshot({ path: 'test-results/screens/people-search.png' });

  // a relative opens the share link on another phone (anonymous)
  const viewer = await newDevice(browser);
  await viewer.goto(`/#/f/${fid}`);
  await expect(viewer.getByRole('heading', { name: 'Họ Nguyễn Văn' })).toBeVisible();
  await expect(viewer.getByTestId('home-people')).toContainText('3 người');
  await viewer.getByTestId('home-people').click();
  await expect(viewer.getByTestId('add-person')).toHaveCount(0);
  await viewer.getByText('Nguyễn Văn Cường').click();
  await expect(viewer.getByTestId('person-name')).toHaveText('Nguyễn Văn Cường');
  await expect(viewer.getByTestId('edit-person')).toHaveCount(0);
  await viewer.screenshot({ path: 'test-results/screens/person-viewer.png' });

  // live update: admin edits, viewer sees it without reloading
  await admin.getByText('Nguyễn Văn Cường').click();
  await admin.getByTestId('edit-person').click();
  await admin.getByTestId('name').fill('Nguyễn Văn Cường (Cả)');
  await admin.getByTestId('save').click();
  await expect(viewer.getByTestId('person-name')).toHaveText('Nguyễn Văn Cường (Cả)');

  // delete removes the person and the links to them
  await admin.getByText('Nguyễn Văn Cường (Cả)').click();
  await admin.getByTestId('delete-person').click();
  await admin.getByTestId('confirm-delete').click();
  await admin.goto('/#/people');
  await expect(admin.locator('.person-row')).toHaveCount(2);
});

test('CR-06 opening a wrong link says so', async ({ browser }) => {
  const page = await newDevice(browser);
  await page.goto('/#/f/AAAAAAAAAAAAAAAAAAAA');
  await expect(page.getByTestId('family-status')).toContainText('Không tìm thấy');
});

async function idByName(page: import('@playwright/test').Page, name: string) {
  await page.goto('/#/people');
  const row = page.locator('.person-row', { hasText: name });
  return ((await row.getAttribute('data-testid')) ?? '').replace('person-', '');
}
