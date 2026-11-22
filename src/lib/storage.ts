import { createLogger } from './logger';

const log = createLogger('storage');
const PREFIX = 'ft:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : { ...fallback, ...JSON.parse(raw) };
  } catch (e) {
    log.warn('load failed', { key, e: String(e) });
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    log.warn('save failed', { key, e: String(e) });
  }
}
