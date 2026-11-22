import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { Card, TopBar } from '../ui/components';

export function Home() {
  const t = useT();
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);
  // Hidden shortcut: tap the title 5 times quickly to open the debug log.
  const onTitleTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((x) => now - x < 2000), now];
    if (taps.current.length >= 5) navigate('/debug');
  };
  return (
    <main className="screen">
      <TopBar
        noBack
        title={t('appName')}
        onTitleTap={onTitleTap}
        right={
          <button
            className="icon-btn"
            aria-label={t('settings')}
            onClick={() => navigate('/settings')}
          >
            ⚙️
          </button>
        }
      />
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
