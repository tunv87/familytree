import { describe, expect, it } from 'vitest';
import { kinship } from '../data/kinship';
import type { People } from '../data/people';
import type { Person } from '../data/types';
import { randomFamily } from '../test/randomFamily';
import { cardSubtitle, fit, kinBadge } from './card';
import { CARD_W, PHOTO_CARD_W } from './layout';

const P = (name: string, gender: Person['gender'], extra: Partial<Person> = {}): Person => ({
  name,
  gender,
  ...extra,
});

describe('LG-17 dòng phụ trên ô cây (mock: đã mất D3, còn sống bỏ chữ "Sinh")', () => {
  it('passed away: "(1960–2022), 20/8 ÂL" — years and the lunar giỗ date', () => {
    const p = P('Nguyễn Văn A', 'm', {
      deceased: true,
      birth: { cal: 's', y: 1960 },
      death: { cal: 'l', d: 20, m: 8, y: 2022 },
    });
    expect(cardSubtitle(p, PHOTO_CARD_W)).toBe('(1960–2022), 20/8 ÂL');
  });

  it('a solar death date is turned into the lunar giỗ date', () => {
    // 10/3 âm năm 2022 = 10/4/2022 dương
    const p = P('B', 'f', { deceased: true, death: { cal: 's', d: 10, m: 4, y: 2022 } });
    expect(cardSubtitle(p, PHOTO_CARD_W)).toBe('(?–2022), 10/3 ÂL');
  });

  it('shows whatever is known', () => {
    expect(cardSubtitle(P('C', 'm', { deceased: true }), PHOTO_CARD_W)).toBe('Đã mất');
    expect(
      cardSubtitle(P('D', 'm', { deceased: true, death: { cal: 'l', d: 1, m: 9 } }), PHOTO_CARD_W),
    ).toBe('1/9 ÂL');
    expect(
      cardSubtitle(P('E', 'm', { deceased: true, birth: { cal: 's', y: 1900 } }), PHOTO_CARD_W),
    ).toBe('(1900–?)');
  });

  it('living: birth year and where they live, no "Sinh"', () => {
    const p = P('F', 'm', { birth: { cal: 's', y: 1987 }, place: 'Đà Nẵng' });
    expect(cardSubtitle(p, PHOTO_CARD_W)).toBe('1987 · Đà Nẵng');
    expect(cardSubtitle(P('G', 'f', { place: 'Huế' }), PHOTO_CARD_W)).toBe('Huế');
    expect(cardSubtitle(P('H', 'f', { birth: { cal: 's', y: 2018 } }), PHOTO_CARD_W)).toBe('2018');
    expect(cardSubtitle(P('I', 'f'), PHOTO_CARD_W)).toBe('');
  });

  it('long lines are cut with "…" to fit the card', () => {
    const p = P('J', 'm', {
      birth: { cal: 's', y: 1987 },
      place: 'Thành phố Hồ Chí Minh, Việt Nam',
    });
    const small = cardSubtitle(p, PHOTO_CARD_W);
    expect([...small].length).toBeLessThanOrEqual(20);
    expect(small.endsWith('…')).toBe(true);
    expect([...cardSubtitle(p, CARD_W)].length).toBeLessThanOrEqual(24);
    expect(fit('ngắn', 10)).toBe('ngắn');
  });
});

describe('LG-17 nhãn danh xưng (K1)', () => {
  // Tự (viewer) — from the family's own tree
  const F: People = {
    thanh: P('Nguyễn Thị Thanh', 'f', { deceased: true }),
    thanhB: P('Nguyễn Văn Thành', 'm', { motherId: 'thanh', spouses: { thuan: true } }),
    thuan: P('Nguyễn Thị Thanh Thuần', 'f', { spouses: { thanhB: true } }),
    tu: P('Nguyễn Văn Tự', 'm', {
      fatherId: 'thanhB',
      motherId: 'thuan',
      order: 1,
      spouses: { tra: true },
    }),
    tra: P('Nguyễn Thị Hải Trà', 'f', { spouses: { tu: true } }),
    lap: P('Nguyễn Thị Lập', 'f', {
      fatherId: 'thanhB',
      motherId: 'thuan',
      order: 2,
      spouses: { long: true },
    }),
    long: P('Võ Thanh Long', 'm', { spouses: { lap: true } }),
    nguyen: P('Nguyễn Thảo Nguyên', 'f', { fatherId: 'tu', motherId: 'tra' }),
    minh: P('Nguyễn Nhật Minh', 'm', { fatherId: 'tu', motherId: 'tra' }),
    la: P('Người Lạ', 'm'),
  };
  const badge = (id: string) => kinBadge(kinship(F, 'tu', id));

  it.each([
    ['thanh', 'Bà nội'],
    ['thanhB', 'Ba'],
    ['thuan', 'Má'],
    ['tra', 'Vợ'],
    ['lap', 'Em gái'],
    ['long', 'Em rể'],
    ['nguyen', 'Con gái'],
    ['minh', 'Con trai'],
  ])('%s → "%s"', (id, label) => {
    expect(badge(id)).toBe(label);
  });

  it('no label for strangers', () => {
    expect(badge('la')).toBeNull();
    expect(kinBadge(null)).toBeNull();
  });

  it('labels for a whole 1,000-person tree are computed quickly', () => {
    const big = randomFamily(1000, 11);
    const ids = Object.keys(big);
    const me = ids[500];
    const t0 = performance.now();
    for (const id of ids) kinBadge(kinship(big, me, id));
    expect(performance.now() - t0).toBeLessThan(1500);
  });
});
