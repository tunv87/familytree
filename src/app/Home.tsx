import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentFamily } from '../data/current';
import { useT } from '../i18n';
import { Card, TopBar } from '../ui/components';

export function Home() {
  const t = useT();
  const navigate = useNavigate();
  const fam = useCurrentFamily();
  const taps = useRef<number[]>([]);
  // Hidden shortcut: tap the title 5 times quickly to open the debug log.
  const onTitleTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((x) => now - x < 2000), now];
    if (taps.current.length >= 5) navigate('/debug');
  };
  const settings = (
    <button className="icon-btn" aria-label={t('settings')} onClick={() => navigate('/settings')}>
      ⚙️
    </button>
  );
  const switchBtn = (
    <button
      className="icon-btn"
      aria-label={t('switchFamily')}
      onClick={() => navigate('/families')}
    >
      📚
    </button>
  );

  if (fam.status !== 'ready' || !fam.family) {
    return (
      <main className="screen">
        <TopBar
          noBack
          left={switchBtn}
          title={t('appName')}
          onTitleTap={onTitleTap}
          right={settings}
        />
        <div className="center" style={{ padding: '16px 0' }}>
          <div style={{ fontSize: '4em' }} aria-hidden>
            🌳
          </div>
          <div className="muted" data-testid="family-status">
            {fam.status === 'loading'
              ? t('loading')
              : fam.status === 'missing'
                ? t('familyMissing')
                : fam.status === 'error'
                  ? t('familyError')
                  : t('welcomeHint')}
          </div>
        </div>
        <div className="grow" />
        <Card
          emoji="➕"
          title={t('newFamily')}
          hint={t('newFamilyHint')}
          onClick={() => navigate('/new-family')}
          testId="home-new-family"
        />
        <Card
          emoji="📚"
          title={t('myFamilies')}
          onClick={() => navigate('/families')}
          testId="home-families"
        />
      </main>
    );
  }

  const count = Object.keys(fam.people).length;
  return (
    <main className="screen">
      <TopBar
        noBack
        left={switchBtn}
        title={fam.family.meta.name}
        onTitleTap={onTitleTap}
        right={settings}
      />
      {fam.fromCache && <div className="banner">📴 {t('offlineCopy')}</div>}
      <div className="home-grid">
        <Card
          className="home-card"
          testId="home-tree"
          emoji="🌳"
          title={t('tree')}
          hint={t('treeHint')}
          onClick={() => navigate('/tree')}
        />
        <Card
          className="home-card"
          testId="home-calendar"
          emoji="📅"
          title={t('calendar')}
          hint={t('calendarHint')}
          onClick={() => navigate('/calendar')}
        />
      </div>
      <Card
        emoji="📋"
        title={t('people')}
        hint={`${t('peopleCount', { n: count })} · ${t('peopleHint')}`}
        onClick={() => navigate('/people')}
        testId="home-people"
      />
      <div className="grow" />
      <Card
        emoji="📨"
        title={t('invite')}
        hint={t('inviteHint')}
        onClick={() => navigate('/invite')}
        testId="home-invite"
      />
    </main>
  );
}
