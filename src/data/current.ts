/**
 * The family currently open on this device. Its id is remembered in localStorage, its
 * data is watched live from Firebase and also cached locally so the tree still opens
 * without a connection (e.g. at a rural Tết gathering).
 */
import { useEffect, useSyncExternalStore } from 'react';
import { load, save } from '../lib/storage';
import { createLogger } from '../lib/logger';
import { watchFamily } from './families';
import { sanitizeFamily } from './sanitize';
import { useAuth } from './firebase';
import type { People } from './people';
import type { Family } from './types';

const log = createLogger('current');

export type FamilyStatus = 'none' | 'loading' | 'ready' | 'missing' | 'error';

export interface CurrentFamily {
  id: string | null;
  status: FamilyStatus;
  family: Family | null;
  people: People;
  /** showing cached data because Firebase hasn't answered (offline) */
  fromCache: boolean;
}

const EMPTY: People = {};
let state: CurrentFamily = {
  id: load<{ id: string | null }>('family', { id: null }).id,
  status: 'none',
  family: null,
  people: EMPTY,
  fromCache: false,
};
const listeners = new Set<() => void>();
let stopWatch: (() => void) | null = null;
let watchingId: string | null = null;

function emit(patch: Partial<CurrentFamily>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function cacheKey(id: string) {
  return `cache:${id}`;
}

function startWatch() {
  const id = state.id;
  if (watchingId === id) return;
  stopWatch?.();
  stopWatch = null;
  watchingId = id;
  if (!id) {
    emit({ status: 'none', family: null, people: EMPTY, fromCache: false });
    return;
  }
  const cached = sanitizeFamily(load<{ family: unknown }>(cacheKey(id), { family: null }).family);
  emit({
    status: cached ? 'ready' : 'loading',
    family: cached,
    people: cached?.people ?? EMPTY,
    fromCache: Boolean(cached),
  });
  stopWatch = watchFamily(
    id,
    (raw) => {
      if (watchingId !== id) return;
      const family = sanitizeFamily(raw);
      if (!family) {
        emit({ status: 'missing', family: null, people: EMPTY, fromCache: false });
        return;
      }
      save(cacheKey(id), { family });
      rememberRecent(id, family.meta.name);
      emit({ status: 'ready', family, people: family.people ?? EMPTY, fromCache: false });
    },
    (e) => {
      if (watchingId !== id) return;
      log.warn('watch error', String(e));
      // keep showing the cache if we have one
      if (!state.family) emit({ status: 'error' });
    },
  );
}

export function openFamily(id: string | null) {
  if (id === state.id) return;
  save('family', { id });
  emit({ id });
  if (listeners.size > 0) startWatch();
}

export function getCurrentId() {
  return state.id;
}

function subscribe(l: () => void) {
  listeners.add(l);
  startWatch();
  return () => listeners.delete(l);
}

export function useCurrentFamily(): CurrentFamily & { isAdmin: boolean } {
  const s = useSyncExternalStore(subscribe, () => state);
  const auth = useAuth();
  // re-subscribe after sign-in changes (anonymous → Google gives a new uid)
  const uid = auth.user?.uid;
  useEffect(() => {
    if (!uid || !state.id) return;
    watchingId = null;
    startWatch();
  }, [uid]);
  const isAdmin = Boolean(auth.isAdmin && uid && s.family?.admins?.[uid]);
  return { ...s, isAdmin };
}

/** Families opened on this device (viewers have no account, so this is their list). */
export function recentFamilies(): Record<string, string> {
  return load<{ list: Record<string, string> }>('recent', { list: {} }).list;
}

function rememberRecent(id: string, name: string) {
  const list = recentFamilies();
  if (list[id] === name) return;
  save('recent', { list: { ...list, [id]: name } });
}

export function forgetRecent(id: string) {
  const { [id]: _, ...rest } = recentFamilies();
  void _;
  save('recent', { list: rest });
}

/** Share link for a family, e.g. https://tunv87.github.io/familytree/#/f/<id> */
export function shareUrl(id: string): string {
  return `${location.origin}${location.pathname}#/f/${id}`;
}
