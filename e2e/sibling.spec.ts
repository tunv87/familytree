/** "Thêm anh/chị/em" (LG-19, mock S1 + N1, 27/11/2026). */
import { expect, test, type Page } from '@playwright/test';
import { newDevice, pageErrors, seedFamily, signInAdmin } from './helpers';

const FAMILY = {
  thanh001: {
    name: 'Nguyễn Văn Thành',
    gender: 'm' as const,
    spouses: { thuan001: true as const },
  },
  thuan001: {
    name: 'Nguyễn Thị Thanh Thuần',
    gender: 'f' as const,
    spouses: { thanh001: true as const },
  },
  tu000001: {
    name: 'Nguyễn Văn Tự',
    gender: 'm' as const,
    fatherId: 'thanh001',
    motherId: 'thuan001',
    order: 1,
    spouses: { tra00001: true as const },
  },
  lap00001: {
    name: 'Nguyễn Thị Lập',
    gender: 'f' as const,
    fatherId: 'thanh001',
    motherId: 'thuan001',
    order: 2,
  },
  tra00001: {
    name: 'Nguyễn Thị Hải Trà',
    gender: 'f' as const,
    spouses: { tu000001: true as const },
  },
};

async function childrenOfThanh(page: Page) {
  await page.goto('/#/p/thanh001');
  const section = page.locator('section.list', { hasText: 'Con' });
  return (await section.locator('.person-row .name').allInnerTexts()).map((s) => s.trim());
}

test('LG-19 add a brother or sister: Anh/Chị/Em, same parents, right birth order', async ({
  browser,
}) => {
  const page = await newDevice(browser);
  const uid = await signInAdmin(page, 'sibling');
  const fid = await seedFamily('Họ Nguyễn (anh chị em)', FAMILY, { admins: [uid] });
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-people')).toBeVisible();

  // em trai of Lập
  await page.goto('/#/p/lap00001');
  await page.getByTestId('add-sibling').click();
  await expect(page.getByTestId('form-context')).toContainText('Anh/chị/em của Nguyễn Thị Lập');
  await expect(page.getByTestId('form-context')).toContainText(
    'con của Nguyễn Văn Thành và Nguyễn Thị Thanh Thuần',
  );
  await expect(page.getByTestId('gender-m')).toHaveCount(0); // the 4 choices replace it
  await expect(page.getByTestId('order')).toHaveCount(0);
  await page.getByTestId('name').fill('Nguyễn Văn Hùng');
  await page.getByTestId('save').click();
  await expect(page.getByTestId('sib-error')).toHaveText('Chọn Anh, Chị, Em trai hoặc Em gái');
  await page.getByTestId('sib-emTrai').click();
  await expect(page.getByTestId('sib-order-hint')).toHaveText('➜ Xếp sau Lập trong thứ tự con');
  await page.screenshot({ path: 'test-results/screens/add-sibling.png' });
  await page.getByTestId('save').click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Hùng');
  expect(await childrenOfThanh(page)).toEqual([
    'Nguyễn Văn Tự',
    'Nguyễn Thị Lập',
    'Nguyễn Văn Hùng',
  ]);

  // anh of Lập: goes between Tự and Lập
  await page.goto('/#/p/lap00001');
  await page.getByTestId('add-sibling').click();
  await page.getByTestId('sib-anh').click();
  await expect(page.getByTestId('sib-order-hint')).toHaveText('➜ Xếp trước Lập trong thứ tự con');
  await page.getByTestId('name').fill('Nguyễn Văn Nam');
  await page.getByTestId('save').click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Nam');
  expect(await childrenOfThanh(page)).toEqual([
    'Nguyễn Văn Tự',
    'Nguyễn Văn Nam',
    'Nguyễn Thị Lập',
    'Nguyễn Văn Hùng',
  ]);

  // xưng hô follows at once: Lập calls Nam "anh", Hùng "em"
  await page.goto('/#/p/lap00001');
  await page.getByTestId('set-me').click();
  await page.goto('/#/people');
  await page.locator('.person-row', { hasText: 'Nguyễn Văn Nam' }).click();
  await expect(page.getByTestId('kinship-call')).toHaveText(/gọi là anh · xưng em/);
  await page.goto('/#/people');
  await page.locator('.person-row', { hasText: 'Nguyễn Văn Hùng' }).click();
  await expect(page.getByTestId('kinship-call')).toHaveText(/gọi là em · xưng chị/);

  // someone with no parents in the tree: adding the parents first is offered, not required
  await page.goto('/#/p/tra00001');
  await page.getByTestId('add-sibling').click();
  await expect(page.getByRole('dialog')).toContainText('Chưa có ba má của Nguyễn Thị Hải Trà');
  await expect(page.getByTestId('sib-add-father')).toBeVisible();
  await page.waitForTimeout(400); // let the dialog finish appearing
  await page.screenshot({ path: 'test-results/screens/add-sibling-no-parents.png' });
  await page.getByTestId('sib-add-direct').click();
  await expect(page.getByTestId('form-context')).toHaveText('Anh/chị/em của Nguyễn Thị Hải Trà');
  await page.getByTestId('sib-emTrai').click();
  await page.getByTestId('name').fill('Nguyễn Hải Phong');
  await page.getByTestId('save').click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Hải Phong');
  // linked straight to her: listed as her brother, and xưng hô follows from her
  await page.goto('/#/p/tra00001');
  await expect(page.locator('section.list', { hasText: 'Anh chị em' })).toContainText(
    'Nguyễn Hải Phong',
  );
  await page.goto('/#/settings');
  await page.getByTestId('settings-unset-me').click();
  await page.goto('/#/p/tu000001');
  await page.getByTestId('set-me').click();
  await page.goto('/#/people');
  await page.locator('.person-row', { hasText: 'Nguyễn Hải Phong' }).click();
  await expect(page.getByTestId('kinship-call')).toHaveText(/gọi là em · xưng anh/);
  await expect(page.getByTestId('kinship-relation')).toHaveText('em trai ruột (bên vợ)');
  await expect(page.getByTestId('kinship-child-call')).toHaveText(
    'Trước mặt con cháu có thể gọi là cậu',
  );
  expect(pageErrors(page)).toEqual([]);
});

test('LG-19 viewers do not see "Thêm anh/chị/em"', async ({ browser }) => {
  const fid = await seedFamily('Họ Nguyễn (xem)', FAMILY);
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-people')).toBeVisible();
  await page.goto('/#/p/lap00001');
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Thị Lập');
  await expect(page.getByTestId('add-sibling')).toHaveCount(0);
});
