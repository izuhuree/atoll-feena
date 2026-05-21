import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  AuthError,
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
  User,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const FIRESTORE_DATABASE_ID = 'atollfeena';

// Support environment variable overrides for manual setup
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
  firestoreDatabaseId: FIRESTORE_DATABASE_ID,
};

export const isFirebaseConfigured = !!(config.apiKey && config.projectId && config.apiKey !== "YOUR_API_KEY");

let app;
try {
  if (isFirebaseConfigured) {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
  } else {
    // Provide a dummy app or handle unconfigured state
    app = getApps().length > 0 ? getApp() : null;
  }
} catch (e) {
  console.error("Firebase initialization error:", e);
}

export const db = app ? getFirestore(app, config.firestoreDatabaseId) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

const isMobileBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
};

const isInAppBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /(FBAN|FBAV|Instagram|Line|Twitter|Snapchat|Messenger|WhatsApp|wv)/i.test(ua);
};

let persistenceReadyPromise: Promise<void> | null = null;

export const ensureAuthPersistence = async () => {
  if (!auth) return;
  if (!persistenceReadyPromise) {
    persistenceReadyPromise = (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        return;
      } catch {
        // Fallback for constrained browsers.
      }
      try {
        await setPersistence(auth, browserSessionPersistence);
        return;
      } catch {
        // Fallback for heavily restricted environments.
      }
      await setPersistence(auth, inMemoryPersistence);
    })();
  }
  await persistenceReadyPromise;
};

export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase auth is not configured.');
  const mobileBrowser = isMobileBrowser();

  if (mobileBrowser && isInAppBrowser()) {
    throw new Error('Google sign-in is blocked in in-app browsers. Please open AtollFeeNa in Safari or Chrome and try again.');
  }

  try {
    // Keep popup directly tied to the button tap. Mobile browsers often block popups
    // after awaited work, which can look like a login loop.
    await signInWithPopup(auth, googleProvider);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const authError = error as AuthError;
      const popupFailed =
        authError.code === 'auth/popup-blocked' ||
        authError.code === 'auth/cancelled-popup-request' ||
        authError.code === 'auth/popup-closed-by-user';

      if (popupFailed) {
        if (mobileBrowser) {
          throw new Error('Google sign-in was not completed. Open AtollFeeNa in Safari or Chrome, allow popups, and try again.');
        }
        await ensureAuthPersistence();
        await signInWithRedirect(auth, googleProvider);
        return;
      }
    }
    throw error;
  }
};

export const isAdmin = () => {
  return auth?.currentUser?.email === 'hunaruhub@gmail.com';
};

export const syncProfile = async (user: User) => {
  if (!db) return;
  const userRef = doc(db, 'users', user.uid);
  try {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      updatedAt: new Date().toISOString(),
      units: 'metric'
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
};

// Connection test
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (import.meta.env.DEV && isFirebaseConfigured) {
  testConnection();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
