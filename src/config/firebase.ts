import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration from environment variables (.env)
const env = (import.meta as any).env || {};
const cleanEnv = (val?: string): string => {
  if (!val) return '';
  return String(val).trim().replace(/^["']|["',]+$/g, '').trim();
};

const firebaseConfig = {
  apiKey: cleanEnv(env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(env.VITE_FIREBASE_APP_ID),
  measurementId: cleanEnv(env.VITE_FIREBASE_MEASUREMENT_ID)
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 10 &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.length > 0
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  if (isFirebaseConfigured()) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    auth.useDeviceLanguage();
  }
} catch (error) {
  console.warn('Firebase initialization note (Falling back to simulated OTP):', error);
}

export { app, auth, firebaseConfig };
