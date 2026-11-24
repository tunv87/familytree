/**
 * Nhắc giỗ without opening the app (Đợt 1, chosen on the mock):
 *  - a calendar file (.ics) with every giỗ of the next 10 years, each reminding 3 days and
 *    1 day before (8 am) — the phone's own calendar does the reminding, on iPhone and Android;
 *  - a ready-made message to send the family over Zalo.
 * Giỗ follow the lunar calendar, so each year's solar date is computed here, not repeated.
 */
import { daysBetween } from '../data/dates';
import type { People } from '../data/people';
import type { Person } from '../data/types';
import { solarToLunar, type SolarDate } from '../lib/lunar';
import { eventsInYear, type FamilyEvent } from './events';

export const REMINDER_YEARS = 10;
const WEEKDAY = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export function weekday(d: SolarDate): string {
  return WEEKDAY[new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay()];
}

/** "ông Nguyễn Văn Tổ", "bà Nguyễn Thị Thanh" */
export function honorific(p: Person): string {
  const word = p.gender === 'm' ? 'ông ' : p.gender === 'f' ? 'bà ' : '';
  return `${word}${p.name}`;
}

/** The next `years` giỗ of each person from `from` on (today included), in date order. */
export function upcomingGio(
  people: People,
  from: SolarDate,
  years = REMINDER_YEARS,
): FamilyEvent[] {
  const out: FamilyEvent[] = [];
  const seen: Record<string, number> = {};
  // one extra year: a giỗ already past this year still gets its 10th the year after
  for (let y = from.year; y <= from.year + years; y++)
    for (const e of eventsInYear(people, y))
      if (e.type === 'gio' && daysBetween(from, e.date) >= 0 && (seen[e.personId] ?? 0) < years) {
        seen[e.personId] = (seen[e.personId] ?? 0) + 1;
        out.push(e);
      }
  return out;
}

/** How many people have a giỗ date the app can compute. */
export function gioPeopleCount(people: People, from: SolarDate): number {
  return new Set(upcomingGio(people, from, 2).map((e) => e.personId)).size;
}

const pad = (n: number) => String(n).padStart(2, '0');
const icsDate = (d: SolarDate) => `${d.year}${pad(d.month)}${pad(d.day)}`;
const nextDay = (d: SolarDate): SolarDate => {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day + 1));
  return { day: t.getUTCDate(), month: t.getUTCMonth() + 1, year: t.getUTCFullYear() };
};

/** Escapes text for an iCalendar value. */
export function icsText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/([,;])/g, '\\$1');
}

/** Folds a content line to 75 octets (UTF-8), as calendars expect. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let cur = '';
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (parts.length ? 74 : 75)) {
      parts.push(cur);
      cur = ch;
    } else cur += ch;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

/**
 * The calendar file. All-day events; alarms at 8 am three days before and the day before
 * (relative to the start of the all-day event, which is midnight).
 */
export function buildGioCalendar(
  people: People,
  familyName: string,
  from: SolarDate,
  familyId = 'gia-pha',
  years = REMINDER_YEARS,
): string {
  const stamp = `${icsDate(from)}T000000Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gia pha//Nhac gio//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsText(`Ngày giỗ – ${familyName}`)}`,
  ];
  for (const e of upcomingGio(people, from, years)) {
    const p = people[e.personId];
    const l = solarToLunar(e.date.day, e.date.month, e.date.year);
    const title = `Giỗ ${honorific(p)} (${l.day}/${l.month}${l.leap ? ' nhuận' : ''} ÂL)`;
    const desc = [
      `Ngày ${l.day}/${l.month} âm lịch, tức ${weekday(e.date)} ${e.date.day}/${e.date.month}/${e.date.year}.`,
      e.count ? `Giỗ lần thứ ${e.count}.` : '',
      `Gia phả ${familyName}.`,
    ]
      .filter(Boolean)
      .join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${familyId}-${e.personId}-${icsDate(e.date)}@gia-pha`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(e.date)}`,
      `DTEND;VALUE=DATE:${icsDate(nextDay(e.date))}`,
      `SUMMARY:${icsText(title)}`,
      `DESCRIPTION:${icsText(desc)}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsText(`Còn 3 ngày: ${title}`)}`,
      'TRIGGER:-P2DT16H',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsText(`Ngày mai: ${title}`)}`,
      'TRIGGER:-PT16H',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** "Nhắn cả nhà": the message about one giỗ, ready to paste in Zalo (the user can edit it). */
export function gioMessage(e: FamilyEvent, people: People, link: string): string {
  const p = people[e.personId];
  const l = solarToLunar(e.date.day, e.date.month, e.date.year);
  return [
    `🕯️ Giỗ ${honorific(p)}`,
    `Ngày ${l.day}/${l.month}${l.leap ? ' nhuận' : ''} âm lịch, tức ${weekday(e.date)} ${e.date.day}/${e.date.month}/${e.date.year}.`,
    'Con cháu nhớ về thắp hương.',
    `Xem gia phả: ${link}`,
  ].join('\n');
}

/** File name for the calendar, e.g. "ngay-gio-ho-nguyen.ics". */
export function icsFileName(familyName: string): string {
  const slug =
    familyName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'gia-pha';
  return `ngay-gio-${slug}.ics`;
}
