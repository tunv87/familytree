import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { createLogger } from '../lib/logger';
import { ComingSoon } from './ComingSoon';
import { DebugScreen } from './DebugScreen';
import { Home } from './Home';
import { SettingsScreen } from './SettingsScreen';
import { useSettings } from './settings';

const log = createLogger('nav');

function RouteLogger() {
  const loc = useLocation();
  useEffect(() => log.info('route', { path: loc.pathname + loc.search }), [loc]);
  return null;
}

export function App() {
  const { bigText, lang } = useSettings();
  useEffect(() => {
    document.documentElement.dataset.bigtext = bigText ? '1' : '0';
    document.documentElement.lang = lang;
  }, [bigText, lang]);
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteLogger />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tree" element={<ComingSoon title="tree" />} />
        <Route path="/calendar" element={<ComingSoon title="calendar" />} />
        <Route path="/invite" element={<ComingSoon title="invite" />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/debug" element={<DebugScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
