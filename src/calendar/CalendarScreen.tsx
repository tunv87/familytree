import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentFamily } from '../data/current';
import { todaySolar } from '../data/dates';
import type { People } from '../data/people';
import type { FamilyDate } from '../data/types';
import { useT } from '../i18n';
import {
  dayCanChi,
  formatLunarLong,
  lunarHoliday,
  lunarMonthName,
  solarToLunar,
  yearCanChi,
  type SolarDate,
} from '../lib/lunar';
import { DateInput } from '../ui/DateInput';
import { TopBar } from '../ui/components';
import { eventsByDay, monthGrid, upcomingEvents, type FamilyEvent } from './events';

const NO_PEOPLE: People = {};
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const same = (a: SolarDate, b: SolarDate) =>
  a.day === b.day && a.month === b.month && a.year === b.year;

export function CalendarScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fam = useCurrentFamily();
  const people: People = fam.status === 'ready' ? fam.people : NO_PEOPLE;
  const today = todaySolar();
  const [ym, setYm] = useState({ y: today.year, m: today.month });
  const [selected, setSelected] = useState<SolarDate>(today);
  const [convert, setConvert] = useState<FamilyDate>({ cal: 'l' });

  const grid = useMemo(() => monthGrid(ym.y, ym.m), [ym]);
  const events = useMemo(() => eventsByDay(people, ym.y, ym.m), [people, ym]);
  const upcoming = useMemo(() => upcomingEvents(people, today, 30), [people, today.day]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (delta: number) => {
    const m0 = ym.m - 1 + delta;
    const y = ym.y + Math.floor(m0 / 12);
    const m = (((m0 % 12) + 12) % 12) + 1;
    setYm({ y, m });
  };

  const firstLunar = grid.find((c) => c.inMonth)!.lunar;
  const lastLunar = [...grid].reverse().find((c) => c.inMonth)!.lunar;
  const lunarRange =
    firstLunar.month === lastLunar.month && firstLunar.year === lastLunar.year
      ? `${lunarMonthName(firstLunar.month, firstLunar.leap)} ${yearCanChi(firstLunar.year)}`
      : `${lunarMonthName(firstLunar.month, firstLunar.leap)} – ${lunarMonthName(lastLunar.month, lastLunar.leap)} ${yearCanChi(lastLunar.year)}`;

  const selLunar = solarToLunar(selected.day, selected.month, selected.year);
  const selEvents =
    selected.year === ym.y && selected.month === ym.m
      ? (events.get(selected.day) ?? [])
      : (eventsByDay(people, selected.year, selected.month).get(selected.day) ?? []);

  return (
    <main className="screen">
      <TopBar title={t('calendar')} />
      <div className="cal-head">
        <button
          className="icon-btn"
          aria-label={t('prevMonth')}
          data-testid="prev-month"
          onClick={() => move(-1)}
        >
          ‹
        </button>
        <div className="cal-title">
          <div data-testid="month-title">{t('monthTitle', { m: ym.m, y: ym.y })}</div>
          <div className="muted small">{lunarRange}</div>
        </div>
        <button
          className="icon-btn"
          aria-label={t('nextMonth')}
          data-testid="next-month"
          onClick={() => move(1)}
        >
          ›
        </button>
      </div>

      <div className="cal-grid" data-testid="cal-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className={`cal-wd${w === 'CN' ? ' sun' : ''}`}>
            {w}
          </div>
        ))}
        {grid.map((c) => {
          const hol = lunarHoliday(c.lunar);
          const evs = c.inMonth ? (events.get(c.date.day) ?? []) : [];
          const lunarText =
            c.lunar.day === 1
              ? `${c.lunar.day}/${c.lunar.month}${c.lunar.leap ? 'N' : ''}`
              : String(c.lunar.day);
          const cls = [
            'cal-day',
            c.inMonth ? '' : 'out',
            hol ? `h-${hol}` : '',
            same(c.date, today) ? 'today' : '',
            same(c.date, selected) ? 'sel' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={`${c.date.month}-${c.date.day}`}
              className={cls}
              data-testid={c.inMonth ? `day-${c.date.day}` : undefined}
              onClick={() => {
                setSelected(c.date);
                if (!c.inMonth) setYm({ y: c.date.year, m: c.date.month });
              }}
            >
              <span className="sd">{c.date.day}</span>
              <span className="ld">{lunarText}</span>
              {evs.length > 0 && (
                <span className="dots" aria-hidden>
                  {evs.some((e) => e.type === 'gio') && <i className="dot gio" />}
                  {evs.some((e) => e.type === 'birthday') && <i className="dot bday" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="cal-legend muted small">
        <span>
          <i className="dot gio" /> {t('gio')}
        </span>
        <span>
          <i className="dot bday" /> {t('birthdayShort')}
        </span>
        <span>
          <b className="leg-ram">15</b> {t('ram')}
        </span>
        <span>
          <b className="leg-tet">1</b> {t('tet')}
        </span>
      </div>
      {(ym.y !== today.year || ym.m !== today.month) && (
        <button
          className="btn secondary"
          onClick={() => {
            setYm({ y: today.year, m: today.month });
            setSelected(today);
          }}
        >
          {t('backToToday')}
        </button>
      )}

      <section className="detail-card" data-testid="day-detail">
        <div className="day-title">
          {t('weekdayFull', { d: selected.day, m: selected.month, y: selected.year })}
        </div>
        <div>🌙 {formatLunarLong(selLunar)}</div>
        <div className="muted small">
          {t('dayName', { name: dayCanChi(selected.day, selected.month, selected.year) })}
        </div>
        {selEvents.map((e) => (
          <EventRow
            key={e.type + e.personId}
            e={e}
            people={people}
            onOpen={(id) => navigate(`/p/${id}`)}
          />
        ))}
      </section>

      {fam.status === 'ready' && (
        <section className="list">
          <h3 className="section-title">{t('upcoming30')}</h3>
          {upcoming.length === 0 && <div className="muted">{t('noUpcoming')}</div>}
          {upcoming.map((e) => (
            <EventRow
              key={e.type + e.personId + e.date.year}
              e={e}
              people={people}
              withDate
              onOpen={(id) => navigate(`/p/${id}`)}
            />
          ))}
        </section>
      )}

      <section className="field">
        <span>🔁 {t('converter')}</span>
        <DateInput value={convert} onChange={setConvert} testId="convert" />
      </section>
    </main>
  );
}

function EventRow({
  e,
  people,
  onOpen,
  withDate,
}: {
  e: FamilyEvent;
  people: People;
  onOpen: (id: string) => void;
  withDate?: boolean;
}) {
  const t = useT();
  const p = people[e.personId];
  if (!p) return null;
  const what =
    e.type === 'gio'
      ? e.count
        ? t('gioN', { n: e.count })
        : t('gio')
      : e.count
        ? t('birthdayN', { n: e.count })
        : t('birthdayShort');
  return (
    <button
      className="person-row event-row"
      data-testid={`event-${e.type}-${e.personId}`}
      onClick={() => onOpen(e.personId)}
    >
      <span className="avatar" aria-hidden>
        {e.type === 'gio' ? '🕯️' : '🎂'}
      </span>
      <span className="grow">
        <span className="name">{p.name}</span>
        <span className="sub">
          {what}
          {withDate && ` · ${e.date.day}/${e.date.month}`}
        </span>
      </span>
      <span aria-hidden className="chev">
        ›
      </span>
    </button>
  );
}
