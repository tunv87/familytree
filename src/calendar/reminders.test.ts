import { describe, expect, it } from 'vitest';
import type { People } from '../data/people';
import { solarToLunar } from '../lib/lunar';
import {
  buildGioCalendar,
  foldLine,
  gioMessage,
  gioPeopleCount,
  icsFileName,
  icsText,
  upcomingGio,
  weekday,
} from './reminders';

const people: People = {
  thanh: {
    name: 'Nguyễn Thị Thanh',
    gender: 'f',
    deceased: true,
    death: { cal: 'l', d: 21, m: 10, y: 2001 },
  },
  to: { name: 'Nguyễn Văn Tổ', gender: 'm', deceased: true, death: { cal: 'l', d: 11, m: 11 } },
  noDate: { name: 'Không Rõ Ngày', gender: 'm', deceased: true },
  living: { name: 'Nguyễn Văn Tự', gender: 'm', birth: { cal: 's', d: 8, m: 12, y: 1987 } },
};
const today = { day: 24, month: 11, year: 2026 };

describe('LG-18 nhắc giỗ vào lịch điện thoại', () => {
  it('lists every giỗ of the next 10 years, on the right lunar day each year', () => {
    const list = upcomingGio(people, today);
    expect(list.filter((e) => e.personId === 'thanh')).toHaveLength(10);
    expect(list.every((e) => e.type === 'gio')).toBe(true);
    for (const e of list.filter((x) => x.personId === 'thanh')) {
      const l = solarToLunar(e.date.day, e.date.month, e.date.year);
      expect([l.day, l.month]).toEqual([21, 10]);
    }
    // the first one is this year's: Chủ nhật 29/11/2026
    expect(list[0]).toMatchObject({ personId: 'thanh', date: { day: 29, month: 11, year: 2026 } });
    expect(weekday(list[0].date)).toBe('Chủ nhật');
  });

  it('a giỗ already past this year still gets 10 reminders (the next 10 years)', () => {
    // from 1/12/2026: this year's 29/11 is past, so 2027 … 2036
    const list = upcomingGio(people, { day: 1, month: 12, year: 2026 }).filter(
      (e) => e.personId === 'thanh',
    );
    expect(list).toHaveLength(10);
    expect(list[0].date.year).toBe(2027);
    expect(list[9].date.year).toBe(2036);
  });

  it('counts people whose giỗ date is known (not the living, not unknown dates)', () => {
    expect(gioPeopleCount(people, today)).toBe(2);
  });

  it('builds a calendar file phones accept: all-day events with 2 reminders', () => {
    const ics = buildGioCalendar(people, 'Họ Nguyễn', today, 'fam1');
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(20);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261129');
    expect(ics).toContain('DTEND;VALUE=DATE:20261130');
    // 8 am three days before, and the day before
    expect(ics.match(/TRIGGER:-P2DT16H/g)).toHaveLength(20);
    expect(ics.match(/TRIGGER:-PT16H/g)).toHaveLength(20);
    expect(ics).toContain('UID:fam1-thanh-20261129@gia-pha');
    // giỗ lần thứ (death year known)
    expect(ics.replace(/\r\n /g, '')).toContain('Giỗ lần thứ 25.'); // long lines are folded
    // no line longer than 75 bytes
    for (const line of ics.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });

  it('escapes and folds text the way calendars expect', () => {
    expect(icsText('a, b; c\nd')).toBe('a\\, b\\; c\\nd');
    const long = 'SUMMARY:' + 'Giỗ bà Nguyễn Thị Thanh '.repeat(6);
    const folded = foldLine(long);
    expect(folded.split('\r\n ').join('')).toBe(long);
  });

  it('the Zalo message names the person, the lunar and the solar day', () => {
    const e = upcomingGio(people, today)[0];
    expect(gioMessage(e, people, 'https://x/#/f/abc')).toBe(
      [
        '🕯️ Giỗ bà Nguyễn Thị Thanh',
        'Ngày 21/10 âm lịch, tức Chủ nhật 29/11/2026.',
        'Con cháu nhớ về thắp hương.',
        'Xem gia phả: https://x/#/f/abc',
      ].join('\n'),
    );
  });

  it('file name has no accents', () => {
    expect(icsFileName('Họ Nguyễn — Đông Ngạc')).toBe('ngay-gio-ho-nguyen-dong-ngac.ics');
  });
});
