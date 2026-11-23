import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { dateError, isEmpty } from '../data/dates';
import { applyFamilyUpdates, randomId } from '../data/families';
import {
  addPersonUpdates,
  editPersonUpdates,
  spousesOf,
  suggestGeneration,
  type NewPersonLinks,
  type People,
} from '../data/people';
import type { FamilyDate, Gender, Person } from '../data/types';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';
import { DateInput } from '../ui/DateInput';
import { DiscardConfirm, TopBar } from '../ui/components';
import { FamilyGate } from './useFamilyGate';

const log = createLogger('person-form');

export function PersonFormScreen() {
  const t = useT();
  const { pid } = useParams();
  return (
    <FamilyGate title={pid ? t('editPerson') : t('newPerson')}>
      {(fam) =>
        fam.isAdmin ? (
          <PersonForm people={fam.people} familyId={fam.id!} editId={pid} />
        ) : (
          <main className="screen">
            <TopBar title={t('newPerson')} />
            <div className="center grow muted">{t('viewOnly')}</div>
          </main>
        )
      }
    </FamilyGate>
  );
}

interface FormState {
  name: string;
  gender: Gender;
  generation: string;
  order: string;
  deceased: boolean;
  birth: FamilyDate;
  death: FamilyDate;
  note: string;
}

function fromPerson(p: Person): FormState {
  return {
    name: p.name,
    gender: p.gender,
    generation: p.generation ? String(p.generation) : '',
    order: p.order ? String(p.order) : '',
    deceased: Boolean(p.deceased),
    birth: p.birth ?? { cal: 's' },
    death: p.death ?? { cal: 'l' },
    note: p.note ?? '',
  };
}

function toPerson(f: FormState): Person {
  const n = (s: string) => (s.trim() ? Number(s) : undefined);
  return {
    name: f.name.trim(),
    gender: f.gender,
    generation: n(f.generation),
    order: n(f.order),
    deceased: f.deceased || undefined,
    birth: isEmpty(f.birth) ? undefined : f.birth,
    death: f.deceased && !isEmpty(f.death) ? f.death : undefined,
    note: f.note.trim() || undefined,
  };
}

const opposite = (g?: Gender): Gender => (g === 'm' ? 'f' : g === 'f' ? 'm' : 'u');

