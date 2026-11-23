import { expect, test } from '@playwright/test';
import {
  createFamily,
  fillPerson,
  newDevice,
  sampleFamily,
  seedFamily,
  signInAdmin,
} from './helpers';

test('LG-04 admin fixes a wrong parent and links two existing people as spouses', async ({
  browser,
}) => {
  const admin = await newDevice(browser);
  await signInAdmin(admin, 'relink-admin');
  await createFamily(admin, 'Họ Vũ');
  await fillPerson(admin, { name: 'Vũ Văn Ông' });
  await admin.getByTestId('add-child').click();
  await fillPerson(admin, { name: 'Vũ Văn Con' });
  // a woman entered on her own (no links yet)
  await admin.goto('/#/add');
  await fillPerson(admin, { name: 'Đỗ Thị Dâu', gender: 'f' });

  // link her to Vũ Văn Con as his wife
  await admin.goto('/#/people');
  await admin.locator('.person-row', { hasText: 'Vũ Văn Con' }).click();
  await admin.getByTestId('edit-relations').click();
  await admin.getByTestId('rel-add-spouse').selectOption({ label: 'Đỗ Thị Dâu' });
  await admin.getByTestId('rel-add-spouse-btn').click();
  // and remove the father (entered by mistake)
  await admin.getByTestId('rel-father').selectOption('');
  await admin.getByTestId('save-relations').click();
  await expect(admin.getByTestId('person-name')).toHaveText('Vũ Văn Con');
  await expect(admin.locator('section', { hasText: 'Vợ / chồng' })).toContainText('Đỗ Thị Dâu');
  await expect(admin.locator('section', { hasText: 'Cha mẹ' })).toHaveCount(0);

  // the wife's page shows the husband too (both sides linked)
  await admin.locator('.person-row', { hasText: 'Đỗ Thị Dâu' }).click();
  await expect(admin.locator('section', { hasText: 'Vợ / chồng' })).toContainText('Vũ Văn Con');

  // a person can't be made their own ancestor
  await admin.goto('/#/people');
  await admin.locator('.person-row', { hasText: 'Vũ Văn Ông' }).click();
  await admin.getByTestId('edit-relations').click();
  await expect(
    admin.getByTestId('rel-father').locator('option', { hasText: 'Vũ Văn Ông' }),
  ).toHaveCount(0);
});

test('UX-09 works offline: the last-seen family opens without a connection', async ({
  browser,
}) => {
  const fid = await seedFamily('Họ Đặng', sampleFamily());
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByRole('heading', { name: 'Họ Đặng' })).toBeVisible();
  await page.getByTestId('home-people').click();
  await expect(page.locator('.person-row').first()).toBeVisible();

  // cut Firebase off completely, then reopen the app
  await page.routeWebSocket(/:9000/, (ws) => ws.close());
  await page.route(/:(9000|9099)\//, (r) => r.abort());
  await page.goto('/');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Họ Đặng' })).toBeVisible();
  await expect(page.getByText('Không có mạng')).toBeVisible();
  await page.getByTestId('home-tree').click();
  await expect(page.getByTestId('card-to00000001')).toBeVisible();
  await page.goto('/#/p/to00000001');
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Tổ');
});

test('UX-01 a 300-person family stays fast', async ({ browser }) => {
  const people: Record<string, Parameters<typeof seedFamily>[1][string]> = {};
  let n = 0;
  const grow = (id: string, gen: number) => {
    if (gen > 6 || n >= 300) return;
    const kids = gen < 3 ? 4 : 3;
    for (let i = 0; i < kids && n < 300; i++) {
      const c = `c${String(++n).padStart(9, '0')}`;
      people[c] = {
        name: `Phan Văn Người ${n}`,
        gender: 'm',
        generation: gen + 1,
        fatherId: id,
        order: i + 1,
      };
      grow(c, gen + 1);
    }
  };
  people.root00000001 = { name: 'Phan Văn Tổ', gender: 'm', generation: 1 };
  grow('root00000001', 1);
  const total = Object.keys(people).length;
  const fid = await seedFamily('Họ Phan', people);
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-people')).toContainText(`${total} người`);
  const t0 = Date.now();
  await page.getByTestId('home-tree').click();
  await expect(page.locator('[data-testid^="card-"]')).toHaveCount(total);
  expect(Date.now() - t0).toBeLessThan(3000);
  await page.goto('/#/people');
  await page.getByTestId('search').fill('nguoi 299');
  await expect(page.locator('.person-row')).toHaveCount(1);
});
