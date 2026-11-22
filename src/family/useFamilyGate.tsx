import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentFamily } from '../data/current';
import { useT } from '../i18n';
import { TopBar } from '../ui/components';

/**
 * Renders `children(fam)` once the current family is loaded; otherwise a loading /
 * missing / no-family screen with the given title.
 */
export function FamilyGate({
  title,
  children,
}: {
  title: string;
  children: (fam: ReturnType<typeof useCurrentFamily>) => ReactNode;
}) {
  const fam = useCurrentFamily();
  const t = useT();
  const navigate = useNavigate();
  if (fam.status === 'ready' && fam.family) return <>{children(fam)}</>;
  const msg =
    fam.status === 'loading'
      ? t('loading')
      : fam.status === 'missing'
        ? t('familyMissing')
        : fam.status === 'error'
          ? t('familyError')
          : t('welcomeHint');
  return (
    <main className="screen">
      <TopBar title={title} />
      <div className="center grow">
        <div className="muted" data-testid="family-status">
          {msg}
        </div>
        {fam.status !== 'loading' && (
          <button className="btn secondary" onClick={() => navigate('/families')}>
            {t('switchFamily')}
          </button>
        )}
      </div>
    </main>
  );
}
