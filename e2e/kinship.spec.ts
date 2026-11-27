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
  // em vợ: gọi "em"; "gọi thay con" is only a note (gia đình sửa 27/11)
  expect(await callOf(page, 'emvo0001')).toBe('Bạn gọi là em · xưng anh');
  await expect(page.getByTestId('kinship-child-call')).toHaveText(
    'Trước mặt con cháu có thể gọi là dì',
  );
  // relations read in the Trung words: ba / má, not bố / mẹ
  await openPerson(page, 'co000001');
  await expect(page.getByTestId('kinship-relation')).toHaveText('em gái của ba');
  await expect(page.getByTestId('kinship-child-call')).toHaveCount(0);

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
  // the other way round is worked out on its own, not mirrored: ông nội says "ông"
  await page.getByTestId('kin-b').selectOption({ label: 'Ông Nội (đời 1)' });
  await expect(page.getByTestId('kin-a-calls-b')).toHaveText(
    'Tôi gọi Ông Nội là ông nội, xưng cháu',
  );
  await expect(page.getByTestId('kin-b-calls-a')).toHaveText('Ông Nội gọi Tôi là cháu, xưng ông');
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

test('LG-17 tree cards: giỗ line for those who passed away, labels once "this is me" is chosen', async ({
  browser,
}) => {
  const fid = await seedFamily('Họ Nguyễn (cây)', {
    thanh001: {
      name: 'Nguyễn Thị Thanh',
      gender: 'f',
      deceased: true,
      birth: { cal: 's', y: 1935 },
      death: { cal: 'l', d: 20, m: 8, y: 2022 },
    },
    thanhb01: {
      name: 'Nguyễn Văn Thành',
      gender: 'm',
      motherId: 'thanh001',
      birth: { cal: 's', y: 1960 },
      place: 'Hoài Nhơn',
    },
    tu000001: {
      name: 'Nguyễn Văn Tự',
      gender: 'm',
      fatherId: 'thanhb01',
      order: 1,
      birth: { cal: 's', y: 1987 },
    },
    lap00001: { name: 'Nguyễn Thị Lập', gender: 'f', fatherId: 'thanhb01', order: 2 },
    tra00001: { name: 'Nguyễn Thị Hải Trà', gender: 'f', spouses: { tu000001: true } },
  });
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-people')).toBeVisible();

  // no "this is me" yet: names only, no labels
  await page.goto('/#/tree');
  const card = (id: string) => page.getByTestId(`card-${id}`);
  await expect(card('thanh001')).toContainText('(1935–2022), 20/8 ÂL');
  await expect(card('thanh001')).toHaveClass(/dead/);
  await expect(card('thanhb01')).toContainText('1960 · Hoài Nhơn');
  await expect(card('thanhb01')).not.toContainText('Sinh');
  await expect(page.locator('[data-testid^="badge-"]')).toHaveCount(0);

  // "this is me" → every card says what I call them
  await page.goto('/#/p/tu000001');
  await page.getByTestId('set-me').click();
  await page.goto('/#/tree');
  await expect(page.getByTestId('badge-tu000001')).toHaveText('Bạn');
  await expect(page.getByTestId('badge-thanhb01')).toHaveText('Ba');
  await expect(page.getByTestId('badge-thanh001')).toHaveText('Bà nội');
  await expect(page.getByTestId('badge-lap00001')).toHaveText('Em gái');
  await expect(card('tu000001')).toHaveClass(/\bme\b/);
  // a label sits on the top edge of its card, never over the name
  for (const id of ['thanhb01', 'thanh001', 'lap00001']) {
    const b = (await page.getByTestId(`badge-${id}`).boundingBox())!;
    const c = (await card(id).locator('> rect').boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(c.y + 4);
  }

  // the wife (found on the real family, 27/11): her husband's younger sister is "Em chồng",
  // called "em" — "cô" is only how she may call her in front of the children
  await page.goto('/#/settings');
  await page.getByTestId('settings-unset-me').click();
  await page.goto('/#/p/tra00001');
  await page.getByTestId('set-me').click();
  await page.goto('/#/tree');
  await expect(page.getByTestId('badge-lap00001')).toHaveText('Em chồng');
  await expect(page.getByTestId('badge-thanhb01')).toHaveText('Ba');
  await page.goto('/#/p/lap00001');
  await expect(page.getByTestId('kinship-call')).toHaveText(/gọi là em · xưng chị/);
  await expect(page.getByTestId('kinship-child-call')).toHaveText(
    'Trước mặt con cháu có thể gọi là cô',
  );
});
