/**
 * Vietnamese lunisolar calendar (âm lịch), after Hồ Ngọc Đức's algorithm
 * (https://www.informatik.uni-leipzig.de/~duc/amlich/), computed for UTC+7.
 *
 * The time zone matters: Vietnam and China occasionally start a month on different
 * days (e.g. Tết 1985 was 21/1 in Vietnam but 20/2 in China), so never reuse a
 * Chinese-calendar library for this.
 *
 * Valid for roughly 1800–2199.
 */

const TZ = 7;
const { floor, PI, sin } = Math;

export interface SolarDate {
  day: number;
  month: number; // 1–12
  year: number;
}

export interface LunarDate {
  day: number; // 1–30
  month: number; // 1–12
  year: number;
  /** true for the repeated (intercalary) month — "tháng nhuận" */
  leap: boolean;
}

/** Julian day number of a Gregorian date. */
export function jdFromDate(day: number, month: number, year: number): number {
  const a = floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    floor((153 * m + 2) / 5) +
    365 * y +
    floor(y / 4) -
    floor(y / 100) +
    floor(y / 400) -
    32045
  );
}

/** Gregorian date of a Julian day number. */
export function jdToDate(jd: number): SolarDate {
  const a = jd + 32044;
  const b = floor((4 * a + 3) / 146097);
  const c = a - floor((b * 146097) / 4);
  const d = floor((4 * c + 3) / 1461);
  const e = c - floor((1461 * d) / 4);
  const m = floor((5 * e + 2) / 153);
  return {
    day: e - floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * floor(m / 10),
    year: b * 100 + d - 4800 + floor(m / 10),
  };
}

/** Julian day (fractional, UT) of the k-th new moon after 1/1/1900. */
function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * sin(M * dr) + 0.0021 * sin(2 * dr * M);
  C1 = C1 - 0.4068 * sin(Mpr * dr) + 0.0161 * sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * sin(dr * 2 * F) - 0.0051 * sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * sin(dr * (M - Mpr)) + 0.0004 * sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * sin(dr * (2 * F - M)) - 0.0006 * sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * sin(dr * (2 * F - Mpr)) + 0.0005 * sin(dr * (2 * Mpr + M));
  const deltat =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Jd1 + C1 - deltat;
}

/** Sun's ecliptic longitude in radians at a Julian day (UT). */
function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * sin(dr * 2 * M) + 0.00029 * sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L -= PI * 2 * floor(L / (PI * 2));
  return L;
}

/** Local (UTC+7) day number on which the k-th new moon falls. */
function newMoonDay(k: number): number {
  return floor(newMoon(k) + 0.5 + TZ / 24);
}

/**
 * Index k of the lunation (lunar month) that contains local day jdn.
 * Starts from the mean-lunation estimate, then corrects it: a true new moon can be
 * hours away from the mean one, so the estimate alone is occasionally one month off.
 */
function lunationOn(jdn: number): number {
  let k = floor((jdn - 2415021.076998695) / 29.530588853);
  while (newMoonDay(k) > jdn) k--;
  while (newMoonDay(k + 1) <= jdn) k++;
  return k;
}

/** Which of the 12 solar-term sectors (0–11) the sun is in at local midnight starting day jdn. */
function sunSector(jdn: number): number {
  return floor((sunLongitude(jdn - 0.5 - TZ / 24) / PI) * 6);
}

/** Day number of the start of lunar month 11 (the month containing the winter solstice) of a year. */
function lunarMonth11(year: number): number {
  const off = jdFromDate(31, 12, year) - 2415021;
  const k = floor(off / 29.530588853);
  let nm = newMoonDay(k);
  if (sunSector(nm) >= 9) nm = newMoonDay(k - 1);
  return nm;
}

/** Offset (in months after month 11) of the leap month in the lunar year starting at a11. */
function leapMonthOffset(a11: number): number {
  const k = floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = sunSector(newMoonDay(k + i));
  do {
    last = arc;
    i++;
    arc = sunSector(newMoonDay(k + i));
  } while (arc !== last && i < 14);
  return i - 1;
}

export function solarToLunar(day: number, month: number, year: number): LunarDate {
  const dayNumber = jdFromDate(day, month, year);
  const monthStart = newMoonDay(lunationOn(dayNumber));
  let a11 = lunarMonth11(year);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = year;
    a11 = lunarMonth11(year - 1);
  } else {
    lunarYear = year + 1;
    b11 = lunarMonth11(year + 1);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = floor((monthStart - a11) / 29);
  let leap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapDiff = leapMonthOffset(a11);
    if (diff >= leapDiff) {
      lunarMonth = diff + 10;
      if (diff === leapDiff) leap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap };
}

/**
 * Solar date of a lunar date, or null if it doesn't exist (a leap month that year
 * doesn't have, or day 30 of a 29-day month).
 */
