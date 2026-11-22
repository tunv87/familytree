import { describe, expect, it } from 'vitest';
import {
  dateError,
  deathAnniversaryKey,
  formatFamilyDate,
  nextBirthday,
  nextDeathAnniversary,
  otherCalendarText,
  toLunar,
  toSolar,
} from './dates';

const s = (day: number, month: number, year: number) => ({ day, month, year });

describe('formatting', () => {
  it('shows whatever is known', () => {
    expect(formatFamilyDate({ cal: 's', d: 2, m: 9, y: 1945 })).toBe('2/9/1945');
    expect(formatFamilyDate({ cal: 'l', d: 10, m: 3, y: 1950 })).toBe('10/3/1950 (âm)');
    expect(formatFamilyDate({ cal: 'l', d: 1, m: 6, y: 2025, leap: true })).toBe(
      '1/6 nhuận/2025 (âm)',
    );
    expect(formatFamilyDate({ cal: 's', y: 1920 })).toBe('năm 1920');
    expect(formatFamilyDate({ cal: 'l', d: 15, m: 7 })).toBe('15/7 (âm)');
    expect(formatFamilyDate({ cal: 's' })).toBe('');
  });

  it('shows the other calendar', () => {
    expect(otherCalendarText({ cal: 'l', d: 1, m: 1, y: 2027 })).toBe('6/2/2027');
    expect(otherCalendarText({ cal: 's', d: 6, m: 2, y: 2027 })).toBe(
      'mùng 1 tháng Giêng năm Đinh Mùi',
    );
    expect(otherCalendarText({ cal: 's', y: 2027 })).toBe('');
  });
});

describe('conversion', () => {
  it('converts complete dates', () => {
    expect(toSolar({ cal: 'l', d: 1, m: 1, y: 2027 })).toEqual(s(6, 2, 2027));
    expect(toLunar({ cal: 's', d: 6, m: 2, y: 2027 })).toEqual({
      day: 1,
      month: 1,
      year: 2027,
      leap: false,
    });
    expect(toSolar({ cal: 'l', m: 1, y: 2027 })).toBeNull();
  });
});

describe('validation', () => {
  it('accepts partial dates', () => {
    expect(dateError({ cal: 's', y: 1920 })).toBeNull();
    expect(dateError({ cal: 'l', d: 10, m: 3 })).toBeNull();
    expect(dateError(undefined)).toBeNull();
  });
  it('rejects impossible dates', () => {
    expect(dateError({ cal: 's', d: 30, m: 2, y: 2024 })).toMatch(/không có/);
    expect(dateError({ cal: 's', m: 13 })).toMatch(/Tháng/);
    expect(dateError({ cal: 'l', d: 31, m: 1 })).toMatch(/1 đến 30/);
    expect(dateError({ cal: 'l', d: 1, m: 5, y: 2025, leap: true })).toMatch(/nhuận/);
    expect(dateError({ cal: 's', d: 5, y: 2000 })).toMatch(/tháng/);
  });
});

describe('giỗ', () => {
  it('uses the lunar date of death, converting from solar if needed', () => {
    expect(deathAnniversaryKey({ cal: 'l', d: 10, m: 3 })).toEqual({ d: 10, m: 3 });
    // 6/2/2027 = mùng 1 tháng Giêng
    expect(deathAnniversaryKey({ cal: 's', d: 6, m: 2, y: 2027 })).toEqual({ d: 1, m: 1 });
    expect(deathAnniversaryKey({ cal: 's', d: 6, m: 2 })).toBeNull();
    expect(deathAnniversaryKey({ cal: 'l', y: 1950 })).toBeNull();
  });

  it('finds the next giỗ', () => {
    // giỗ mùng 1 Tết: next after 22/11/2026 is 6/2/2027
    expect(nextDeathAnniversary({ cal: 'l', d: 1, m: 1, y: 1990 }, s(22, 11, 2026))).toEqual(
      s(6, 2, 2027),
    );
    // on the day itself it is "today"
    expect(nextDeathAnniversary({ cal: 'l', d: 1, m: 1 }, s(6, 2, 2027))).toEqual(s(6, 2, 2027));
  });

  it('a giỗ late in tháng Chạp can fall in January', () => {
    const next = nextDeathAnniversary({ cal: 'l', d: 20, m: 12 }, s(1, 1, 2027))!;
    expect(next.year).toBe(2027);
    expect(next.month).toBe(1);
  });
});

describe('birthdays', () => {
  it('solar birthdays repeat on the same day', () => {
    expect(nextBirthday({ cal: 's', d: 1, m: 12, y: 1980 }, s(22, 11, 2026))).toEqual(
      s(1, 12, 2026),
    );
    expect(nextBirthday({ cal: 's', d: 1, m: 1, y: 1980 }, s(22, 11, 2026))).toEqual(s(1, 1, 2027));
    expect(nextBirthday({ cal: 's', d: 29, m: 2, y: 2000 }, s(1, 1, 2027))).toEqual(s(28, 2, 2027));
  });
  it('lunar birthdays follow the lunar calendar', () => {
    expect(nextBirthday({ cal: 'l', d: 1, m: 1, y: 1950 }, s(22, 11, 2026))).toEqual(s(6, 2, 2027));
  });
});
