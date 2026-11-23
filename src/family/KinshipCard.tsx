import { useNavigate } from 'react-router-dom';
import { setMe, useSettings } from '../app/settings';
import { kinship } from '../data/kinship';
import type { People } from '../data/people';
import { useT } from '../i18n';

/** On a person's page: what I call them and what I call myself ("Bạn gọi là Chú · xưng cháu"). */
export function KinshipCard({
  people,
  familyId,
  pid,
}: {
  people: People;
  familyId: string;
  pid: string;
}) {
  const t = useT();
  const navigate = useNavigate();
  const { me: meMap, region } = useSettings();
  const me = meMap?.[familyId];
  const known = Boolean(me && people[me]);

  if (!known)
    return (
      <div className="kin-card" data-testid="kinship">
        <span className="muted small">{t('whoAreYou')}</span>
        <button
          className="btn secondary small-btn"
          data-testid="set-me"
          onClick={() => setMe(familyId, pid)}
        >
          {t('setMe')}
        </button>
      </div>
    );

  if (me === pid)
    return (
      <div className="kin-card" data-testid="kinship">
        <strong>👤 {t('thisIsYou')}</strong>
        <button className="link-btn" data-testid="unset-me" onClick={() => setMe(familyId, null)}>
          {t('notMe')}
        </button>
      </div>
    );

  const k = kinship(people, me!, pid, region);
  return (
    <div className="kin-card" data-testid="kinship">
      {k ? (
        <>
          <div data-testid="kinship-call">
            {t('youCall')} <strong className="kin-word">{k.call}</strong> · {t('youSelf')}{' '}
            <strong className="kin-word">{k.self}</strong>
          </div>
          <div className="muted small" data-testid="kinship-relation">
            {k.relation}
          </div>
        </>
      ) : (
        <div className="muted" data-testid="kinship-none">
          {t('noRelation')}
        </div>
      )}
      <button
        className="link-btn"
        data-testid="how-to-call"
        onClick={() => navigate(`/kinship?a=${me}&b=${pid}`)}
      >
        {t('howToCall')} ›
      </button>
    </div>
  );
}
