/**
 * Security-rules tests against the Firebase emulators (auth + database), using the same
 * modular SDK as the app. Each "user" is a separate Firebase app.
 *  - viewer: anonymous session (opened the share link)
 *  - admin:  signed in with Google (the emulator accepts a fake Google id token)
 */
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  signInAnonymously,
  signInWithCredential,
} from 'firebase/auth';
import {
  connectDatabaseEmulator,
  get,
  getDatabase,
  ref,
  remove,
  set,
  update,
  type Database,
} from 'firebase/database';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

const NS = 'demo-familytree-default-rtdb';
const DB_URL = `http://127.0.0.1:9000`;
const apps: FirebaseApp[] = [];

async function adminWrite(method: 'PUT' | 'DELETE', path: string, body?: unknown) {
  const res = await fetch(`${DB_URL}/${path}.json?ns=${NS}`, {
    method,
    headers: { Authorization: 'Bearer owner' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`admin ${method} ${path}: ${res.status}`);
}

type U = { uid: string; db: Database };

function newApp() {
  const app = initializeApp(
    { apiKey: 'demo-key', projectId: 'demo-familytree', databaseURL: `${DB_URL}?ns=${NS}` },
    `u${apps.length}-${Math.random()}`,
  );
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const db = getDatabase(app);
  connectDatabaseEmulator(db, '127.0.0.1', 9000);
  return { auth, db };
}

async function viewer(): Promise<U> {
  const { auth, db } = newApp();
  const { user } = await signInAnonymously(auth);
  return { uid: user.uid, db };
}

let n = 0;
async function google(): Promise<U> {
  const { auth, db } = newApp();
  const sub = `g${++n}-${Math.random().toString(36).slice(2, 8)}`;
  const cred = GoogleAuthProvider.credential(
    JSON.stringify({ sub, email: `${sub}@example.com`, email_verified: true }),
  );
  const { user } = await signInWithCredential(auth, cred);
  return { uid: user.uid, db };
}

function noAuthDb(): Database {
  return newApp().db;
}

const ok = (p: Promise<unknown>) => expect(p).resolves.not.toThrow();
const denied = (p: Promise<unknown>) => expect(p).rejects.toThrow(/permission/i);

const FID = 'AbCdEfGhJkMnPqRsTuVw';
const family = (owner: string, name = 'Họ Nguyễn') => ({
  meta: { name, owner, createdAt: Date.now() },
  admins: { [owner]: true },
});
const person = (name = 'Nguyễn Văn An') => ({
  name,
  gender: 'm',
  generation: 1,
  deceased: true,
  death: { cal: 'l', d: 10, m: 3, y: 1950 },
});

beforeEach(() => adminWrite('DELETE', ''));
afterAll(async () => {
  await Promise.all(apps.map((a) => deleteApp(a)));
});

describe('SEC-01 creating a family', () => {
  it('a Google user can create a family they own', async () => {
    const a = await google();
    await ok(set(ref(a.db, `families/${FID}`), family(a.uid)));
    await ok(set(ref(a.db, `users/${a.uid}/families/${FID}`), 'Họ Nguyễn'));
  });

  it('an anonymous viewer cannot create one', async () => {
    const v = await viewer();
    await denied(set(ref(v.db, `families/${FID}`), family(v.uid)));
    await denied(set(ref(v.db, `users/${v.uid}/families/${FID}`), 'x'));
  });

  it('cannot create a family owned by someone else', async () => {
    const a = await google();
    await denied(set(ref(a.db, `families/${FID}`), family('someone-else')));
  });

  it('cannot take over an existing family', async () => {
    const [a, b] = [await google(), await google()];
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await denied(set(ref(b.db, `families/${FID}`), family(b.uid)));
  });

  it('requires a long random id and a valid name', async () => {
    const a = await google();
    await denied(set(ref(a.db, 'families/short'), family(a.uid)));
    await denied(set(ref(a.db, `families/${FID}`), family(a.uid, '')));
    await denied(set(ref(a.db, `families/${FID}`), family(a.uid, 'x'.repeat(81))));
  });
});

describe('SEC-01 reading', () => {
  it('anyone signed in (even anonymously) with the id can read the family', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await ok(get(ref((await viewer()).db, `families/${FID}`)));
  });

  it('nobody can list all families, and a session is required', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await denied(get(ref(a.db, 'families')));
    await denied(get(ref(noAuthDb(), `families/${FID}`)));
  });

  it('a user list is private', async () => {
    const [a, b] = [await google(), await google()];
    await adminWrite('PUT', `users/${a.uid}/families/${FID}`, 'Họ Nguyễn');
    await ok(get(ref(a.db, `users/${a.uid}`)));
    await denied(get(ref(b.db, `users/${a.uid}`)));
  });
});

