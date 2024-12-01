import { FirebaseOptions } from 'firebase/app';
import { env } from '@/lib/config/env';

export function validateFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    databaseURL: `https://${env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
}