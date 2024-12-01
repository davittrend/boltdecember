import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ref, set, get, onValue } from 'firebase/database';
import { database, auth } from './firebase';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

interface AccountStore {
  accounts: PinterestAccount[];
  selectedAccountId: string | null;
  boards: Record<string, PinterestBoard[]>;
  addAccount: (account: PinterestAccount) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  setSelectedAccount: (accountId: string) => void;
  setBoards: (accountId: string, boards: PinterestBoard[]) => Promise<void>;
  getAccount: (accountId: string) => PinterestAccount | undefined;
  initializeStore: () => void;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccountId: null,
      boards: {},

      initializeStore: () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Listen to accounts changes
        const accountsRef = ref(database, `users/${userId}/accounts`);
        onValue(accountsRef, (snapshot) => {
          const accounts: PinterestAccount[] = [];
          snapshot.forEach((childSnapshot) => {
            accounts.push({
              id: childSnapshot.key!,
              ...childSnapshot.val(),
            });
          });
          set({ accounts });
        });

        // Listen to boards changes
        const boardsRef = ref(database, `users/${userId}/boards`);
        onValue(boardsRef, (snapshot) => {
          const boards: Record<string, PinterestBoard[]> = {};
          snapshot.forEach((childSnapshot) => {
            boards[childSnapshot.key!] = childSnapshot.val();
          });
          set({ boards });
        });
      },

      addAccount: async (account) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('User not authenticated');

        // Save to Firebase
        await set(ref(database, `users/${userId}/accounts/${account.id}`), account);
        
        // Local state will be updated by the onValue listener
      },

      removeAccount: async (accountId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('User not authenticated');

        // Remove from Firebase
        await set(ref(database, `users/${userId}/accounts/${accountId}`), null);
        await set(ref(database, `users/${userId}/boards/${accountId}`), null);
        
        // Update selected account if needed
        set((state) => ({
          selectedAccountId:
            state.selectedAccountId === accountId
              ? state.accounts.find(a => a.id !== accountId)?.id || null
              : state.selectedAccountId,
        }));
      },

      setSelectedAccount: (accountId) => set({ selectedAccountId: accountId }),

      setBoards: async (accountId, boards) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('User not authenticated');

        // Save to Firebase
        await set(ref(database, `users/${userId}/boards/${accountId}`), boards);
        
        // Local state will be updated by the onValue listener
      },

      getAccount: (accountId) => {
        return get().accounts?.find(a => a.id === accountId);
      },
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
    }
  )
);