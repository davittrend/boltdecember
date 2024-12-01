import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { validateFirebaseConfig } from './utils/env-validator';

class FirebaseInitializer {
  private static instance: FirebaseApp | null = null;

  static initialize(): FirebaseApp {
    if (!this.instance) {
      try {
        const config = validateFirebaseConfig();
        this.instance = getApps().length === 0 
          ? initializeApp(config) 
          : getApps()[0];
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
      }
    }
    return this.instance;
  }
}

export const app = FirebaseInitializer.initialize();