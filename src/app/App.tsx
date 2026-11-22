import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { FamiliesScreen, NewFamilyScreen, OpenFamilyLink } from '../family/FamiliesScreen';
import { PeopleScreen } from '../family/PeopleScreen';
import { PersonFormScreen } from '../family/PersonForm';
import { PersonScreen } from '../family/PersonScreen';
import { createLogger } from '../lib/logger';
import { TreeScreen } from '../tree/TreeScreen';
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
        <Route path="/f/:fid" element={<OpenFamilyLink />} />
        <Route path="/families" element={<FamiliesScreen />} />
        <Route path="/new-family" element={<NewFamilyScreen />} />
        <Route path="/people" element={<PeopleScreen />} />
        <Route path="/p/:pid" element={<PersonScreen />} />
        <Route path="/edit/:pid" element={<PersonFormScreen />} />
        <Route path="/add" element={<PersonFormScreen />} />
        <Route path="/tree" element={<TreeScreen />} />
        <Route path="/calendar" element={<ComingSoon title="calendar" />} />
        <Route path="/invite" element={<ComingSoon title="invite" />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/debug" element={<DebugScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
