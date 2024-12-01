import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAccountStore } from '@/lib/store';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { initializeStore, resetStore } = useAccountStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      try {
        if (currentUser) {
          await initializeStore(currentUser.uid);
        } else {
          resetStore();
        }
      } catch (error) {
        console.error('Error during store initialization:', error);
      } finally {
        setLoading(false); // End loading state after processing
      }
    });

    return () => unsubscribe(); // Clean up listener
  }, [initializeStore, resetStore]);

  return { user, loading };
}