describe('SEC-01 editing people', () => {
  it('admins can add, edit and delete people', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    const p = ref(a.db, `families/${FID}/people/p0000001`);
    await ok(set(p, person()));
    await ok(update(p, { note: 'Thủy tổ' }));
    await ok(remove(p));
  });

  it('viewers and other Google users cannot edit', async () => {
    const [a, b, v] = [await google(), await google(), await viewer()];
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await denied(set(ref(v.db, `families/${FID}/people/p0000001`), person()));
    await denied(set(ref(b.db, `families/${FID}/people/p0000001`), person()));
    await denied(set(ref(b.db, `families/${FID}/admins/${b.uid}`), true));
  });

  it('an admin can add another admin, who can then edit', async () => {
    const [a, b] = [await google(), await google()];
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await ok(set(ref(a.db, `families/${FID}/admins/${b.uid}`), true));
    await ok(set(ref(b.db, `families/${FID}/people/p0000001`), person()));
  });

  it('the owner field cannot be changed', async () => {
    const [a, b] = [await google(), await google()];
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await denied(set(ref(a.db, `families/${FID}/meta/owner`), b.uid));
  });

  it('validates person fields', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    const p = ref(a.db, `families/${FID}/people/p0000001`);
    await denied(set(p, { ...person(), name: '' }));
    await denied(set(p, { ...person(), gender: 'x' }));
    await denied(set(p, { ...person(), death: { cal: 'x', y: 1950 } }));
    await denied(set(p, { ...person(), death: { cal: 'l', m: 13 } }));
    await denied(set(p, { ...person(), hacked: true }));
    await denied(set(ref(a.db, `families/${FID}/people/bad!id`), person()));
    await ok(set(p, { ...person(), death: { cal: 'l', d: 30, m: 12, leap: false } }));
  });

  it('only admins can delete the family', async () => {
    const [a, b] = [await google(), await google()];
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await denied(remove(ref(b.db, `families/${FID}`)));
    await ok(remove(ref(a.db, `families/${FID}`)));
  });
});

describe('SEC-01 everything else', () => {
  it('is closed', async () => {
    const a = await google();
    await denied(set(ref(a.db, 'other'), 1));
    await denied(get(ref(a.db, 'other')));
    await denied(set(ref(a.db, `families/${FID}/junk`), 1));
  });
});

