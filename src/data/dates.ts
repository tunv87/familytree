import {
  formatLunarLong,
  lunarAnniversary,
  lunarToSolar,
  solarToLunar,
  jdFromDate,
  type LunarDate,
  type SolarDate,
} from '../lib/lunar';
import type { FamilyDate } from './types';

/** True when day, month and year are all known. */
export function isComplete(
  d: FamilyDate | undefined,
): d is Required<Pick<FamilyDate, 'y' | 'm' | 'd'>> & FamilyDate {
  return Boolean(d && d.y && d.m && d.d);
}

export function isEmpty(d: FamilyDate | undefined): boolean {
  return !d || (!d.y && !d.m && !d.d);
}

/** "10/3/1950 (âm)", "3/1950", "1950", "10/3 (âm)" — whatever is known. */
export function formatFamilyDate(d: FamilyDate | undefined): string {
  if (!d || isEmpty(d)) return '';
  const parts: string[] = [];
  if (d.d) parts.push(String(d.d));
  if (d.m) parts.push(d.cal === 'l' && d.leap ? `${d.m} nhuận` : String(d.m));
  if (d.y) parts.push(String(d.y));
  const text = parts.length === 1 && d.y ? `năm ${d.y}` : parts.join('/');
  return d.cal === 'l' ? `${text} (âm)` : text;
}

/** Solar equivalent of a complete date (null if incomplete or not a real lunar date). */
export function toSolar(d: FamilyDate | undefined): SolarDate | null {
  if (!isComplete(d)) return null;
  if (d.cal === 's') return { day: d.d, month: d.m, year: d.y };
  return lunarToSolar(d.d, d.m, d.y, Boolean(d.leap));
}

/** Lunar equivalent of a complete date. */
export function toLunar(d: FamilyDate | undefined): LunarDate | null {
  if (!isComplete(d)) return null;
  if (d.cal === 'l') {
    return lunarToSolar(d.d, d.m, d.y, Boolean(d.leap))
      ? { day: d.d, month: d.m, year: d.y, leap: Boolean(d.leap) }
      : null;
  }
  if (!isValidSolar(d.d, d.m, d.y)) return null;
  return solarToLunar(d.d, d.m, d.y);
}

/** The same date written in the other calendar, e.g. for "10/3/1950 (âm) = 27/4/1950". */
export function otherCalendarText(d: FamilyDate | undefined): string {
  if (!isComplete(d)) return '';
  if (d.cal === 'l') {
    const s = toSolar(d);
    return s ? `${s.day}/${s.month}/${s.year}` : '';
  }
  const l = toLunar(d);
  return l ? formatLunarLong(l) : '';
}

export function isValidSolar(day: number, month: number, year: number): boolean {
  const dt = new Date(Date.UTC(year, month - 1, day));
  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}

/** Problems with a (possibly partial) date, or null if it's fine. */
export function dateError(d: FamilyDate | undefined): string | null {
  if (!d || isEmpty(d)) return null;
  if (d.m !== undefined && (d.m < 1 || d.m > 12)) return 'Tháng phải từ 1 đến 12';
  if (d.d !== undefined && (d.d < 1 || d.d > (d.cal === 'l' ? 30 : 31)))
    return d.cal === 'l' ? 'Ngày âm lịch từ 1 đến 30' : 'Ngày phải từ 1 đến 31';
  if (d.y !== undefined && (d.y < 1000 || d.y > 2200)) return 'Năm không hợp lệ';
  if (d.d && !d.m) return 'Có ngày thì cần có tháng';
  if (isComplete(d)) {
    if (d.cal === 's' && !isValidSolar(d.d, d.m, d.y)) return 'Ngày này không có trong lịch';
    if (d.cal === 'l' && !lunarToSolar(d.d, d.m, d.y, Boolean(d.leap)))
      return d.leap
        ? `Năm ${d.y} không có tháng ${d.m} nhuận`
        : 'Ngày âm này không có (tháng thiếu)';
  }
  return null;
}

/**
 * Lunar day/month on which the giỗ is held. A death recorded in solar is converted to lunar;
 * one with only a lunar day and month (year unknown — common for old ancestors) works too.
 */
export function deathAnniversaryKey(
  death: FamilyDate | undefined,
): { d: number; m: number } | null {
  if (!death || !death.d || !death.m) return null;
  if (death.cal === 'l') return { d: death.d, m: death.m };
  if (!death.y) return null;
  const l = toLunar(death);
  return l ? { d: l.day, m: l.month } : null;
}

const jd = (s: SolarDate) => jdFromDate(s.day, s.month, s.year);

/** Next giỗ on or after `from` (a solar date). */
export function nextDeathAnniversary(
  death: FamilyDate | undefined,
  from: SolarDate,
): SolarDate | null {
  const key = deathAnniversaryKey(death);
  if (!key) return null;
  const today = jd(from);
  for (let y = from.year - 1; y <= from.year + 1; y++) {
    const s = lunarAnniversary(key.d, key.m, y);
    if (jd(s) >= today) return s;
  }
  return null;
}

/** Next birthday on or after `from`, kept in the calendar it was recorded in. */
export function nextBirthday(birth: FamilyDate | undefined, from: SolarDate): SolarDate | null {
  if (!birth || !birth.d || !birth.m) return null;
  const today = jd(from);
  if (birth.cal === 'l') {
    for (let y = from.year - 1; y <= from.year + 1; y++) {
      const s = lunarAnniversary(birth.d, birth.m, y);
      if (jd(s) >= today) return s;
    }
    return null;
  }
  for (let y = from.year; y <= from.year + 1; y++) {
    // 29/2 is celebrated on 28/2 in common years
    const day = birth.m === 2 && birth.d === 29 && !isValidSolar(29, 2, y) ? 28 : birth.d;
    const s = { day, month: birth.m, year: y };
    if (jd(s) >= today) return s;
  }
  return null;
}

export function todaySolar(now = new Date()): SolarDate {
  return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
}

export function daysBetween(a: SolarDate, b: SolarDate): number {
  return jd(b) - jd(a);
}

/** Year a date falls in (for "1920 – 1995" under a name). Lunar years are close enough. */
export function yearOf(d: FamilyDate | undefined): number | undefined {
  return d?.y;
}
