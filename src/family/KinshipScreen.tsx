import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSettings } from '../app/settings';
import { kinship } from '../data/kinship';
import type { People } from '../data/people';
import { useT } from '../i18n';
import { TopBar } from '../ui/components';
import { FamilyGate } from './useFamilyGate';

/** "Gọi nhau thế nào": pick two people, see how each calls the other and how they're related. */
export function KinshipScreen() {
  const t = useT();
  return (
    <FamilyGate title={t('howToCall')}>
      {(fam) => <KinshipView people={fam.people} generations={fam.generations} />}
    </FamilyGate>
  );
}

function KinshipView({
  people,
  generations,
}: {
  people: People;
  generations: Record<string, number>;
}) {
  const t = useT();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { region } = useSettings();
  const a = people[params.get('a') ?? ''] ? params.get('a')! : '';
  const b = people[params.get('b') ?? ''] ? params.get('b')! : '';
  const pick = (key: 'a' | 'b', id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set(key, id);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const sorted = Object.keys(people).sort(
    (x, y) =>
      (generations[x] ?? 999) - (generations[y] ?? 999) ||
      people[x].name.localeCompare(people[y].name, 'vi'),
  );
  const label = (id: string) =>
    generations[id] ? `${people[id].name} (đời ${generations[id]})` : people[id].name;

  const select = (key: 'a' | 'b', value: string, title: string) => (
    <label className="field">
      <span>{title}</span>
      <select
        className="text-input"
        value={value}
        data-testid={`kin-${key}`}
        onChange={(e) => pick(key, e.target.value)}
      >
        <option value="">{t('choose')}</option>
        {sorted.map((id) => (
          <option key={id} value={id}>
            {label(id)}
          </option>
        ))}
      </select>
    </label>
  );

  const k = a && b && a !== b ? kinship(people, a, b, region) : null;
  // the other way round is worked out on its own: the words aren't always a mirror image
  const back = a && b && a !== b ? kinship(people, b, a, region) : null;
  return (
    <main className="screen">
      <TopBar title={t('howToCall')} />
      {select('a', a, t('personA'))}
      {select('b', b, t('personB'))}
      {!a || !b ? (
        <div className="muted center">{t('pickTwo')}</div>
      ) : a === b ? (
        <div className="muted center">{t('samePerson')}</div>
      ) : !k ? (
        <div className="muted center" data-testid="kin-none">
          {t('noRelationPair')}
        </div>
      ) : (
        <div className="kin-result" data-testid="kin-result">
          <div data-testid="kin-a-calls-b">
            {t('callsAs', { a: people[a].name, b: people[b].name })}{' '}
            <strong className="kin-word">{k.call}</strong>, {t('selfAs')}{' '}
            <strong className="kin-word">{k.self}</strong>
            {k.childCall && (
              <div className="muted small">{t('childCallNote', { word: k.childCall })}</div>
            )}
          </div>
          {back && (
            <div data-testid="kin-b-calls-a">
              {t('callsAs', { a: people[b].name, b: people[a].name })}{' '}
              <strong className="kin-word">{back.call}</strong>, {t('selfAs')}{' '}
              <strong className="kin-word">{back.self}</strong>
              {back.childCall && (
                <div className="muted small">{t('childCallNote', { word: back.childCall })}</div>
              )}
            </div>
          )}
          <div className="muted small">
            {people[b].name}: {k.relation}
          </div>
          <div className="section-title">{t('relationPath')}</div>
          <div className="kin-path" data-testid="kin-path">
            {k.path.map((id, i) => (
              <span key={id + i} className="kin-step">
                {i > 0 && <span aria-hidden>→ </span>}
                <button className="chip" onClick={() => navigate(`/p/${id}`)}>
                  {people[id].name}
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
