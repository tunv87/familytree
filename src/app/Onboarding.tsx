/**
 * Hướng dẫn khi mở link lần đầu (Đợt 1, 3 bước trên mock):
 *  1. "Đây là gia phả họ …" — what this is, that it's view-only and needs no account;
 *  2. "Bạn là ai trong gia phả?" — pick yourself, so every page shows how to address people;
 *  3. "Đặt gia phả ra màn hình điện thoại" — Add to Home Screen, with steps for iPhone/Android.
 * Every step has "Để sau". Shown once per family on this phone.
 */
import { useMemo, useState } from 'react';
import type { CurrentFamily } from '../data/current';
import { searchPeople } from '../data/people';
import { useT } from '../i18n';
import { Avatar } from '../ui/Avatar';
import { setMe } from './settings';

const KEY = 'ft:onboarded';

function storageWorks(): boolean {
  try {
    localStorage.setItem('ft:probe', '1');
    localStorage.removeItem('ft:probe');
    return true;
  } catch {
    return false;
  }
}

function doneMap(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

/** Whether to show the guide for this family on this phone (never when storage is blocked:
 *  it could not remember that it was seen and would come back every time). */
export function needsOnboarding(familyId: string): boolean {
  if (!storageWorks()) return false;
  const done = doneMap();
  return !done.all && !done[familyId];
}

export function markOnboarded(familyId: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...doneMap(), [familyId]: true }));
  } catch {
    // storage blocked: nothing to remember
  }
}

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

export function Onboarding({
  fam,
  onDone,
}: {
  fam: CurrentFamily & { isAdmin: boolean };
  onDone: () => void;
}) {
  const t = useT();
  const steps = isStandalone() ? 2 : 3;
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [os, setOs] = useState<'ios' | 'android'>(isIos() ? 'ios' : 'android');
  const people = fam.people;
  const count = Object.keys(people).length;
  const generations = new Set(Object.values(fam.generations)).size;
  const results = useMemo(
    () => (query.trim() ? searchPeople(people, query, fam.generations).slice(0, 5) : []),
    [people, query, fam.generations],
  );

  const finish = () => {
    markOnboarded(fam.id!);
    onDone();
  };
  const next = () => (step >= steps ? finish() : setStep(step + 1));

  const parentLine = (id: string) => {
    const p = people[id];
    const gen = fam.generations[id] ? t('generationShort', { n: fam.generations[id] }) : '';
    const father = p.fatherId && people[p.fatherId];
    const mother = p.motherId && people[p.motherId];
    const of = father
      ? t('childOfFather', { name: father.name })
      : mother
        ? t('childOfMother', { name: mother.name })
        : '';
    return [gen, of].filter(Boolean).join(' · ');
  };

  return (
    <main className="screen onboarding" data-testid="onboarding">
      <div className="onb-top">
        <span className="onb-step">{t('stepOf', { n: step, total: steps })}</span>
        <button className="link-btn" data-testid="onb-later" onClick={finish}>
          {t('later')}
        </button>
      </div>

      {step === 1 && (
        <>
          <div className="onb-hero" aria-hidden>
            🌳
          </div>
          <h1 className="onb-title center">{fam.family!.meta.name}</h1>
          <p className="onb-text center">{t('onbInvited')}</p>
          <div className="onb-chips">
            <span className="onb-chip">{t('peopleCount', { n: count })}</span>
            {generations > 0 && (
              <span className="onb-chip">{t('generationsCount', { n: generations })}</span>
            )}
          </div>
          <div className="grow" />
          {!fam.isAdmin && <p className="muted center">{t('onbViewOnly')}</p>}
          <button className="btn onb-main" data-testid="onb-next" onClick={next}>
            {t('continue')}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="onb-title">{t('onbWhoAreYou')}</h1>
          <p className="muted">{t('onbWhoHint')}</p>
          <label className="field">
            <span>{t('onbTypeName')}</span>
            <input
              className="text-input"
              type="search"
              value={query}
              autoFocus
              data-testid="onb-search"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="list">
            {results.map((id) => (
              <button
                key={id}
                className="person-row"
                data-testid={`onb-pick-${id}`}
                onClick={() => {
                  setMe(fam.id!, id);
                  next();
                }}
              >
                <Avatar id={id} person={people[id]} />
                <span className="grow">
                  <span className="name">{people[id].name}</span>
                  <span className="sub">{parentLine(id)}</span>
                </span>
              </button>
            ))}
            {query.trim() && results.length === 0 && (
              <div className="muted center">{t('noResults')}</div>
            )}
          </div>
          <div className="grow" />
          <button className="btn secondary" data-testid="onb-not-in-tree" onClick={next}>
            {t('onbNotInTree')}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="onb-title">{t('onbInstallTitle')}</h1>
          <p className="muted">{t('onbInstallHint')}</p>
          <div className="segmented">
            <button aria-pressed={os === 'ios'} onClick={() => setOs('ios')} data-testid="onb-ios">
              iPhone
            </button>
            <button
              aria-pressed={os === 'android'}
              onClick={() => setOs('android')}
              data-testid="onb-android"
            >
              Android
            </button>
          </div>
          <ol className="onb-steps" data-testid="onb-install-steps">
            {(os === 'ios'
              ? [t('onbIos1'), t('onbIos2'), t('onbIos3')]
              : [t('onbAndroid1'), t('onbAndroid2'), t('onbAndroid3')]
            ).map((s, i) => (
              <li key={i}>
                <span className="onb-num" aria-hidden>
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="muted small">{os === 'ios' ? t('onbZaloIos') : t('onbZaloAndroid')}</p>
          <div className="grow" />
          <button className="btn onb-main" data-testid="onb-done" onClick={finish}>
            {t('onbDone')}
          </button>
        </>
      )}
    </main>
  );
}
