import { useSyncExternalStore } from 'react';
import type { Region } from '../data/kinship';
import { load, save } from '../lib/storage';

export type Lang = 'vi' | 'en';

export interface Settings {
  bigText: boolean;
  lang: Lang;
  /** cách xưng hô (default miền Trung — Bình Định) */
  region: Region;
  /** "Tôi là ai" in each family on this device: family id → person id */
  me: Record<string, string>;
}

function createStore<T>(key: string, fallback: T) {
  // settings saved by an older version may miss newer fields
  let value = { ...fallback, ...load(key, fallback) };
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

const settingsStore = createStore<Settings>('settings', {
  bigText: false,
  lang: 'vi',
  region: 'trung',
  me: {},
});

export const getSettings = settingsStore.get;
export const setSettings = settingsStore.set;

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get);
}

/** Who I am in this family (on this device), or null. */
export function setMe(familyId: string, personId: string | null) {
  const { [familyId]: _, ...rest } = getSettings().me ?? {};
  void _;
  setSettings({ me: personId ? { ...rest, [familyId]: personId } : rest });
}