export function lunarToSolar(
  day: number,
  month: number,
  year: number,
  leap = false,
): SolarDate | null {
  if (day < 1 || day > 30 || month < 1 || month > 12) return null;
  let a11: number;
  let b11: number;
  if (month < 11) {
    a11 = lunarMonth11(year - 1);
    b11 = lunarMonth11(year);
  } else {
    a11 = lunarMonth11(year);
    b11 = lunarMonth11(year + 1);
  }
  const k = lunationOn(a11);
  let off = month - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = leapMonthOffset(a11);
    // offset 1 after month 11 is a leap 11, offset 2 a leap 12, offset 3 a leap Giêng…
    const leapMonth = ((leapOff + 9) % 12) + 1;
    if (leap && month !== leapMonth) return null;
    if (leap || off >= leapOff) off += 1;
  } else if (leap) {
    return null;
  }
  const monthStart = newMoonDay(k + off);
  if (day > monthLength(k + off)) return null;
  return jdToDate(monthStart + day - 1);
}

function monthLength(k: number): number {
  return newMoonDay(k + 1) - newMoonDay(k);
}

/** The leap month (1–12) of a lunar year, or 0 if the year has none. */
export function leapMonthOf(lunarYear: number): number {
  for (let m = 1; m <= 12; m++) if (lunarToSolar(1, m, lunarYear, true)) return m;
  return 0;
}

/** Number of days (29 or 30) in a lunar month. */
export function lunarMonthDays(month: number, year: number, leap = false): number {
  return lunarToSolar(30, month, year, leap) ? 30 : 29;
}

/**
 * Solar date on which a yearly lunar anniversary (giỗ, lunar birthday) falls in a lunar year.
 * Custom: an anniversary from a leap month is kept in the regular month, and day 30 is
 * kept on day 29 in years where that month only has 29 days.
 */
export function lunarAnniversary(day: number, month: number, lunarYear: number): SolarDate | null {
  // null only for impossible input (month outside 1–12, day outside 1–30)
  if (day < 1 || day > 30) return null;
  return lunarToSolar(day, month, lunarYear) ?? lunarToSolar(29, month, lunarYear);
}

/** Lunar anniversaries landing in a given solar year (0, 1 or rarely 2 dates). */
export function lunarAnniversariesInSolarYear(
  day: number,
  month: number,
  solarYear: number,
): SolarDate[] {
  return [solarYear - 1, solarYear]
    .map((y) => lunarAnniversary(day, month, y))
    .filter((d): d is SolarDate => d !== null)
    .filter((d) => d.year === solarYear);
}

// ---------- names ----------

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/** Can chi name of a lunar year, e.g. 2027 → "Đinh Mùi". */
export function yearCanChi(lunarYear: number): string {
  return `${CAN[(lunarYear + 6) % 10]} ${CHI[(lunarYear + 8) % 12]}`;
}

/** Can chi name of a solar day, e.g. 6/2/2027 → day name used on Vietnamese calendars. */
export function dayCanChi(day: number, month: number, year: number): string {
  const jd = jdFromDate(day, month, year);
  return `${CAN[(jd + 9) % 10]} ${CHI[(jd + 1) % 12]}`;
}

const MONTH_NAMES = [
  'Giêng',
  'Hai',
  'Ba',
  'Tư',
  'Năm',
  'Sáu',
  'Bảy',
  'Tám',
  'Chín',
  'Mười',
  'Mười một',
  'Chạp',
];

/** Traditional month name: 1 → "Giêng", 4 → "Tư", 12 → "Chạp". */
export function lunarMonthName(month: number, leap = false): string {
  return `tháng ${MONTH_NAMES[month - 1]}${leap ? ' nhuận' : ''}`;
}

/** "mùng 5", "rằm", "20" — how a lunar day is usually said. */
export function lunarDayName(day: number): string {
  if (day <= 10) return `mùng ${day}`;
  if (day === 15) return 'rằm';
  return String(day);
}

/** Short numeric form used under solar dates in calendar cells: "1/1", "15/8", "3/4N". */
export function formatLunarShort(d: LunarDate): string {
  return `${d.day}/${d.month}${d.leap ? 'N' : ''}`;
}

/** Full form: "mùng 1 tháng Giêng năm Đinh Mùi". */
export function formatLunarLong(d: LunarDate): string {
  return `${lunarDayName(d.day)} ${lunarMonthName(d.month, d.leap)} năm ${yearCanChi(d.year)}`;
}

export type LunarHoliday = 'tet' | 'ram' | 'mung1';

/** Marks shown on the calendar: Tết (1–3 tháng Giêng), rằm and mùng 1. */
export function lunarHoliday(d: LunarDate): LunarHoliday | null {
  if (d.month === 1 && !d.leap && d.day <= 3) return 'tet';
  if (d.day === 15) return 'ram';
  if (d.day === 1) return 'mung1';
  return null;
}
