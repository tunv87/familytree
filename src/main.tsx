import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { createLogger, installGlobalErrorLogging } from './lib/logger';
import { setupPwa } from './lib/pwa';
// Self-hosted rounded font with full Vietnamese coverage, so diacritics render the
// same on every device (system fonts on some Windows/Android setups lack them).
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import './styles.css';

installGlobalErrorLogging();
setupPwa();
createLogger('app').info('start', { version: __APP_VERSION__, built: __BUILD_TIME__ });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
