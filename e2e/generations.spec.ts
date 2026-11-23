import { expect, test, type Page } from '@playwright/test';
import { fillPerson, newDevice, seedFamily, signInAdmin } from './helpers';

/** The section heading of the people list a person is under, e.g. "Đời thứ 2". */
async function sectionOf(page: Page, name: string) {
  return page
    .locator('section.list', { has: page.locator('.person-row', { hasText: name }) })
    .locator('.section-title')
    .innerText();
}

test('LG-14 "đời thứ" is worked out from the tree and follows changes by itself', async ({
  browser,
}) => {
  const admin = await newDevice(browser);
  const uid = await signInAdmin(admin, 'gen-admin');
  // no generation numbers stored anywhere: everything is computed
  const fid = await seedFamily(
    'Họ Lê',
    {
      an000001: { name: 'Lê Văn An', gender: 'm', spouses: { binh0001: true } },
      binh0001: { name: 'Phạm Thị Bình', gender: 'f', spouses: { an000001: true } },
      cuong001: { name: 'Lê Văn Cường', gender: 'm', fatherId: 'an000001', motherId: 'binh0001' },
      giang001: { name: 'Lê Văn Giang', gender: 'm', fatherId: 'cuong001' },
      lac00001: { name: 'Người Lạc', gender: 'u' },
    },
    { admins: [uid] },
  );
  await admin.goto(`/#/f/${fid}`);
  await expect(admin.getByTestId('home-people')).toBeVisible();

  await admin.goto('/#/people');
  expect(await sectionOf(admin, 'Lê Văn An')).toBe('Đời thứ 1');
  expect(await sectionOf(admin, 'Phạm Thị Bình')).toBe('Đời thứ 1'); // wife: same as husband
  expect(await sectionOf(admin, 'Lê Văn Giang')).toBe('Đời thứ 3');
  expect(await sectionOf(admin, 'Người Lạc')).toBe('Chưa nối vào cây');

  // the elders remember An's father: add him above — everyone moves down by itself
  await admin.locator('.person-row', { hasText: 'Lê Văn An' }).click();
  await admin.getByTestId('add-father').click();
  await expect(admin.getByTestId('generation')).toHaveCount(0); // nothing to type
  await fillPerson(admin, { name: 'Lê Văn Tổ' });
  await expect(admin.getByText('Đời thứ 1')).toBeVisible();
  await admin.goto('/#/people');
  expect(await sectionOf(admin, 'Lê Văn Tổ')).toBe('Đời thứ 1');
  expect(await sectionOf(admin, 'Lê Văn An')).toBe('Đời thứ 2');
  expect(await sectionOf(admin, 'Lê Văn Giang')).toBe('Đời thứ 4');

  // this is a branch of a bigger clan: its top is the 8th generation
  await admin.goto('/#/invite');
  await expect(admin.getByTestId('top-generation')).toHaveValue('1');
  await admin.getByTestId('top-generation').fill('8');
  await admin.getByTestId('save-top-generation').click();
  await expect(admin.getByTestId('save-top-generation')).toHaveText('✓');
  await admin.goto('/#/people');
  expect(await sectionOf(admin, 'Lê Văn Tổ')).toBe('Đời thứ 8');
  expect(await sectionOf(admin, 'Lê Văn Giang')).toBe('Đời thứ 11');
  await admin.locator('.person-row', { hasText: 'Lê Văn Cường' }).click();
  await expect(admin.getByText('Đời thứ 10')).toBeVisible();
});

test('LG-14 older families keep the numbers they typed in', async ({ browser }) => {
  const admin = await newDevice(browser);
  const uid = await signInAdmin(admin, 'gen-legacy');
  const fid = await seedFamily(
    'Họ Đỗ (cũ)',
    {
      ong00001: { name: 'Đỗ Văn Ông', gender: 'm', generation: 5 },
      con00001: { name: 'Đỗ Văn Con', gender: 'm', generation: 6, fatherId: 'ong00001' },
    },
    { admins: [uid] },
  );
  await admin.goto(`/#/f/${fid}`);
  await expect(admin.getByTestId('home-people')).toBeVisible();
  await admin.goto('/#/people');
  expect(await sectionOf(admin, 'Đỗ Văn Ông')).toBe('Đời thứ 5');
  expect(await sectionOf(admin, 'Đỗ Văn Con')).toBe('Đời thứ 6');
});
