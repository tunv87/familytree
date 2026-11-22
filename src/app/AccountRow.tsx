import { useState } from 'react';
import { isFirebaseConfigured, signInWithGoogle, signOut, useAuth } from '../data/firebase';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';

const log = createLogger('account');

export function AccountRow() {
  const t = useT();
  if (!isFirebaseConfigured) return <div className="setting-row muted">{t('notConfigured')}</div>;
  return <SignedInState />;
}

function SignedInState() {
  const t = useT();
  const { ready, user, isAdmin } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(false);
    try {
      await fn();
    } catch (e) {
      log.error('sign-in failed', e);
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="setting-row account-row" data-testid="account">
      <div className="grow">
        <div style={{ fontWeight: 700 }}>👤 {t('account')}</div>
        <div className="muted" style={{ fontSize: '0.85em' }}>
          {isAdmin
            ? t('signedInAs', { name: user!.displayName || user!.email || '' })
            : t('accountHint')}
        </div>
        {error && <div className="error">{t('signInError')}</div>}
      </div>
      {isAdmin ? (
        <button className="btn secondary" disabled={busy} onClick={() => run(signOut)}>
          {t('signOut')}
        </button>
      ) : (
        <button
          className="btn"
          disabled={!ready || busy}
          data-testid="sign-in-google"
          onClick={() => run(signInWithGoogle)}
        >
          {t('signInGoogle')}
        </button>
      )}
    </div>
  );
}
