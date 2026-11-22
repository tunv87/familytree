import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AccountRow } from '../app/AccountRow';
import { forgetRecent, getCurrentId, openFamily, recentFamilies } from '../data/current';
import { createFamily, myFamilies } from '../data/families';
import { useAuth } from '../data/firebase';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';
import { Card, TopBar } from '../ui/components';

const log = createLogger('families');

/** /f/:fid — opening a share link remembers the family on this device. */
export function OpenFamilyLink() {
  const { fid } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (fid) openFamily(fid);
    navigate('/', { replace: true });
  }, [fid, navigate]);
  return null;
}

export function FamiliesScreen() {
  const t = useT();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [list, setList] = useState<Record<string, string>>(recentFamilies);
  const current = getCurrentId();
  useEffect(() => {
    if (!isAdmin) return;
    myFamilies()
      .then((mine) => setList((l) => ({ ...l, ...mine })))
      .catch((e) => log.warn('list failed', String(e)));
  }, [isAdmin, user?.uid]);
  return (
    <main className="screen">
      <TopBar title={t('myFamilies')} />
      {!isAdmin && <AccountRow />}
      <div className="stack">
        {Object.entries(list).map(([id, name]) => (
          <Card
            key={id}
            emoji="🌳"
            title={name}
            hint={id === current ? t('opened') : undefined}
            testId={`family-${id}`}
            onClick={() => {
              openFamily(id);
              navigate('/');
            }}
          />
        ))}
      </div>
      <div className="grow" />
      <Card
        emoji="➕"
        title={t('newFamily')}
        onClick={() => navigate('/new-family')}
        testId="families-new"
      />
      {current && (
        <button
          className="btn secondary"
          onClick={() => {
            forgetRecent(current);
            openFamily(null);
            navigate('/');
          }}
        >
          {t('closeFamily')}
        </button>
      )}
    </main>
  );
}

export function NewFamilyScreen() {
  const t = useT();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const valid = name.trim().length > 0 && name.trim().length <= 80;
  return (
    <main className="screen">
      <TopBar title={t('newFamily')} />
      {!isAdmin ? (
        <>
          <div className="muted center">{t('needSignIn')}</div>
          <AccountRow />
        </>
      ) : (
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!valid) return;
            setBusy(true);
            setError(false);
            try {
              const id = await createFamily(name.trim());
              openFamily(id);
              navigate('/add?first=1', { replace: true });
            } catch (err) {
              log.error('create failed', err);
              setError(true);
              setBusy(false);
            }
          }}
        >
          <label className="field">
            <span>{t('familyName')}</span>
            <input
              className="text-input"
              value={name}
              maxLength={80}
              placeholder={t('familyNamePlaceholder')}
              onChange={(e) => setName(e.target.value)}
              data-testid="family-name"
              autoFocus
            />
          </label>
          {error && <div className="error">{t('saveError')}</div>}
          <button className="btn" disabled={!valid || busy} data-testid="create-family">
            {t('create')}
          </button>
        </form>
      )}
    </main>
  );
}
