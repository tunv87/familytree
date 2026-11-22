import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase, type Database } from 'firebase/database';
import { useSyncExternalStore } from 'react';
import { createLogger } from '../lib/logger';

const log = createLogger('firebase');
const env = import.meta.env;
const useEmulator = env.VITE_USE_EMULATOR === '1';

export const isFirebaseConfigured = useEmulator || Boolean(env.VITE_FIREBASE_DATABASE_URL);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

function init() {
  if (app) return;
  if (!isFirebaseConfigured) throw new Error('firebase-not-configured');
  const emuHost = env.VITE_EMULATOR_HOST || location.hostname || '127.0.0.1';
  app = initializeApp(
    useEmulator
      ? {
          apiKey: 'demo-key',
          projectId: 'demo-familytree',
          authDomain: `${emuHost}`,
          databaseURL: `http://${emuHost}:9000?ns=demo-familytree-default-rtdb`,
        }
      : {
          apiKey: env.VITE_FIREBASE_API_KEY,
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
          databaseURL: env.VITE_FIREBASE_DATABASE_URL,
          projectId: env.VITE_FIREBASE_PROJECT_ID,
          appId: env.VITE_FIREBASE_APP_ID,
        },
  );
  auth = getAuth(app);
  db = getDatabase(app);
  if (useEmulator) {
    connectAuthEmulator(auth, `http://${emuHost}:9099`, { disableWarnings: true });
    connectDatabaseEmulator(db, emuHost, 9000);
    log.info('using emulators', { emuHost });
    // e2e tests sign in as a Google admin without the popup (the emulator accepts fake tokens)
    (window as unknown as Record<string, unknown>).__testSignIn = async (name: string) => {
      const cred = GoogleAuthProvider.credential(
        JSON.stringify({ sub: name, email: `${name}@example.com`, email_verified: true, name }),
      );
      await signInWithCredential(auth!, cred);
    };
  }
  onAuthStateChanged(auth, (u) => {
    current = u;
    ready = true;
    log.info('auth state', { uid: u?.uid.slice(0, 6), google: isGoogle(u) });
    listeners.forEach((l) => l());
  });
}

export function getDb(): Database {
  init();
  return db!;
}

// ---------- auth state ----------

let current: User | null = null;
let ready = false;
const listeners = new Set<() => void>();

export function isGoogle(u: User | null): boolean {
  return Boolean(u && !u.isAnonymous && u.providerData.some((p) => p.providerId === 'google.com'));
}

export interface AuthState {
  ready: boolean;
  user: User | null;
  /** signed in with Google — the only kind of account that can edit a family */
  isAdmin: boolean;
}

let snapshot: AuthState = { ready: false, user: null, isAdmin: false };
function getSnapshot(): AuthState {
  if (snapshot.user !== current || snapshot.ready !== ready)
    snapshot = { ready, user: current, isAdmin: isGoogle(current) };
  return snapshot;
}

function subscribe(l: () => void) {
  if (isFirebaseConfigured) init();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Viewers only need an anonymous session to read a family they have the link to. */
export async function ensureSignedIn(): Promise<User> {
  init();
  await auth!.authStateReady();
  if (auth!.currentUser) return auth!.currentUser;
  const { user } = await signInAnonymously(auth!);
  return user;
}

export async function signInWithGoogle(): Promise<void> {
  init();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth!, provider);
  } catch (e) {
    const code = (e as { code?: string }).code;
    log.warn('google popup failed', code);
    // Popups are blocked in some in-app browsers (Zalo, Messenger): fall back to a redirect.
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    )
      await signInWithRedirect(auth!, provider);
    else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request')
      throw e;
  }
}

export async function signOut(): Promise<void> {
  init();
  await fbSignOut(auth!);
}
