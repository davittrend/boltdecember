// Re-export all Firebase services
export { app } from './init';
export { auth, googleProvider } from './auth';
export { database } from './database';

// Initialize Firebase when this module is imported
import './init';