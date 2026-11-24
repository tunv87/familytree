import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { dateError, isEmpty } from '../data/dates';
import { applyFamilyUpdates, randomId } from '../data/families';
import { makeAvatar, savePhoto, useThumbs, type Avatar as AvatarData } from '../data/photos';
import {
  addPersonUpdates,
  editPersonUpdates,
  spousesOf,
  type NewPersonLinks,
  type People,
} from '../data/people';
import type { FamilyDate, Gender, Person } from '../data/types';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';
import { DateInput } from '../ui/DateInput';
import { GENDER_ICON } from '../ui/Avatar';
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
  order: string;
  deceased: boolean;
  birth: FamilyDate;
  death: FamilyDate;
  note: string;
  place: string;
}

function fromPerson(p: Person): FormState {
  return {
    name: p.name,
    gender: p.gender,
    order: p.order ? String(p.order) : '',
    deceased: Boolean(p.deceased),
    birth: p.birth ?? { cal: 's' },
    death: p.death ?? { cal: 'l' },
    note: p.note ?? '',
    place: p.place ?? '',
  };
}

function toPerson(f: FormState): Person {
  const n = (s: string) => (s.trim() ? Number(s) : undefined);
  return {
    name: f.name.trim(),
    gender: f.gender,
    order: n(f.order),
    deceased: f.deceased || undefined,
    birth: isEmpty(f.birth) ? undefined : f.birth,
    death: f.deceased && !isEmpty(f.death) ? f.death : undefined,
    note: f.note.trim() || undefined,
    place: f.place.trim() || undefined,
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
    return fromPerson({ name: '', gender });
    // only on first render: the form keeps its own state afterwards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [form, setForm] = useState<FormState>(initial);
  const [otherParent, setOtherParent] = useState<string>(parentSpouses[0] ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedThumb = useThumbs()[editId ?? ''];
  /** undefined = unchanged, null = remove the photo */
  const [photo, setPhoto] = useState<AvatarData | null | undefined>(undefined);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const shownThumb = photo === undefined ? savedThumb : photo?.thumb;
  const dirty = JSON.stringify(form) !== JSON.stringify(initial) || photo !== undefined;
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
        if (photo !== undefined) await savePhoto(familyId, editId, photo);
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
        if (photo) await savePhoto(familyId, id, photo);
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
            aria-describedby={error === t('required') ? 'name-error' : undefined}
            data-testid="name"
            onChange={(e) => set({ name: e.target.value })}
          />
          {error === t('required') && (
            <span className="error" id="name-error" data-testid="form-error" role="alert">
              {error}
            </span>
          )}
        </label>

        <div className="field">
          <span>{t('photo')}</span>
          <div className="photo-pick">
            {shownThumb ? (
              <img className="avatar photo" src={shownThumb} alt="" data-testid="form-photo" />
            ) : (
              <span className="avatar" aria-hidden>
                {GENDER_ICON[form.gender]}
              </span>
            )}
            <button
              type="button"
              className="btn secondary"
              disabled={photoBusy}
              data-testid="pick-photo"
              onClick={() => fileRef.current?.click()}
            >
              📷 {photoBusy ? t('photoWorking') : shownThumb ? t('changePhoto') : t('choosePhoto')}
            </button>
            {shownThumb && (
              <button
                type="button"
                className="link-btn"
                data-testid="remove-photo"
                onClick={() => setPhoto(null)}
              >
                {t('removePhoto')}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              data-testid="photo-file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setPhotoBusy(true);
                setPhotoError(null);
                const r = await makeAvatar(file);
                setPhotoBusy(false);
                if (typeof r === 'string') setPhotoError(t(`photo_${r}`));
                else setPhoto(r);
              }}
            />
          </div>
          {photoError && (
            <span className="error" role="alert" data-testid="photo-error">
              {photoError}
            </span>
          )}
        </div>

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

        <label className="field">
          <span>{t('order')}</span>
          <input
            className="text-input short"
            inputMode="numeric"
            maxLength={2}
            value={form.order}
            data-testid="order"
            aria-describedby="order-hint"
            onChange={(e) => set({ order: e.target.value.replace(/\D/g, '') })}
          />
          <span className="muted small" id="order-hint">
            {t('orderHint')}
          </span>
        </label>

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
          <span>{t('place')}</span>
          <input
            className="text-input"
            value={form.place}
            maxLength={120}
            placeholder={t('placeHint')}
            data-testid="place"
            onChange={(e) => set({ place: e.target.value })}
          />
        </label>

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

        {error && error !== t('required') && (
          <div className="error" data-testid="form-error" role="alert">
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
