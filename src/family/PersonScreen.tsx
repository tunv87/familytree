import { useRef, useState } from 'react';
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
import { makeAvatar, savePhoto } from '../data/photos';
import { BigAvatar } from '../ui/Avatar';
import { PersonRow } from '../ui/PersonRow';
import { showToast } from '../ui/toast';
import { KinshipCard } from './KinshipCard';
import { FamilyGate } from './useFamilyGate';

const log = createLogger('person');

export function PersonScreen() {
  const t = useT();
  return (
    <FamilyGate title="">
      {(fam) => (
        <PersonView
          people={fam.people}
          generations={fam.generations}
          familyId={fam.id!}
          isAdmin={fam.isAdmin}
          t={t}
        />
      )}
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
  generations,
  familyId,
  isAdmin,
  t,
}: {
  people: People;
  generations: Record<string, number>;
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
        <div className="profile-photo">
          <BigAvatar id={pid} person={p} />
          {isAdmin && <ChangePhoto familyId={familyId} pid={pid} t={t} />}
        </div>
        <h2 data-testid="person-name">{p.name}</h2>
        <div className="muted">
          {[
            generations[pid] ? t('generation', { n: generations[pid] }) : t('notLinked'),
            p.deceased && t('deceased'),
          ]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
      <KinshipCard people={people} familyId={familyId} pid={pid} />
      <div className="detail-card">
        <DateLine label={t('born')} date={p.birth} />
        <DateLine label={t('died')} date={p.death} />
        {p.place && (
          <div className="detail highlight" data-testid="person-place">
            <span className="label">📍 {t('place')}</span>
            <span>{p.place}</span>
          </div>
        )}
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

      <div className="row2">
        <button
          className="btn secondary"
          data-testid="show-on-tree"
          onClick={() => navigate(`/tree?focus=${pid}`)}
        >
          🌳 {t('showOnTree')}
        </button>
        <button
          className="btn secondary"
          data-testid="show-branch"
          onClick={() => navigate(`/tree?root=${pid}`)}
        >
          🌿 {t('showBranch')}
        </button>
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
            className="btn secondary"
            data-testid="edit-relations"
            onClick={() => navigate(`/relations/${pid}`)}
          >
            🔗 {t('editRelations')}
          </button>
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
                  // their photo goes too (kept outside the family node)
                  savePhoto(familyId, pid, null).catch((e) => log.warn('photo not removed', e));
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

/** "Đổi ảnh" on the photo (admins): pick a picture and save it straight away. */
function ChangePhoto({
  familyId,
  pid,
  t,
}: {
  familyId: string;
  pid: string;
  t: ReturnType<typeof useT>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button
        className="photo-change"
        disabled={busy}
        data-testid="change-photo"
        onClick={() => fileRef.current?.click()}
      >
        📷 {busy ? t('photoWorking') : t('changePhoto')}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        data-testid="profile-photo-file"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setBusy(true);
          try {
            const r = await makeAvatar(file);
            if (typeof r === 'string') showToast(t(`photo_${r}`));
            else if ((await savePhoto(familyId, pid, r)) === 'saved') showToast(t('photoSaved'));
          } catch (err) {
            log.error('photo save failed', err);
            showToast(t('saveError'));
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}
