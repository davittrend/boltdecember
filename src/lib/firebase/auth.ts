import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  GoogleAuthProvider,
  Auth 
} from 'firebase/auth';
import { app } from './init';

class AuthService {
  private static instance: Auth | null = null;
  private static googleProvider: GoogleAuthProvider | null = null;

  static initialize(): { auth: Auth; googleProvider: GoogleAuthProvider } {
    if (!this.instance || !this.googleProvider) {
      try {
        this.instance = getAuth(app);
        this.googleProvider = new GoogleAuthProvider();
        
        this.googleProvider.setCustomParameters({
          prompt: 'select_account'
        });

        setPersistence(this.instance, browserLocalPersistence).catch((error) => {
          console.error('Error setting auth persistence:', error);
        });
      } catch (error) {
        console.error('Failed to initialize Firebase Auth:', error);
        throw error;
      }
    }

    return {
      auth: this.instance,
      googleProvider: this.googleProvider,
    };
  }
}

const { auth, googleProvider } = AuthService.initialize();

export { auth, googleProvider };