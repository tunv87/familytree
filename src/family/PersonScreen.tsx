import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applyFamilyUpdates } from '../data/families';
import {
  daysBetween,
  formatFamilyDate,
  nextBirthday,
  nextDeathAnniversary,
  otherCalendarText,
  todaySolar,
} from '../data/dates';
import {
  childrenOf,
  deletePersonUpdates,
  parentsOf,
  siblingsOf,
  spousesOf,
  type People,
} from '../data/people';
import type { FamilyDate } from '../data/types';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';
import { Modal, TopBar } from '../ui/components';
import { GENDER_ICON, PersonRow } from '../ui/PersonRow';
import { FamilyGate } from './useFamilyGate';

const log = createLogger('person');

export function PersonScreen() {
  const t = useT();
  return (
    <FamilyGate title="">
      {(fam) => <PersonView people={fam.people} familyId={fam.id!} isAdmin={fam.isAdmin} t={t} />}
    </FamilyGate>
  );
}

function DateLine({ label, date }: { label: string; date?: FamilyDate }) {
  const text = formatFamilyDate(date);
  if (!text) return null;
  const other = otherCalendarText(date);
  return (
    <div className="detail">
      <span className="label">{label}</span>
      <span>
        {text}
        {other && <div className="muted small">= {other}</div>}
      </span>
    </div>
  );
}

function PersonView({
  people,
  familyId,
  isAdmin,
  t,
}: {
  people: People;
  familyId: string;
  isAdmin: boolean;
  t: ReturnType<typeof useT>;
}) {
  const { pid = '' } = useParams();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(false);
  const p = people[pid];
  if (!p)
    return (
      <main className="screen">
        <TopBar title="" />
        <div className="center grow muted">{t('personMissing')}</div>
      </main>
    );
  const today = todaySolar();
  const when = (d: { day: number; month: number; year: number }) => {
    const n = daysBetween(today, d);
    return t(n === 0 ? 'today' : 'inDays', { n });
  };
  const gio = p.deceased ? nextDeathAnniversary(p.death, today) : null;
  const bday = !p.deceased ? nextBirthday(p.birth, today) : null;
  const parents = parentsOf(people, pid);
  const spouses = spousesOf(people, pid);
  const children = childrenOf(people, pid);
  const siblings = siblingsOf(people, pid);
  const childGenderLabel = (id: string) =>
    people[id].order ? `con thứ ${people[id].order}` : undefined;
  return (
    <main className="screen">
      <TopBar
        title=""
        right={
          isAdmin ? (
            <button
              className="icon-btn"
              aria-label={t('edit')}
              data-testid="edit-person"
              onClick={() => navigate(`/edit/${pid}`)}
            >
              ✏️
            </button>
          ) : undefined
        }
      />
      <div className="profile-head">
        <span className="avatar big" aria-hidden>
          {GENDER_ICON[p.gender]}
        </span>
        <h2 data-testid="person-name">{p.name}</h2>
        <div className="muted">
          {[p.generation && t('generation', { n: p.generation }), p.deceased && t('deceased')]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
      <div className="detail-card">
        <DateLine label={t('born')} date={p.birth} />
        <DateLine label={t('died')} date={p.death} />
        {gio && (
          <div className="detail highlight" data-testid="next-gio">
            <span className="label">🕯️ {t('gio')}</span>
            <span>
              {gio.day}/{gio.month}/{gio.year} · {when(gio)}
            </span>
          </div>
        )}
        {bday && (
          <div className="detail">
            <span className="label">🎂</span>
            <span>
              {bday.day}/{bday.month}/{bday.year} · {when(bday)}
            </span>
          </div>
        )}
        {p.note && (
          <div className="detail">
            <span className="label">{t('note')}</span>
            <span className="pre">{p.note}</span>
          </div>
        )}
      </div>

      <Relatives title={t('parents')} ids={parents} people={people} />
      <Relatives title={t('spouses')} ids={spouses} people={people} />
      <Relatives title={t('children')} ids={children} people={people} label={childGenderLabel} />
      <Relatives title={t('siblings')} ids={siblings} people={people} />

      {isAdmin && (
        <div className="action-grid">
          <button
            className="btn secondary"
            data-testid="add-child"
            onClick={() => navigate(`/add?parent=${pid}`)}
          >
            👶 {t('addChild')}
          </button>
          <button
            className="btn secondary"
            data-testid="add-spouse"
            onClick={() => navigate(`/add?spouse=${pid}`)}
          >
            💍 {t('addSpouse')}
          </button>
          {!p.fatherId && (
            <button
              className="btn secondary"
              data-testid="add-father"
              onClick={() => navigate(`/add?child=${pid}&gender=m`)}
            >
              👨 {t('addFather')}
            </button>
          )}
          {!p.motherId && (
            <button
              className="btn secondary"
              data-testid="add-mother"
              onClick={() => navigate(`/add?child=${pid}&gender=f`)}
            >
              👩 {t('addMother')}
            </button>
          )}
          <button
            className="btn secondary danger"
            data-testid="delete-person"
            onClick={() => setConfirmDelete(true)}
          >
            🗑️ {t('delete')}
          </button>
        </div>
      )}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)}>
          <h2>{t('deleteConfirm', { name: p.name })}</h2>
          <div className="muted">{t('deleteHint')}</div>
          {error && <div className="error">{t('saveError')}</div>}
          <div className="stack">
            <button className="btn" onClick={() => setConfirmDelete(false)}>
              {t('cancel')}
            </button>
            <button
              className="btn secondary danger"
              data-testid="confirm-delete"
              onClick={async () => {
                try {
                  await applyFamilyUpdates(familyId, deletePersonUpdates(people, pid));
                  navigate(-1);
                } catch (e) {
                  log.error('delete failed', e);
                  setError(true);
                }
              }}
            >
              🗑️ {t('delete')}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function Relatives({
  title,
  ids,
  people,
  label,
}: {
  title: string;
  ids: string[];
  people: People;
  label?: (id: string) => string | undefined;
}) {
  if (ids.length === 0) return null;
  return (
    <section className="list">
      <h3 className="section-title">{title}</h3>
      {ids.map((id) => (
        <PersonRow key={id} id={id} person={people[id]} label={label?.(id)} />
      ))}
    </section>
  );
}
