import { describe, expect, it } from 'vitest';
import type { People } from '../data/people';
import { eventsByDay, eventsInYear, monthGrid, upcomingEvents } from './events';

const people: People = {
  to: { name: 'Cụ Tổ', gender: 'm', deceased: true, death: { cal: 'l', d: 1, m: 1, y: 1990 } },
  ba: { name: 'Cụ Bà', gender: 'f', deceased: true, death: { cal: 's', d: 6, m: 2, y: 2027 } },
  an: { name: 'An', gender: 'm', birth: { cal: 's', d: 15, m: 2, y: 1980 } },
  binh: { name: 'Bình', gender: 'f', birth: { cal: 'l', d: 15, m: 8, y: 1950 } },
  unknown: { name: 'Không rõ', gender: 'u', deceased: true, death: { cal: 'l', y: 1900 } },
};

describe('LG-06 LG-02 events', () => {
  it('puts giỗ on the lunar date and counts the years', () => {
    const feb = eventsByDay(people, 2027, 2);
    const tet = feb.get(6)!;
    const gio = tet.find((e) => e.personId === 'to')!;
    expect(gio.type).toBe('gio');
    expect(gio.count).toBe(37); // 2027 − 1990
  });

  it('converts a solar death date to lunar for the giỗ', () => {
    // died on 6/2/2027 = mùng 1 Tết → giỗ đầu next year on mùng 1 Tết 2028 (26/1/2028)
    const jan2028 = eventsByDay(people, 2028, 1);
    expect(jan2028.get(26)?.some((e) => e.personId === 'ba' && e.count === 1)).toBe(true);
  });

  it('birthdays: solar on the same day, lunar follows the moon, with age', () => {
    const feb = eventsByDay(people, 2027, 2);
    expect(feb.get(15)!.find((e) => e.personId === 'an')!.count).toBe(47);
    // Trung thu 2026 is 25/9/2026
    expect(
      eventsByDay(people, 2026, 9)
        .get(25)!
        .some((e) => e.personId === 'binh'),
    ).toBe(true);
  });

  it('skips people without a usable date', () => {
    expect(eventsInYear(people, 2027).some((e) => e.personId === 'unknown')).toBe(false);
  });

  it('lists the next 30 days across the new year', () => {
    const up = upcomingEvents(people, { day: 20, month: 1, year: 2027 }, 30);
    expect(up.map((e) => e.personId)).toEqual(['to', 'an']);
    expect(up[0].date).toEqual({ day: 6, month: 2, year: 2027 });
  });
});

describe('LG-06 monthGrid', () => {
  it('starts on Monday and covers the month', () => {
    const g = monthGrid(2027, 2); // 1/2/2027 is a Monday
    expect(g[0].date).toEqual({ day: 1, month: 2, year: 2027 });
    expect(g.length % 7).toBe(0);
    expect(g.filter((c) => c.inMonth)).toHaveLength(28);
    expect(g.find((c) => c.date.day === 6 && c.inMonth)!.lunar).toMatchObject({ day: 1, month: 1 });
  });
  it('includes days from the previous month', () => {
    const g = monthGrid(2026, 11); // 1/11/2026 is a Sunday
    expect(g[0].date).toEqual({ day: 26, month: 10, year: 2026 });
    expect(g[6].date).toEqual({ day: 1, month: 11, year: 2026 });
  });
});
