import { getDatabase, Database } from 'firebase/database';
import { app } from './init';

class DatabaseService {
  private static instance: Database | null = null;

  static initialize(): Database {
    if (!this.instance) {
      try {
        this.instance = getDatabase(app);
      } catch (error) {
        console.error('Failed to initialize Firebase Database:', error);
        throw error;
      }
    }
    return this.instance;
  }
}

export const database = DatabaseService.initialize();