/** Extra logic and security checks (LG-01, LG-02, LG-09, SEC-03). */
import { describe, expect, it } from 'vitest';
import { eventsInYear } from '../calendar/events';
import { deathAnniversaryKey } from '../data/dates';
import { randomId } from '../data/families';
import { childrenOf, normalize, searchPeople, type People } from '../data/people';
import { leapMonthOf, lunarMonthDays, lunarToSolar, solarToLunar } from '../lib/lunar';

describe('LG-01 lunar calendar invariants', () => {
  it('each lunar year has 12 months, or 13 with exactly one leap month', () => {
    for (let y = 1900; y <= 2100; y++) {
      const leap = leapMonthOf(y);
      expect(leap).toBeGreaterThanOrEqual(0);
      expect(leap).toBeLessThanOrEqual(12);
      for (let m = 1; m <= 12; m++) {
        expect(lunarToSolar(1, m, y, true) !== null).toBe(m === leap);
        expect([29, 30]).toContain(lunarMonthDays(m, y));
      }
    }
  });

  it('about 7 leap years in every 19 (Metonic cycle)', () => {
    for (let start = 1900; start <= 2080; start += 19) {
      let n = 0;
      for (let y = start; y < start + 19; y++) if (leapMonthOf(y)) n++;
      expect(n).toBeGreaterThanOrEqual(6);
      expect(n).toBeLessThanOrEqual(8);
    }
  });

  it('a lunar year is 353–355 or 383–385 days long', () => {
    for (let y = 1901; y <= 2099; y++) {
      const a = lunarToSolar(1, 1, y)!;
      const b = lunarToSolar(1, 1, y + 1)!;
      const days =
        (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000;
      expect([353, 354, 355, 383, 384, 385]).toContain(days);
    }
  });

  it('Tết always falls between 21/1 and 20/2', () => {
    for (let y = 1900; y <= 2100; y++) {
      const t = lunarToSolar(1, 1, y)!;
      const md = t.month * 100 + t.day;
      expect(md).toBeGreaterThanOrEqual(121);
      expect(md).toBeLessThanOrEqual(220);
    }
  });
});

describe('LG-02 giỗ for deaths in a leap month or on day 30', () => {
  it('a death in tháng 6 nhuận 2025 is remembered in (regular) tháng 6', () => {
    // 25/7/2025 = 1/6 nhuận Ất Tỵ
    expect(solarToLunar(25, 7, 2025)).toMatchObject({ day: 1, month: 6, leap: true });
    expect(deathAnniversaryKey({ cal: 's', d: 25, m: 7, y: 2025 })).toEqual({ d: 1, m: 6 });
    const people: People = {
      a: {
        name: 'A',
        gender: 'm',
        deceased: true,
        death: { cal: 'l', d: 1, m: 6, y: 2025, leap: true },
      },
    };
    const [gio] = eventsInYear(people, 2026);
    expect(solarToLunar(gio.date.day, gio.date.month, gio.date.year)).toMatchObject({
      day: 1,
      month: 6,
      leap: false,
    });
    expect(gio.count).toBe(1);
  });

  it('a death on day 30 is remembered on day 29 when the month is short', () => {
    // find a month with 29 days in 2027
    const m = [...Array(12).keys()].map((i) => i + 1).find((x) => lunarMonthDays(x, 2027) === 29)!;
    const people: People = {
      a: { name: 'A', gender: 'm', deceased: true, death: { cal: 'l', d: 30, m } },
    };
    const gio = eventsInYear(people, 2027)
      .concat(eventsInYear(people, 2028))
      .find((e) => {
        const l = solarToLunar(e.date.day, e.date.month, e.date.year);
        return l.year === 2027;
      })!;
    expect(solarToLunar(gio.date.day, gio.date.month, gio.date.year)).toMatchObject({
      day: 29,
      month: m,
    });
  });
});

describe('LG-09 sibling order: birth order, then birth year, then name', () => {
  it('orders children correctly', () => {
    const people: People = {
      f: { name: 'Cha', gender: 'm' },
      c: { name: 'Cúc', gender: 'f', fatherId: 'f', birth: { cal: 's', y: 1960 } },
      a: { name: 'An', gender: 'm', fatherId: 'f', order: 2 },
      b: { name: 'Bảo', gender: 'm', fatherId: 'f', order: 1 },
      d: { name: 'Dũng', gender: 'm', fatherId: 'f', birth: { cal: 's', y: 1955 } },
      e: { name: 'Ánh', gender: 'f', fatherId: 'f' },
      g: { name: 'Bích', gender: 'f', fatherId: 'f' },
    };
    expect(childrenOf(people, 'f')).toEqual(['b', 'a', 'd', 'c', 'e', 'g']);
  });
});

describe('LG-08 search: accents, đ/Đ, case and spaces', () => {
  it('matches the way people type on a phone', () => {
    const people: People = {
      a: { name: 'Đặng Thị Ánh Nguyệt', gender: 'f' },
      b: { name: 'Nguyễn Văn Đức', gender: 'm' },
    };
    expect(normalize('  ĐẶNG  ')).toBe('dang');
    expect(searchPeople(people, 'dang thi')).toEqual(['a']);
    expect(searchPeople(people, 'DUC')).toEqual(['b']);
    expect(searchPeople(people, 'nguyet')).toEqual(['a']);
    expect(searchPeople(people, 'Đức')).toEqual(['b']);
  });
});

describe('SEC-03 family codes are long and random', () => {
  it('20 characters from a 57-letter alphabet, no look-alike letters', () => {
    for (let i = 0; i < 200; i++) expect(randomId()).toMatch(/^[A-HJ-NP-Za-km-z2-9]{20}$/);
  });

  it('no repeats in 100,000 codes and letters are evenly used', () => {
    const seen = new Set<string>();
    const counts = new Map<string, number>();
    for (let i = 0; i < 100_000; i++) {
      const id = randomId();
      seen.add(id);
      if (i < 20_000) for (const ch of id) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
    expect(seen.size).toBe(100_000);
    // 400,000 letters / 57 ≈ 7,018 each; allow ±6 %
    const expected = 400_000 / 57;
    for (const n of counts.values()) expect(Math.abs(n - expected) / expected).toBeLessThan(0.06);
    expect(counts.size).toBe(57);
  });
});
