import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { UserProfile } from '../types';

type RawConfig = Record<string, string | undefined>;
const envConfig: RawConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export let hasFirebaseConfig = false;
export let app: FirebaseApp | null = null;
export let auth: ReturnType<typeof getAuth> | null = null;
export let db: ReturnType<typeof getFirestore> | null = null;
export let storage: ReturnType<typeof getStorage> | null = null;
const provider = new GoogleAuthProvider();

export async function initializeFirebase() {
  if (app) return app;
  const config = await loadConfig();
  hasFirebaseConfig = Object.values(config).slice(0, 6).every(Boolean);
  if (!hasFirebaseConfig) return null;
  app = getApps()[0] || initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app, 'atollfeena');
  storage = getStorage(app);
  return app;
}

async function loadConfig() {
  if (Object.values(envConfig).slice(0, 6).every(Boolean)) return envConfig;
  try {
    const res = await fetch('/firebase-applet-config.json', { cache: 'no-store' });
    if (!res.ok) return envConfig;
    const json = await res.json();
    return {
      apiKey: json.API_KEY || json.apiKey,
      authDomain: json.AUTH_DOMAIN || json.authDomain,
      projectId: json.PROJECT_ID || json.projectId,
      storageBucket: json.STORAGE_BUCKET || json.storageBucket,
      messagingSenderId: json.MESSAGING_SENDER_ID || json.messagingSenderId,
      appId: json.APP_ID || json.appId,
      measurementId: json.MEASUREMENT_ID || json.measurementId
    } satisfies RawConfig;
  } catch {
    return envConfig;
  }
}

export function friendlyAuthError(error: unknown) {
  const code = String((error as { code?: string }).code ?? '');
  if (code.includes('popup-blocked')) return 'Your browser blocked the Google sign-in popup. Allow popups and try again.';
  if (code.includes('unauthorized-domain')) return 'This domain is not authorized for Firebase sign-in.';
  if (code.includes('network-request-failed')) return 'Network connection failed. Check your connection and try again.';
  if (code.includes('operation-not-allowed')) return 'Google sign-in is not enabled for this Firebase project.';
  if (code.includes('invalid-credential')) return 'The sign-in credential was rejected. Please try again.';
  if (code.includes('popup-closed-by-user')) return 'The Google sign-in window was closed before completion.';
  return 'Sign-in failed. Please try again.';
}

export async function signInGoogle() {
  if (!auth) throw new Error('Firebase is not configured');
  return signInWithPopup(auth, provider);
}

export async function logout() {
  if (auth) await signOut(auth);
}

export function watchAuth(cb: (user: User | null) => void) {
  if (!auth) return () => cb(null);
  const currentAuth = auth;
  return onAuthStateChanged(currentAuth, async (user) => {
    if (user?.isAnonymous) await signOut(currentAuth);
    cb(user?.isAnonymous ? null : user);
  });
}

export async function syncUser(user: User) {
  if (!db) return null;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const existing = snap.data() as UserProfile | undefined;
  const profile: UserProfile = {
    uid: user.uid,
    name: user.displayName || existing?.name || 'AtollFeeNa Diver',
    email: user.email || existing?.email || '',
    photoURL: user.photoURL || existing?.photoURL,
    units: existing?.units || 'metric',
    homeCountry: existing?.homeCountry,
    certificationProfile: existing?.certificationProfile || {},
    safetyAgreedAt: existing?.safetyAgreedAt,
    roles: existing?.roles,
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, stripUndefined(profile), { merge: true });
  return profile;
}

export function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}
