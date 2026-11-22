import { deathAnniversaryKey, daysBetween, isValidSolar, toSolar } from '../data/dates';
import type { People } from '../data/people';
import {
  jdFromDate,
  jdToDate,
  lunarAnniversariesInSolarYear,
  solarToLunar,
  type SolarDate,
} from '../lib/lunar';

export interface FamilyEvent {
  type: 'gio' | 'birthday';
  personId: string;
  date: SolarDate;
  /** giỗ lần thứ N / tuổi N, when the year is known */
  count?: number;
}

/** Giỗ and birthdays of everyone in a family that fall in a solar year. */
export function eventsInYear(people: People, year: number): FamilyEvent[] {
  const out: FamilyEvent[] = [];
  for (const [id, p] of Object.entries(people)) {
    if (p.deceased) {
      const key = deathAnniversaryKey(p.death);
      if (!key) continue;
      const died = toSolar(p.death);
      for (const date of lunarAnniversariesInSolarYear(key.d, key.m, year)) {
        // the first giỗ is a year after the death, never on the day itself
        if (died && jd(date) <= jd(died)) continue;
        const lunarYear = solarToLunar(date.day, date.month, date.year).year;
        const deathLunarYear =
          p.death?.y && p.death.cal === 'l'
            ? p.death.y
            : p.death?.y && p.death.d && p.death.m
              ? solarToLunar(p.death.d, p.death.m, p.death.y).year
              : undefined;
        const count = deathLunarYear ? lunarYear - deathLunarYear : undefined;
        out.push({
          type: 'gio',
          personId: id,
          date,
          count: count && count > 0 ? count : undefined,
        });
      }
    } else if (p.birth?.d && p.birth.m) {
      const b = p.birth;
      const dates =
        b.cal === 'l'
          ? lunarAnniversariesInSolarYear(b.d!, b.m!, year)
          : [
              {
                day: b.m === 2 && b.d === 29 && !isValidSolar(29, 2, year) ? 28 : b.d!,
                month: b.m!,
                year,
              },
            ];
      for (const date of dates) {
        const age = b.y ? year - b.y : undefined;
        out.push({ type: 'birthday', personId: id, date, count: age && age > 0 ? age : undefined });
      }
    }
  }
  return out.sort((a, b) => jd(a.date) - jd(b.date));
}

const jd = (d: SolarDate) => jdFromDate(d.day, d.month, d.year);

/** day of month → events, for one solar month */
export function eventsByDay(
  people: People,
  year: number,
  month: number,
): Map<number, FamilyEvent[]> {
  const map = new Map<number, FamilyEvent[]>();
  for (const e of eventsInYear(people, year)) {
    if (e.date.month !== month) continue;
    map.set(e.date.day, [...(map.get(e.date.day) ?? []), e]);
  }
  return map;
}

/** Events from `from` (inclusive) over the next `days` days. */
export function upcomingEvents(people: People, from: SolarDate, days: number): FamilyEvent[] {
  const end = jdToDate(jd(from) + days);
  const all = [
    ...eventsInYear(people, from.year),
    ...(end.year !== from.year ? eventsInYear(people, end.year) : []),
  ];
  return all.filter((e) => {
    const d = daysBetween(from, e.date);
    return d >= 0 && d <= days;
  });
}

export interface DayCell {
  date: SolarDate;
  inMonth: boolean;
  lunar: ReturnType<typeof solarToLunar>;
}

/** 6-week grid starting on Monday, as on Vietnamese wall calendars. */
export function monthGrid(year: number, month: number): DayCell[] {
  const first = jdFromDate(1, month, year);
  // JD % 7: 0 = Monday
  const start = first - (first % 7);
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = jdToDate(start + i);
    cells.push({
      date,
      inMonth: date.month === month,
      lunar: solarToLunar(date.day, date.month, date.year),
    });
  }
  // drop a trailing week that is entirely next month
  return cells.slice(35).every((c) => !c.inMonth) ? cells.slice(0, 35) : cells;
}
