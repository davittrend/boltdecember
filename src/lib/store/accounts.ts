import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { onValue, ref, get, set, remove } from 'firebase/database';
import { database } from '../firebase';
import { auth } from '../firebase/auth';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

interface AccountState {
  accounts: PinterestAccount[];
  selectedAccountId: string | null;
  boards: Record<string, PinterestBoard[]>;
  initialized: boolean;
  error: string | null;
  setAccounts: (accounts: PinterestAccount[]) => void;
  setSelectedAccount: (accountId: string | null) => void;
  setBoards: (accountId: string, boards: PinterestBoard[]) => Promise<void>;
  getAccount: (accountId: string) => PinterestAccount | undefined;
  removeAccount: (accountId: string) => Promise<void>;
  initializeStore: (userId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccountId: null,
      boards: {},
      initialized: false,
      error: null,

      setAccounts: (accounts) => set(
        produce((state) => {
          state.accounts = accounts;
        })
      ),
      
      setSelectedAccount: (accountId) => set(
        produce((state) => {
          state.selectedAccountId = accountId;
        })
      ),
      
      setBoards: async (accountId, boards) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        await set(ref(database, `users/${userId}/boards/${accountId}`), boards);
        
        set(
          produce((state) => {
            state.boards[accountId] = boards;
          })
        );
      },

      removeAccount: async (accountId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          // Remove from Firebase
          await Promise.all([
            remove(ref(database, `users/${userId}/accounts/${accountId}`)),
            remove(ref(database, `users/${userId}/boards/${accountId}`))
          ]);

          // Update local state immediately
          set(
            produce((state) => {
              state.accounts = state.accounts.filter(a => a.id !== accountId);
              delete state.boards[accountId];
              if (state.selectedAccountId === accountId) {
                state.selectedAccountId = state.accounts[0]?.id || null;
              }
            })
          );
        } catch (error) {
          console.error('Error removing account:', error);
          throw new Error('Failed to remove account');
        }
      },

      setError: (error) => set(
        produce((state) => {
          state.error = error;
        })
      ),
      
      getAccount: (accountId) => {
        return get().accounts.find(a => a.id === accountId);
      },

      initializeStore: async (userId) => {
        if (get().initialized) return;

        try {
          const accountsRef = ref(database, `users/${userId}/accounts`);
          const boardsRef = ref(database, `users/${userId}/boards`);

          // Initial data load
          const [accountsSnapshot, boardsSnapshot] = await Promise.all([
            get(accountsRef),
            get(boardsRef)
          ]);

          const accounts: PinterestAccount[] = [];
          accountsSnapshot.forEach((childSnapshot) => {
            accounts.push({
              id: childSnapshot.key!,
              ...childSnapshot.val(),
            });
          });

          const boards: Record<string, PinterestBoard[]> = {};
          boardsSnapshot.forEach((childSnapshot) => {
            boards[childSnapshot.key!] = childSnapshot.val();
          });

          set(
            produce((state) => {
              state.accounts = accounts;
              state.boards = boards;
              state.initialized = true;
              state.selectedAccountId = accounts[0]?.id || null;
            })
          );

          // Set up real-time listeners
          onValue(accountsRef, (snapshot) => {
            const updatedAccounts: PinterestAccount[] = [];
            snapshot.forEach((childSnapshot) => {
              updatedAccounts.push({
                id: childSnapshot.key!,
                ...childSnapshot.val(),
              });
            });
            
            set(
              produce((state) => {
                state.accounts = updatedAccounts;
                if (state.selectedAccountId && !updatedAccounts.find(a => a.id === state.selectedAccountId)) {
                  state.selectedAccountId = updatedAccounts[0]?.id || null;
                }
              })
            );
          });

          onValue(boardsRef, (snapshot) => {
            const updatedBoards: Record<string, PinterestBoard[]> = {};
            snapshot.forEach((childSnapshot) => {
              updatedBoards[childSnapshot.key!] = childSnapshot.val();
            });
            
            set(
              produce((state) => {
                state.boards = updatedBoards;
              })
            );
          });
        } catch (error) {
          console.error('Error initializing store:', error);
          set(
            produce((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to initialize store';
            })
          );
        }
      },
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId,
      }),
    }
  )
);
