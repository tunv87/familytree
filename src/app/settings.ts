import { useSyncExternalStore } from 'react';
import { load, save } from '../lib/storage';

export type Lang = 'vi' | 'en';

export interface Settings {
  bigText: boolean;
  lang: Lang;
}

function createStore<T>(key: string, fallback: T) {
  let value = load(key, fallback);
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (patch: Partial<T>) => {
      value = { ...value, ...patch };
      save(key, value);
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

const settingsStore = createStore<Settings>('settings', { bigText: false, lang: 'vi' });

export const getSettings = settingsStore.get;
export const setSettings = settingsStore.set;

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get);
}
