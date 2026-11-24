import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { upcomingEvents } from '../calendar/events';
import { weekday } from '../calendar/reminders';
import { daysBetween, todaySolar } from '../data/dates';
import type { People } from '../data/people';
import { useT } from '../i18n';
import { solarToLunar } from '../lib/lunar';

const MAX = 3;
const DAYS = 30;

/** "Sắp tới" at the top of the home page: up to 3 giỗ / birthdays in the next 30 days. */
export function Upcoming({ people }: { people: People }) {
  const t = useT();
  const navigate = useNavigate();
  const today = todaySolar();
  const events = useMemo(
    () => upcomingEvents(people, today, DAYS).slice(0, MAX),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [people, today.day],
  );
  if (events.length === 0) return null;
  return (
    <section className="upcoming" data-testid="upcoming">
      <h2>{t('upcomingTitle')}</h2>
      {events.map((e, i) => {
        const p = people[e.personId];
        const left = daysBetween(today, e.date);
        const l = solarToLunar(e.date.day, e.date.month, e.date.year);
        const when =
          left === 0 ? t('todayWord') : left === 1 ? t('tomorrowWord') : t('daysLeft', { n: left });
        const title =
          e.type === 'gio' ? t('gioOf', { name: p.name }) : t('birthdayOf', { name: p.name });
        const date =
          `${weekday(e.date)} ${e.date.day}/${e.date.month}` +
          (e.type === 'gio' ? ` · ${l.day}/${l.month} ÂL` : '');
        return (
          <button
            key={e.type + e.personId + e.date.year}
            className={`upcoming-row${i === 0 ? ' first' : ''}`}
            data-testid={`upcoming-${e.type}-${e.personId}`}
            onClick={() => navigate(`/p/${e.personId}`)}
          >
            <span className="upcoming-icon" aria-hidden>
              {e.type === 'gio' ? '🕯️' : '🎂'}
            </span>
            <span className="grow">
              <span className="upcoming-title">{title}</span>
              <span className="upcoming-date">{date}</span>
            </span>
            <span className="upcoming-left">{when}</span>
          </button>
        );
      })}
      <button
        className="link-btn"
        onClick={() => navigate('/calendar')}
        data-testid="upcoming-more"
      >
        {t('seeCalendar')} ›
      </button>
    </section>
  );
}
