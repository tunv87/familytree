import { useT, type MessageKey } from '../i18n';
import { TopBar } from '../ui/components';

/** Placeholder for screens that are still being built. */
export function ComingSoon({ title }: { title: MessageKey }) {
  const t = useT();
  return (
    <main className="screen">
      <TopBar title={t(title)} />
      <div className="center grow">
        <div style={{ fontSize: '3em' }} aria-hidden>
          🚧
        </div>
        <div className="muted" data-testid="coming-soon">
          {t('comingSoon')}
        </div>
      </div>
    </main>
  );
}
