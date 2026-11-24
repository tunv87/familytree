import { useRef, useState } from 'react';
import { getCurrentId, shareUrl } from '../data/current';
import { todaySolar } from '../data/dates';
import type { People } from '../data/people';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';
import { Modal } from '../ui/components';
import { showToast } from '../ui/toast';
import type { FamilyEvent } from './events';
import { buildGioCalendar, gioMessage, gioPeopleCount, icsFileName } from './reminders';

const log = createLogger('reminders');

/** "Để điện thoại tự nhắc ngày giỗ": one tap adds every giỗ of the next 10 years to the phone. */
export function AddToCalendarCard({
  people,
  familyName,
  familyId,
}: {
  people: People;
  familyName: string;
  familyId: string;
}) {
  const t = useT();
  const today = todaySolar();
  const count = gioPeopleCount(people, today);
  if (count === 0) return null;
  const add = () => {
    try {
      const ics = buildGioCalendar(people, familyName, today, familyId);
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = icsFileName(familyName);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      showToast(t('calendarFileReady'));
    } catch (e) {
      log.error('calendar file failed', e);
      showToast(t('saveError'));
    }
  };
  return (
    <section className="remind-card" data-testid="remind-card">
      <h2>{t('remindTitle')}</h2>
      <p>{t('remindHint')}</p>
      <button className="btn" data-testid="add-to-calendar" onClick={add}>
        📅 {t('remindButton', { n: count })}
      </button>
    </section>
  );
}

/** "Nhắn cả nhà qua Zalo" under a giỗ. */
export function MessageButton({ e, people }: { e: FamilyEvent; people: People }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="btn secondary small-btn"
        data-testid={`message-${e.personId}`}
        onClick={() => setOpen(true)}
      >
        💬 {t('messageFamily')}
      </button>
      {open && <MessageSheet e={e} people={people} onClose={() => setOpen(false)} />}
    </>
  );
}

function MessageSheet({
  e,
  people,
  onClose,
}: {
  e: FamilyEvent;
  people: People;
  onClose: () => void;
}) {
  const t = useT();
  const [text, setText] = useState(() => gioMessage(e, people, shareUrl(getCurrentId() ?? '')));
  const area = useRef<HTMLTextAreaElement>(null);
  const canShare = typeof navigator.share === 'function';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('messageCopied'));
    } catch {
      area.current?.select();
      showToast(t('copyFailed'));
    }
  };
  const share = async () => {
    try {
      await navigator.share({ text });
      onClose();
    } catch (err) {
      // the user closed the share sheet: nothing to do
      if ((err as Error)?.name !== 'AbortError') await copy();
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>{t('messageFamily')}</h2>
      <label className="field">
        <span>{t('messageEditable')}</span>
        <textarea
          ref={area}
          className="text-input"
          rows={6}
          value={text}
          data-testid="message-text"
          onChange={(ev) => setText(ev.target.value)}
        />
      </label>
      <div className="stack">
        {canShare && (
          <button className="btn share-btn" data-testid="message-share" onClick={share}>
            {t('messageShare')}
          </button>
        )}
        <button className="btn secondary" data-testid="message-copy" onClick={copy}>
          📋 {t('messageCopy')}
        </button>
        <button className="btn secondary" onClick={onClose}>
          {t('close')}
        </button>
      </div>
    </Modal>
  );
}
