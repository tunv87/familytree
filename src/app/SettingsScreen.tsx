import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { TopBar } from '../ui/components';
import { AccountRow } from './AccountRow';
import { useCurrentFamily } from '../data/current';
import type { Region } from '../data/kinship';
import { setMe, setSettings, useSettings, type Lang } from './settings';

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
      <div className="setting-row column">
        <span>🗣️ {t('region')}</span>
        <div className="segmented">
          {(
            [
              ['trung', t('regionTrung')],
              ['bac', t('regionBac')],
              ['nam', t('regionNam')],
            ] as [Region, string][]
          ).map(([region, label]) => (
            <button
              key={region}
              aria-pressed={s.region === region}
              data-testid={`region-${region}`}
              onClick={() => setSettings({ region })}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="muted small">{t('regionHint')}</span>
      </div>
      <MeRow />
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

/** "Tôi là: …" for the family open on this device (set from a person's page). */
function MeRow() {
  const t = useT();
  const fam = useCurrentFamily();
  const { me } = useSettings();
  const navigate = useNavigate();
  const id = fam.id ? me?.[fam.id] : undefined;
  if (!fam.id || !id || !fam.people[id]) return null;
  return (
    <div className="setting-row" data-testid="me-row">
      <span>
        👤 {t('iAm')}{' '}
        <button className="link-btn" onClick={() => navigate(`/p/${id}`)}>
          {fam.people[id].name}
        </button>
      </span>
      <button
        className="link-btn"
        data-testid="settings-unset-me"
        onClick={() => setMe(fam.id!, null)}
      >
        {t('notMe')}
      </button>
    </div>
  );
}