describe('SEC-01 more attacks', () => {
  it('the owner always stays an admin (another admin cannot remove them)', async () => {
    const [a, b] = [await google(), await google()];
    await adminWrite('PUT', `families/${FID}`, {
      ...family(a.uid),
      admins: { [a.uid]: true, [b.uid]: true },
    });
    await denied(remove(ref(b.db, `families/${FID}/admins/${a.uid}`)));
    await denied(set(ref(b.db, `families/${FID}/admins`), { [b.uid]: true }));
    // removing a non-owner admin is fine
    await ok(remove(ref(a.db, `families/${FID}/admins/${b.uid}`)));
  });

  it('admin flags and spouse links must be plain true (no smuggled data)', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await denied(set(ref(a.db, `families/${FID}/admins/someone`), 'token'));
    await denied(
      set(ref(a.db, `families/${FID}/people/p0000001`), { ...person(), spouses: { x: 'y' } }),
    );
  });

  it('LG-15 photos: only admins of that family write them, JPEG only, size-limited', async () => {
    const [a, other] = [await google(), await google()];
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    const jpeg = 'data:image/jpeg;base64,' + 'A'.repeat(1000);
    const thumb = (u: U) => ref(u.db, `thumbs/${FID}/p0000001`);
    const photo = (u: U) => ref(u.db, `photos/${FID}/p0000001`);
    await ok(set(thumb(a), jpeg));
    await ok(set(photo(a), jpeg));
    // everyone who opened the link can see them
    const v = await viewer();
    await ok(get(thumb(v)));
    await ok(get(photo(v)));
    // but not change them: a viewer, or the admin of another family
    await denied(set(thumb(v), jpeg));
    await denied(set(photo(v), null));
    await denied(set(thumb(other), jpeg));
    // only JPEG data URLs within the limits
    await denied(set(thumb(a), 'data:image/svg+xml;base64,PHN2Zz4='));
    await denied(set(thumb(a), 'https://example.com/a.jpg'));
    await denied(set(thumb(a), 'data:image/jpeg;base64,' + 'A'.repeat(16_000)));
    await denied(set(photo(a), 'data:image/jpeg;base64,' + 'A'.repeat(100_000)));
    await denied(set(ref(a.db, `thumbs/${FID}/bad id`), jpeg));
    // the admin can remove a photo
    await ok(set(photo(a), null));
  });

  it('LG-19 anh chị em nối thẳng: plain true links, admins only', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    const p = ref(a.db, `families/${FID}/people/p0000001`);
    await ok(set(p, { ...person(), siblings: { p0000002: true } }));
    await denied(set(p, { ...person(), siblings: { p0000002: 'yes' } }));
    const v = await viewer();
    await denied(set(ref(v.db, `families/${FID}/people/p0000001/siblings/p0000003`), true));
  });

  it('LG-16 nơi ở is text up to 120 characters', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    const p = ref(a.db, `families/${FID}/people/p0000001`);
    await ok(set(p, { ...person(), place: 'Hoài Nhơn, Bình Định' }));
    await denied(set(p, { ...person(), place: 'x'.repeat(121) }));
    await denied(set(p, { ...person(), place: 12 }));
  });

  it('LG-14 top generation: whole number 1–60, only admins set it', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    const top = ref(a.db, `families/${FID}/meta/topGeneration`);
    await ok(set(top, 8));
    await denied(set(top, 0));
    await denied(set(top, 61));
    await denied(set(top, 2.5));
    await denied(set(top, '8'));
    const v = await viewer();
    await denied(set(ref(v.db, `families/${FID}/meta/topGeneration`), 3));
  });

  it('length and range limits', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    const p = ref(a.db, `families/${FID}/people/p0000001`);
    await denied(set(p, { ...person(), name: 'x'.repeat(101) }));
    await denied(set(p, { ...person(), note: 'x'.repeat(2001) }));
    await denied(set(p, { ...person(), generation: 0 }));
    await denied(set(p, { ...person(), generation: 61 }));
    await denied(set(p, { ...person(), birth: { cal: 's', d: 32 } }));
    await ok(
      set(p, { ...person(), name: 'x'.repeat(100), note: 'x'.repeat(2000), generation: 60 }),
    );
  });

  it("nobody writes another user's list or the database root; anonymous users have no list", async () => {
    const [a, b, v] = [await google(), await google(), await viewer()];
    await denied(set(ref(b.db, `users/${a.uid}/families/${FID}`), 'x'));
    await denied(set(ref(v.db, `users/${v.uid}/families/${FID}`), 'x'));
    await denied(get(ref(a.db, 'users')));
    await denied(set(ref(a.db, '/'), { hacked: true }));
    await denied(update(ref(a.db), { [`families/${FID}/meta/name`]: 'x' }));
  });

  it('a viewer cannot delete people or the family', async () => {
    const [a, v] = [await google(), await viewer()];
    await adminWrite('PUT', `families/${FID}`, {
      ...family(a.uid),
      people: { p0000001: person() },
    });
    await denied(remove(ref(v.db, `families/${FID}/people/p0000001`)));
    await denied(remove(ref(v.db, `families/${FID}`)));
  });

  it('a family must keep its meta and admins', async () => {
    const a = await google();
    await adminWrite('PUT', `families/${FID}`, family(a.uid));
    await denied(remove(ref(a.db, `families/${FID}/meta`)));
    await denied(set(ref(a.db, `families/${FID}/meta/name`), 5));
  });
});
