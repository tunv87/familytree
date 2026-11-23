import { describe, expect, it } from 'vitest';
import {
  dayCanChi,
  formatLunarLong,
  formatLunarShort,
  jdFromDate,
  jdToDate,
  leapMonthOf,
  lunarAnniversariesInSolarYear,
  lunarAnniversary,
  lunarHoliday,
  lunarMonthDays,
  lunarToSolar,
  solarToLunar,
  yearCanChi,
} from './lunar';

const d = (day: number, month: number, year: number) => ({ day, month, year });

describe('LG-01 Julian day', () => {
  it('matches known values', () => {
    expect(jdFromDate(1, 1, 2000)).toBe(2451545);
    expect(jdToDate(2451545)).toEqual(d(1, 1, 2000));
  });
});

describe('LG-01 Tết Nguyên đán (Vietnam, UTC+7)', () => {
  const TET: [number, [number, number, number]][] = [
    [2020, [25, 1, 2020]],
    [2021, [12, 2, 2021]],
    [2022, [1, 2, 2022]],
    [2023, [22, 1, 2023]],
    [2024, [10, 2, 2024]],
    [2025, [29, 1, 2025]],
    [2026, [17, 2, 2026]],
    [2027, [6, 2, 2027]],
    [2028, [26, 1, 2028]],
    [2029, [13, 2, 2029]],
    [2030, [2, 2, 2030]],
  ];
  it.each(TET)('Tết %i', (year, [dd, mm, yy]) => {
    expect(lunarToSolar(1, 1, year)).toEqual(d(dd, mm, yy));
    expect(solarToLunar(dd, mm, yy)).toEqual({ day: 1, month: 1, year, leap: false });
  });

  it('uses the Vietnamese time zone, not China’s', () => {
    // Tết 1985: VN 21/1, China 20/2. Tết 2007: VN 17/2, China 18/2. Tết 2030: VN 2/2, China 3/2.
    expect(lunarToSolar(1, 1, 1985)).toEqual(d(21, 1, 1985));
    expect(lunarToSolar(1, 1, 2007)).toEqual(d(17, 2, 2007));
    expect(lunarToSolar(1, 1, 2030)).toEqual(d(2, 2, 2030));
  });
});

describe('LG-01 leap months', () => {
  it.each([
    [2017, 6],
    [2020, 4],
    [2023, 2],
    [2025, 6],
    [2028, 5],
    [2026, 0],
    [2027, 0],
  ])('%i → nhuận tháng %i', (year, month) => {
    expect(leapMonthOf(year)).toBe(month);
  });

  it('distinguishes tháng 6 and tháng 6 nhuận in 2025', () => {
    expect(lunarToSolar(1, 6, 2025)).toEqual(d(25, 6, 2025));
    expect(lunarToSolar(1, 6, 2025, true)).toEqual(d(25, 7, 2025));
    expect(solarToLunar(25, 7, 2025)).toEqual({ day: 1, month: 6, year: 2025, leap: true });
  });

  it('rejects a leap month the year does not have', () => {
    expect(lunarToSolar(1, 5, 2025, true)).toBeNull();
    expect(lunarToSolar(1, 1, 2027, true)).toBeNull();
  });
});

describe('LG-01 known dates', () => {
  it('Trung thu 2026 is 25/9/2026', () => {
    expect(lunarToSolar(15, 8, 2026)).toEqual(d(25, 9, 2026));
  });
  it('dates around the lunar new year belong to the previous lunar year', () => {
    // the day before Tết Đinh Mùi is 30 tháng Chạp Bính Ngọ (or 29 if Chạp is short)
    const eve = solarToLunar(5, 2, 2027);
    expect(eve.month).toBe(12);
    expect(eve.year).toBe(2026);
  });
});

describe('LG-01 round trip', () => {
  it('every day 1900–2100 converts to lunar and back (day 1–30, valid month)', () => {
    const bad: string[] = [];
    for (let jd = jdFromDate(1, 1, 1900); jd <= jdFromDate(31, 12, 2100); jd++) {
      const s = jdToDate(jd);
      const l = solarToLunar(s.day, s.month, s.year);
      const back = lunarToSolar(l.day, l.month, l.year, l.leap);
      if (
        l.day < 1 ||
        l.day > 30 ||
        !back ||
        back.day !== s.day ||
        back.month !== s.month ||
        back.year !== s.year
      )
        bad.push(`${s.day}/${s.month}/${s.year}`);
      if (bad.length > 5) break;
    }
    expect(bad).toEqual([]);
  });

  it('lunar months have 29 or 30 days and day 30 of a short month does not exist', () => {
    for (let y = 2020; y <= 2030; y++)
      for (let m = 1; m <= 12; m++) {
        const n = lunarMonthDays(m, y);
        expect([29, 30]).toContain(n);
        expect(lunarToSolar(30, m, y) === null).toBe(n === 29);
      }
  });
});

describe('LG-02 anniversaries (giỗ)', () => {
  it('falls on the same lunar date each year', () => {
    const s = lunarAnniversary(10, 3, 2027); // giỗ Tổ Hùng Vương
    expect(solarToLunar(s.day, s.month, s.year)).toMatchObject({ day: 10, month: 3, leap: false });
  });

  it('moves day 30 to day 29 when the month is short', () => {
    const y = 2027;
    const m = [...Array(12).keys()].map((i) => i + 1).find((mm) => lunarMonthDays(mm, y) === 29)!;
    expect(lunarAnniversary(30, m, y)).toEqual(lunarToSolar(29, m, y));
  });

  it('finds the giỗ dates inside a solar year', () => {
    expect(lunarAnniversariesInSolarYear(1, 1, 2027)).toEqual([d(6, 2, 2027)]);
    // a late tháng Chạp date of lunar 2026 lands in January 2027
    const chap = lunarAnniversariesInSolarYear(20, 12, 2027);
    expect(chap.length).toBeGreaterThanOrEqual(1);
    for (const x of chap) expect(x.year).toBe(2027);
  });
});

describe('LG-01 names', () => {
  it('year can chi', () => {
    expect(yearCanChi(1984)).toBe('Giáp Tý');
    expect(yearCanChi(2025)).toBe('Ất Tỵ');
    expect(yearCanChi(2026)).toBe('Bính Ngọ');
    expect(yearCanChi(2027)).toBe('Đinh Mùi');
  });

  it('day can chi', () => {
    // 1/1/2000 was a Mậu Ngọ day
    expect(dayCanChi(1, 1, 2000)).toBe('Mậu Ngọ');
  });

  it('formats', () => {
    expect(formatLunarLong({ day: 1, month: 1, year: 2027, leap: false })).toBe(
      'mùng 1 tháng Giêng năm Đinh Mùi',
    );
    expect(formatLunarLong({ day: 15, month: 6, year: 2025, leap: true })).toBe(
      'rằm tháng Sáu nhuận năm Ất Tỵ',
    );
    expect(formatLunarShort({ day: 3, month: 4, year: 2020, leap: true })).toBe('3/4N');
  });

  it('holiday marks', () => {
    expect(lunarHoliday({ day: 2, month: 1, year: 2027, leap: false })).toBe('tet');
    expect(lunarHoliday({ day: 15, month: 7, year: 2027, leap: false })).toBe('ram');
    expect(lunarHoliday({ day: 1, month: 9, year: 2027, leap: false })).toBe('mung1');
    expect(lunarHoliday({ day: 9, month: 9, year: 2027, leap: false })).toBeNull();
  });
});
