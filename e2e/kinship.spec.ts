import { expect, test, type Page } from '@playwright/test';
import { newDevice, seedFamily, type SeedPerson } from './helpers';

const wed = (id: string) => ({ spouses: { [id]: true as const } });
const P = (name: string, gender: 'm' | 'f', extra: Partial<SeedPerson> = {}): SeedPerson => ({
  name,
  gender,
  ...extra,
});

/** Tôi, with the relatives the family settled the words for (miền Trung — Bình Định). */
const FAMILY: Record<string, SeedPerson> = {
  ongnoi01: P('Ông Nội', 'm', wed('banoi001')),
  banoi001: P('Bà Nội', 'f', wed('ongnoi01')),
  bac00001: P('Bác Hai', 'm', { fatherId: 'ongnoi01', motherId: 'banoi001', order: 1 }),
  bo000001: P('Ba Tôi', 'm', {
    fatherId: 'ongnoi01',
    motherId: 'banoi001',
    order: 2,
    ...wed('me000001'),
  }),
  chu00001: P('Chú Tư', 'm', {
    fatherId: 'ongnoi01',
    motherId: 'banoi001',
    order: 3,
    ...wed('thim0001'),
  }),
  thim0001: P('Thím Tư', 'f', wed('chu00001')),
  co000001: P('Cô Út', 'f', {
    fatherId: 'ongnoi01',
    motherId: 'banoi001',
    order: 4,
    ...wed('duong001'),
  }),
  duong001: P('Dượng Út', 'm', wed('co000001')),
  ongngoai: P('Ông Ngoại', 'm'),
  me000001: P('Má Tôi', 'f', { fatherId: 'ongngoai', order: 1, ...wed('bo000001') }),
  cau00001: P('Cậu Ba', 'm', { fatherId: 'ongngoai', order: 2, ...wed('mo000001') }),
  mo000001: P('Mợ Ba', 'f', wed('cau00001')),
  di000001: P('Dì Tư', 'f', { fatherId: 'ongngoai', order: 3, ...wed('duongdi1') }),
  duongdi1: P('Dượng Tư', 'm', wed('di000001')),
  toi00001: P('Tôi', 'm', {
    fatherId: 'bo000001',
    motherId: 'me000001',
    birth: { cal: 's', y: 1995 },
  }),
  conbac01: P('Con Bác', 'm', { fatherId: 'bac00001', birth: { cal: 's', y: 2001 } }),
  // bên vợ
  bovo0001: P('Ba Vợ', 'm'),
  vo000001: P('Vợ Tôi', 'f', { fatherId: 'bovo0001', order: 1, ...wed('toi00001') }),
  emvo0001: P('Em Gái Vợ', 'f', { fatherId: 'bovo0001', order: 2 }),
};

async function openPerson(page: Page, id: string) {
  await page.goto(`/#/p/${id}`);
  await expect(page.getByTestId('person-name')).toHaveText(FAMILY[id].name);
}

async function callOf(page: Page, id: string) {
  await openPerson(page, id);
  return (await page.getByTestId('kinship-call').innerText()).replace(/\s+/g, ' ').trim();
}

test('LG-13 a relative picks "this is me" and sees how to call everyone (Bình Định)', async ({
  browser,
}) => {
  const fid = await seedFamily('Họ Võ (Bình Định)', FAMILY);
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-people')).toBeVisible();

  // before choosing: a hint and the button
  await openPerson(page, 'toi00001');
  await expect(page.getByTestId('kinship')).toContainText('Đây là tôi');
  await page.getByTestId('set-me').click();
  await expect(page.getByTestId('kinship')).toContainText('Đây là bạn');

  // the four pairs the family settled on, both "gọi" and "xưng"
  expect(await callOf(page, 'co000001')).toBe('Bạn gọi là cô · xưng cháu');
  expect(await callOf(page, 'duong001')).toBe('Bạn gọi là dượng · xưng cháu');
  expect(await callOf(page, 'di000001')).toBe('Bạn gọi là dì · xưng cháu');
  expect(await callOf(page, 'duongdi1')).toBe('Bạn gọi là dượng · xưng cháu');
  expect(await callOf(page, 'chu00001')).toBe('Bạn gọi là chú · xưng cháu');
  expect(await callOf(page, 'thim0001')).toBe('Bạn gọi là thím · xưng cháu');
  expect(await callOf(page, 'cau00001')).toBe('Bạn gọi là cậu · xưng cháu');
  expect(await callOf(page, 'mo000001')).toBe('Bạn gọi là mợ · xưng cháu');
  await expect(page.getByTestId('kinship-relation')).toHaveText('vợ của cậu');
  // and a few more
  expect(await callOf(page, 'bac00001')).toBe('Bạn gọi là bác · xưng cháu');
  expect(await callOf(page, 'bo000001')).toBe('Bạn gọi là ba · xưng con');
  expect(await callOf(page, 'ongnoi01')).toBe('Bạn gọi là ông nội · xưng cháu');
  // vai beats age: the son of bác is younger but still anh
  expect(await callOf(page, 'conbac01')).toBe('Bạn gọi là anh · xưng em');
  // gia đình duyệt: em của vợ gọi thay con là cô
  expect(await callOf(page, 'emvo0001')).toBe('Bạn gọi là cô · xưng anh');

  // remembered after a reload
  await page.reload();
  expect(await callOf(page, 'co000001')).toBe('Bạn gọi là cô · xưng cháu');

  // miền Bắc changes the words where the regions differ
  await page.goto('/#/settings');
  await page.getByTestId('region-bac').click();
  expect(await callOf(page, 'duong001')).toBe('Bạn gọi là chú · xưng cháu');
  expect(await callOf(page, 'bo000001')).toBe('Bạn gọi là bố · xưng con');
  await page.goto('/#/settings');
  await page.getByTestId('region-trung').click();

  // "Gọi nhau thế nào": both directions and the path through the family
  await openPerson(page, 'chu00001');
  await page.getByTestId('how-to-call').click();
  await expect(page.getByTestId('kin-a-calls-b')).toHaveText('Tôi gọi Chú Tư là chú, xưng cháu');
  await expect(page.getByTestId('kin-b-calls-a')).toHaveText('Chú Tư gọi Tôi là cháu, xưng chú');
  await expect(page.getByTestId('kin-path').getByRole('button')).toHaveText([
    'Tôi',
    'Ba Tôi',
    'Ông Nội',
    'Chú Tư',
  ]);
  // pick two other people
  await page.getByTestId('kin-a').selectOption({ label: 'Thím Tư (đời 2)' });
  await page.getByTestId('kin-b').selectOption({ label: 'Con Bác (đời 3)' });
  await expect(page.getByTestId('kin-result')).toBeVisible();
  // tapping a name on the path opens that person
  await page.getByTestId('kin-path').getByRole('button', { name: 'Ông Nội' }).click();
  await expect(page.getByTestId('person-name')).toHaveText('Ông Nội');

  // settings shows who I am and lets me undo it
  await page.goto('/#/settings');
  await expect(page.getByTestId('me-row')).toContainText('Tôi');
  await page.getByTestId('settings-unset-me').click();
  await expect(page.getByTestId('me-row')).toHaveCount(0);
  await openPerson(page, 'co000001');
  await expect(page.getByTestId('set-me')).toBeVisible();
});