function PersonForm({
  people,
  familyId,
  editId,
}: {
  people: People;
  familyId: string;
  editId?: string;
}) {
  const t = useT();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const parentId = params.get('parent') ?? undefined;
  const spouseId = params.get('spouse') ?? undefined;
  const childId = params.get('child') ?? undefined;
  const first = params.get('first') === '1';
  const parent = parentId ? people[parentId] : undefined;
  const parentSpouses = parentId ? spousesOf(people, parentId) : [];

  const initial = useMemo<FormState>(() => {
    if (editId && people[editId]) return fromPerson(people[editId]);
    const gender: Gender =
      (params.get('gender') as Gender | null) ??
      (spouseId ? opposite(people[spouseId]?.gender) : 'm');
    const gen = first ? 1 : suggestGeneration(people, { parentId, spouseId, childId });
    return {
      ...fromPerson({ name: '', gender }),
      generation: gen ? String(gen) : '',
    };
    // only on first render: the form keeps its own state afterwards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [form, setForm] = useState<FormState>(initial);
  const [otherParent, setOtherParent] = useState<string>(parentSpouses[0] ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const context = parentId
    ? t('childOf', { names: parent?.name ?? '' })
    : spouseId
      ? t('spouseOf', { name: people[spouseId]?.name ?? '' })
      : childId
        ? t('parentOf', { name: people[childId]?.name ?? '' })
        : null;

  const problem = !form.name.trim()
    ? t('required')
    : (dateError(form.birth) ?? (form.deceased ? dateError(form.death) : null));

  const save = async () => {
    if (problem) {
      setError(problem);
      if (!form.name.trim()) nameRef.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    const person = toPerson(form);
    const now = Date.now();
    try {
      if (editId) {
        await applyFamilyUpdates(familyId, editPersonUpdates(people, editId, person, now));
        navigate(-1);
      } else {
        const id = randomId(12);
        const links: NewPersonLinks = { spouseId, childId };
        if (parentId) {
          const isMother = parent?.gender === 'f';
          links.fatherId = isMother ? otherParent || undefined : parentId;
          links.motherId = isMother ? parentId : otherParent || undefined;
        }
        await applyFamilyUpdates(familyId, addPersonUpdates(people, id, person, links, now));
        navigate(`/p/${id}`, { replace: true });
      }
    } catch (e) {
      log.error('save failed', e);
      setError(t('saveError'));
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <TopBar
        title={editId ? t('editPerson') : first ? t('addFirst') : t('newPerson')}
        onBack={() => (dirty ? setConfirmLeave(true) : navigate(-1))}
      />
      {context && <div className="banner">{context}</div>}
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="field">
          <span>{t('fullName')} *</span>
          <input
            className="text-input"
            value={form.name}
            maxLength={100}
            autoFocus={!editId}
            ref={nameRef}
            aria-invalid={error === t('required') || undefined}
            data-testid="name"
            onChange={(e) => set({ name: e.target.value })}
          />
        </label>

        <div className="field">
          <span>{t('gender')}</span>
          <div className="segmented">
            {(
              [
                ['m', t('male')],
                ['f', t('female')],
                ['u', t('unknown')],
              ] as const
            ).map(([g, label]) => (
              <button
                type="button"
                key={g}
                aria-pressed={form.gender === g}
                data-testid={`gender-${g}`}
                onClick={() => set({ gender: g })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {parentId && parentSpouses.length > 0 && (
          <label className="field">
            <span>{t('otherParent')}</span>
            <select
              className="text-input"
              value={otherParent}
              data-testid="other-parent"
              onChange={(e) => setOtherParent(e.target.value)}
            >
              {parentSpouses.map((s) => (
                <option key={s} value={s}>
                  {people[s].name}
                </option>
              ))}
              <option value="">{t('unknown')}</option>
            </select>
          </label>
        )}

        <div className="row2">
          <label className="field">
            <span>{t('generationLabel')}</span>
            <input
              className="text-input"
              inputMode="numeric"
              maxLength={2}
              value={form.generation}
              data-testid="generation"
              onChange={(e) => set({ generation: e.target.value.replace(/\D/g, '') })}
            />
          </label>
          <label className="field">
            <span>{t('order')}</span>
            <input
              className="text-input"
              inputMode="numeric"
              maxLength={2}
              value={form.order}
              data-testid="order"
              onChange={(e) => set({ order: e.target.value.replace(/\D/g, '') })}
            />
          </label>
        </div>

        <div className="field">
          <span>{t('birthDate')}</span>
          <DateInput value={form.birth} onChange={(birth) => set({ birth })} testId="birth" />
        </div>

        <div className="field">
          <span>{t('status')}</span>
          <div className="segmented">
            <button
              type="button"
              aria-pressed={!form.deceased}
              onClick={() => set({ deceased: false })}
            >
              {t('alive')}
            </button>
            <button
              type="button"
              aria-pressed={form.deceased}
              data-testid="deceased"
              onClick={() => set({ deceased: true })}
            >
              {t('deceased')}
            </button>
          </div>
        </div>

        {form.deceased && (
          <div className="field">
            <span>{t('deathDate')}</span>
            <DateInput value={form.death} onChange={(death) => set({ death })} testId="death" />
            <span className="muted small">{t('deathHint')}</span>
          </div>
        )}

        <label className="field">
          <span>{t('note')}</span>
          <textarea
            className="text-input"
            rows={3}
            maxLength={2000}
            value={form.note}
            onChange={(e) => set({ note: e.target.value })}
          />
        </label>

        {error && (
          <div className="error" data-testid="form-error">
            {error}
          </div>
        )}
        <button className="btn" disabled={busy} data-testid="save">
          💾 {t('save')}
        </button>
      </form>
      {confirmLeave && (
        <DiscardConfirm onCancel={() => setConfirmLeave(false)} onConfirm={() => navigate(-1)} />
      )}
    </main>
  );
}
