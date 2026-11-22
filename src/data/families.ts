import { get, onValue, ref, serverTimestamp, set, update } from 'firebase/database';
import { createLogger } from '../lib/logger';
import { ensureSignedIn, getDb } from './firebase';
import type { Updates } from './people';
import type { Family, Person } from './types';

const log = createLogger('families');
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

/**
 * Random id. A family id doubles as its share link, so it must be unguessable:
 * 20 chars from a 57-letter alphabet ≈ 116 bits.
 */
export function randomId(length = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
  let out = '';
  for (const b of bytes) {
    if (b >= 228) continue; // 228 = 4 × 57, keeps the distribution uniform
    out += ALPHABET[b % ALPHABET.length];
    if (out.length === length) return out;
  }
  return out + randomId(length - out.length);
}

/** Creates a family owned by the signed-in Google user and returns its id. */
export async function createFamily(name: string): Promise<string> {
  const user = await ensureSignedIn();
  const id = randomId();
  const family: Family = {
    meta: { name, owner: user.uid, createdAt: Date.now() },
    admins: { [user.uid]: true },
  };
  await set(ref(getDb(), `families/${id}`), family);
  await set(ref(getDb(), `users/${user.uid}/families/${id}`), name);
  log.info('family created', { id: id.slice(0, 4) });
  return id;
}

/** Families the signed-in admin created or manages: id → name. */
export async function myFamilies(): Promise<Record<string, string>> {
  const user = await ensureSignedIn();
  const snap = await get(ref(getDb(), `users/${user.uid}/families`));
  return (snap.val() as Record<string, string> | null) ?? {};
}

/** Live view of a whole family (a few hundred people at most, so we load it all). */
export function watchFamily(
  id: string,
  onData: (f: Family | null) => void,
  onError: (e: Error) => void,
): () => void {
  let unsub: (() => void) | null = null;
  let cancelled = false;
  ensureSignedIn()
    .then(() => {
      if (cancelled) return;
      unsub = onValue(
        ref(getDb(), `families/${id}`),
        (snap) => onData(snap.val() as Family | null),
        (e) => {
          log.error('watch failed', e);
          onError(e);
        },
      );
    })
    .catch(onError);
  return () => {
    cancelled = true;
    unsub?.();
  };
}

/** Replaces a person record (fields left out are removed). */
export async function savePerson(familyId: string, personId: string, person: Person) {
  const clean = JSON.parse(JSON.stringify(person)) as Person; // RTDB rejects `undefined`
  await set(ref(getDb(), `families/${familyId}/people/${personId}`), {
    ...clean,
    updatedAt: serverTimestamp(),
  });
}

/** Applies multi-path updates relative to the family root in one atomic write. */
export async function applyFamilyUpdates(familyId: string, updates: Updates) {
  await update(ref(getDb(), `families/${familyId}`), updates);
}
