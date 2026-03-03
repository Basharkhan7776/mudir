import { initializeAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const getEnvVars = () => {
  const extra = Constants.expoConfig?.extra || {};
  return {
    firebaseApiKey: extra.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
    firebaseAuthDomain: extra.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
    firebaseProjectId: extra.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
    firebaseStorageBucket:
      extra.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
    firebaseMessagingSenderId:
      extra.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    firebaseAppId: extra.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '',
    firebaseDatabaseUrl: extra.FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || '',
    environment: extra.ENVIRONMENT || process.env.ENVIRONMENT || 'development',
  };
};

const env = getEnvVars();

const firebaseConfigDev = {
  apiKey: env.firebaseApiKey || 'AIzaSyDev-placeholder-replace-with-your-dev-api-key',
  authDomain: env.firebaseAuthDomain || 'mudir-dev.firebaseapp.com',
  projectId: env.firebaseProjectId || 'mudir-dev',
  storageBucket: env.firebaseStorageBucket || 'mudir-dev.appspot.com',
  messagingSenderId: env.firebaseMessagingSenderId || '123456789',
  appId: env.firebaseAppId || '1:123456789:web:abcdef',
  databaseURL: env.firebaseDatabaseUrl || 'https://mudir-dev.firebaseio.com',
};

const firebaseConfigProd = {
  apiKey: env.firebaseApiKey || 'AIzaSyProd-placeholder-replace-with-your-prod-api-key',
  authDomain: env.firebaseAuthDomain || 'mudir-prod.firebaseapp.com',
  projectId: env.firebaseProjectId || 'mudir-prod',
  storageBucket: env.firebaseStorageBucket || 'mudir-prod.appspot.com',
  messagingSenderId: env.firebaseMessagingSenderId || '987654321',
  appId: env.firebaseAppId || '1:987654321:web:fedcba',
  databaseURL: env.firebaseDatabaseUrl || 'https://mudir-prod.firebaseio.com',
};

const isDevelopment = env.environment === 'development';

export const firebaseConfig = isDevelopment ? firebaseConfigDev : firebaseConfigProd;

export const environment = {
  isDevelopment,
  name: isDevelopment ? 'development' : 'production',
};

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof initializeAuth> | null = null;
let db: Firestore | null = null;

export const initializeFirebase = (): {
  app: FirebaseApp;
  auth: ReturnType<typeof initializeAuth>;
  db: Firestore;
} => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    console.log(`[Firebase] Initialized in ${environment.name} mode`);
  }

  if (!auth) {
    auth = initializeAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  }

  if (!db) {
    db = getFirestore(app);
  }

  return { app, auth, db };
};

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    const { app: initializedApp } = initializeFirebase();
    return initializedApp;
  }
  return app;
};

export const getFirebaseAuth = (): ReturnType<typeof initializeAuth> => {
  if (!auth) {
    const { auth: initializedAuth } = initializeFirebase();
    return initializedAuth;
  }
  return auth;
};

export const getFirebaseDb = (): Firestore => {
  if (!db) {
    const { db: initializedDb } = initializeFirebase();
    return initializedDb;
  }
  return db;
};
