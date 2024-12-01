import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { onValue, ref, get, set } from 'firebase/database';
import { database } from '../firebase';
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
  getAccount: (accountId: string) => PinterestAccount;
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
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) {
          throw new Error('Account not found');
        }

        await set(ref(database, `users/${account.user.username}/boards/${accountId}`), boards);
        
        set(
          produce((state) => {
            state.boards[accountId] = boards;
          })
        );
      },

      setError: (error) => set(
        produce((state) => {
          state.error = error;
        })
      ),
      
      getAccount: (accountId) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) {
          throw new Error('Account not found');
        }
        return account;
      },

      initializeStore: async (userId) => {
        if (get().initialized) return;

        const accountsSnapshot = await get(ref(database, `users/${userId}/accounts`));
        const boardsSnapshot = await get(ref(database, `users/${userId}/boards`));

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

        const accountsRef = ref(database, `users/${userId}/accounts`);
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

        const boardsRef = ref(database, `users/${userId}/boards`);
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
      },
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
