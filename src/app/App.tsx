import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CalendarScreen } from '../calendar/CalendarScreen';
import { InviteScreen } from '../family/InviteScreen';
import { FamiliesScreen, NewFamilyScreen, OpenFamilyLink } from '../family/FamiliesScreen';
import { PeopleScreen } from '../family/PeopleScreen';
import { PersonFormScreen } from '../family/PersonForm';
import { PersonScreen } from '../family/PersonScreen';
import { RelationsScreen } from '../family/RelationsScreen';
import { createLogger } from '../lib/logger';
import { TreeScreen } from '../tree/TreeScreen';
import { DebugScreen } from './DebugScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { Home } from './Home';
import { SettingsScreen } from './SettingsScreen';
import { useSettings } from './settings';

const log = createLogger('nav');

/** Test-only: a screen that throws while rendering, to check the crash screen (CR-08). */
function CrashForTest(): never {
  throw new Error('intentional test crash');
}
const testRoutes = import.meta.env.VITE_USE_EMULATOR === '1';

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
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/f/:fid" element={<OpenFamilyLink />} />
          <Route path="/families" element={<FamiliesScreen />} />
          <Route path="/new-family" element={<NewFamilyScreen />} />
          <Route path="/people" element={<PeopleScreen />} />
          <Route path="/p/:pid" element={<PersonScreen />} />
          <Route path="/edit/:pid" element={<PersonFormScreen />} />
          <Route path="/relations/:pid" element={<RelationsScreen />} />
          <Route path="/add" element={<PersonFormScreen />} />
          <Route path="/tree" element={<TreeScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/invite" element={<InviteScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/debug" element={<DebugScreen />} />
          {testRoutes && <Route path="/__crash" element={<CrashForTest />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
