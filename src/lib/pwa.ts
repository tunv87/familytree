import { registerSW } from 'virtual:pwa-register';
import { createLogger } from './logger';

const log = createLogger('pwa');
const CHECK_EVERY_MS = 15 * 60 * 1000;

/**
 * Register the service worker and make sure players get new versions quickly.
 * iOS keeps home-screen web apps alive for a long time, so besides the check on
 * start we re-check whenever the app comes back to the foreground and every
 * 15 minutes. With registerType 'autoUpdate' the page reloads itself as soon as
 * a new version is installed.
 */
export function setupPwa() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(url, reg) {
      log.info('service worker registered', { url });
      if (!reg) return;
      const check = () => {
        if (navigator.onLine) reg.update().catch((e) => log.warn('update check failed', String(e)));
      };
      setInterval(check, CHECK_EVERY_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
    onNeedRefresh() {
      log.info('new version available, reloading');
      void updateSW(true);
    },
    onRegisterError(e) {
      log.error('service worker registration failed', e);
    },
  });
}
