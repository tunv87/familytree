import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { TopBar } from '../ui/components';
import { AccountRow } from './AccountRow';
import { setSettings, useSettings, type Lang } from './settings';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const t = useT();
  return (
    <div className="segmented">
      <button aria-pressed={value} onClick={() => onChange(true)}>
        {t('on')}
      </button>
      <button aria-pressed={!value} onClick={() => onChange(false)}>
        {t('off')}
      </button>
    </div>
  );
}

export function SettingsScreen() {
  const t = useT();
  const s = useSettings();
  const navigate = useNavigate();
  return (
    <main className="screen">
      <TopBar title={t('settings')} />
      <AccountRow />
      <div className="setting-row">
        <span>🔠 {t('bigText')}</span>
        <Toggle value={s.bigText} onChange={(bigText) => setSettings({ bigText })} />
      </div>
      <div className="setting-row">
        <span>🌐 {t('language')}</span>
        <div className="segmented">
          {(['vi', 'en'] as Lang[]).map((lang) => (
            <button key={lang} aria-pressed={s.lang === lang} onClick={() => setSettings({ lang })}>
              {lang === 'vi' ? 'Tiếng Việt' : 'English'}
            </button>
          ))}
        </div>
      </div>
      <div className="grow" />
      <button className="btn secondary" onClick={() => navigate('/debug')}>
        🪵 {t('debug')}
      </button>
      <div className="muted center" style={{ fontSize: 14 }}>
        v{__APP_VERSION__} · {__BUILD_TIME__}
      </div>
    </main>
  );
}
