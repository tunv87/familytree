import { expect, test } from '@playwright/test';
import { newDevice, sampleFamily, seedFamily } from './helpers';

test('calendar shows lunar days, Tết, giỗ from the family, and converts dates', async ({
  browser,
}) => {
  // ông Tổ died 10/3 âm (1970); bà died mùng 1 Tết (1980)
  const fid = await seedFamily('Họ Nguyễn', sampleFamily());
  const page = await newDevice(browser);
  await page.clock.setFixedTime(new Date('2027-01-20T09:00:00+07:00'));
  await page.goto(`/#/f/${fid}`);
  await page.getByTestId('home-calendar').click();

  await expect(page.getByTestId('month-title')).toHaveText('Tháng 1, 2027');
  // 20/1/2027 = 13 tháng Chạp Bính Ngọ
  await expect(page.getByTestId('day-detail')).toContainText('13 tháng Chạp năm Bính Ngọ');

  // coming up within 30 days: bà's giỗ on mùng 1 Tết (6/2/2027), the 47th
  await expect(page.getByTestId('event-gio-ba00000001')).toContainText('Giỗ lần thứ 47 · 6/2');

  await page.getByTestId('next-month').click();
  await expect(page.getByTestId('month-title')).toHaveText('Tháng 2, 2027');
  const tet = page.getByTestId('day-6');
  await expect(tet).toHaveClass(/h-tet/);
  await expect(tet).toContainText('1/1');
  await tet.click();
  await expect(page.getByTestId('day-detail')).toContainText('mùng 1 tháng Giêng năm Đinh Mùi');
  await expect(page.getByTestId('day-detail')).toContainText('Lê Thị Hiền');
  await page.screenshot({ path: 'test-results/screens/calendar-tet.png', fullPage: true });

  // ông Tổ's giỗ 10/3 âm 2027 = 16/4/2027
  for (let i = 0; i < 2; i++) await page.getByTestId('next-month').click();
  await expect(page.getByTestId('month-title')).toHaveText('Tháng 4, 2027');
  await page.getByTestId('day-16').click();
  await expect(page.getByTestId('event-gio-to00000001')).toContainText('Giỗ lần thứ 57');
  await page.getByTestId('event-gio-to00000001').click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Tổ');
  await page.goBack();

  // converter: 15/8 âm 2026 = 25/9/2026
  await page.getByTestId('convert-d').fill('15');
  await page.getByTestId('convert-m').fill('8');
  await page.getByTestId('convert-y').fill('2026');
  await expect(page.getByText('= 25/9/2026')).toBeVisible();
  await page.getByTestId('convert-s').click();
  await page.getByTestId('convert-d').fill('25');
  await page.getByTestId('convert-m').fill('9');
  await expect(page.getByText('= rằm tháng Tám năm Bính Ngọ')).toBeVisible();
});

test('calendar works before any family is opened', async ({ browser }) => {
  const page = await newDevice(browser);
  await page.goto('/#/calendar');
  await expect(page.getByTestId('cal-grid')).toBeVisible();
  await expect(page.getByTestId('day-detail')).toContainText('tháng');
});
