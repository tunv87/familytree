import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNav } from '../app/nav';
import { applyFamilyUpdates } from '../data/families';
import {
  descendantsAndSelf,
  lifespan,
  relinkUpdates,
  spousesOf,
  type People,
} from '../data/people';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';
import { DiscardConfirm, TopBar } from '../ui/components';
import { FamilyGate } from './useFamilyGate';

const log = createLogger('relations');

export function RelationsScreen() {
  const t = useT();
  return (
    <FamilyGate title={t('editRelations')}>
      {(fam) =>
        fam.isAdmin ? (
          <RelationsForm people={fam.people} generations={fam.generations} familyId={fam.id!} />
        ) : (
          <main className="screen">
            <TopBar title={t('editRelations')} />
            <div className="center grow muted">{t('viewOnly')}</div>
          </main>
        )
      }
    </FamilyGate>
  );
}

function label(people: People, gens: Record<string, number>, id: string): string {
  const p = people[id];
  const extra = [gens[id] ? `đời ${gens[id]}` : '', lifespan(p)].filter(Boolean).join(', ');
  return extra ? `${p.name} (${extra})` : p.name;
}

function RelationsForm({
  people,
  generations,
  familyId,
}: {
  people: People;
  generations: Record<string, number>;
  familyId: string;
}) {
  const t = useT();
  const nav = useNav();
  const { pid = '' } = useParams();
  const p = people[pid];
  const initial = useMemo(
    () => ({
      fatherId: p?.fatherId ?? '',
      motherId: p?.motherId ?? '',
      spouses: p ? spousesOf(people, pid) : [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pid],
  );
  const [rel, setRel] = useState(initial);
  const [addSpouse, setAddSpouse] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  if (!p)
    return (
      <main className="screen">
        <TopBar title={t('editRelations')} />
        <div className="center grow muted">{t('personMissing')}</div>
      </main>
    );

  const blocked = descendantsAndSelf(people, pid);
  const sorted = Object.keys(people).sort(
    (a, b) =>
      (generations[a] ?? 999) - (generations[b] ?? 999) ||
      people[a].name.localeCompare(people[b].name, 'vi'),
  );
  const fathers = sorted.filter((id) => !blocked.has(id) && people[id].gender !== 'f');
  const mothers = sorted.filter((id) => !blocked.has(id) && people[id].gender !== 'm');
  const spouseCandidates = sorted.filter((id) => id !== pid && !rel.spouses.includes(id));
  const dirty = JSON.stringify(rel) !== JSON.stringify(initial);

  const save = async () => {
    setBusy(true);
    setError(false);
    try {
      await applyFamilyUpdates(
        familyId,
        relinkUpdates(people, pid, {
          fatherId: rel.fatherId || undefined,
          motherId: rel.motherId || undefined,
          spouses: rel.spouses,
        }),
      );
      nav.goTo(`/p/${pid}`);
    } catch (e) {
      log.error('relink failed', e);
      setError(true);
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <TopBar
        title={t('editRelations')}
        onBack={() => (dirty ? setConfirmLeave(true) : nav.up())}
      />
      <div className="banner">{p.name}</div>
      <label className="field">
        <span>{t('father')}</span>
        <select
          className="text-input"
          value={rel.fatherId}
          data-testid="rel-father"
          onChange={(e) => setRel({ ...rel, fatherId: e.target.value })}
        >
          <option value="">— {t('unknown')} —</option>
          {fathers.map((id) => (
            <option key={id} value={id}>
              {label(people, generations, id)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{t('mother')}</span>
        <select
          className="text-input"
          value={rel.motherId}
          data-testid="rel-mother"
          onChange={(e) => setRel({ ...rel, motherId: e.target.value })}
        >
          <option value="">— {t('unknown')} —</option>
          {mothers.map((id) => (
            <option key={id} value={id}>
              {label(people, generations, id)}
            </option>
          ))}
        </select>
      </label>
      <div className="field">
        <span>{t('spouses')}</span>
        {rel.spouses.map((s) => (
          <div key={s} className="chip-row">
            <span className="grow">{label(people, generations, s)}</span>
            <button
              type="button"
              className="icon-btn small"
              aria-label={t('unlink')}
              data-testid={`unlink-${s}`}
              onClick={() => setRel({ ...rel, spouses: rel.spouses.filter((x) => x !== s) })}
            >
              ✕
            </button>
          </div>
        ))}
        <div className="inline-form">
          <select
            className="text-input"
            value={addSpouse}
            aria-label={t('pickExisting')}
            data-testid="rel-add-spouse"
            onChange={(e) => setAddSpouse(e.target.value)}
          >
            <option value="">{t('pickExisting')}</option>
            {spouseCandidates.map((id) => (
              <option key={id} value={id}>
                {label(people, generations, id)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn secondary"
            disabled={!addSpouse}
            data-testid="rel-add-spouse-btn"
            onClick={() => {
              setRel({ ...rel, spouses: [...rel.spouses, addSpouse] });
              setAddSpouse('');
            }}
          >
            ➕
          </button>
        </div>
      </div>
      <div className="muted small">{t('relationsHint')}</div>
      {error && <div className="error">{t('saveError')}</div>}
      <div className="action-bar">
        <button
          className="btn"
          disabled={!dirty || busy}
          data-testid="save-relations"
          onClick={save}
        >
          💾 {t('save')}
        </button>
      </div>
      {confirmLeave && (
        <DiscardConfirm onCancel={() => setConfirmLeave(false)} onConfirm={nav.up} />
      )}
    </main>
  );
}
