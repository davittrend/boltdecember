export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccountId: null,
      boards: {},
      initialized: false,
      error: null,

      setAccounts: (accounts) => set({ accounts }),

      setSelectedAccount: (accountId) => set({ selectedAccountId: accountId }),

      setBoards: async (accountId, boards) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('User not authenticated');

        try {
          await set(ref(database, `users/${userId}/boards/${accountId}`), boards);
          set((state) => {
            state.boards[accountId] = boards;
          });
        } catch (error) {
          console.error('Error setting boards:', error);
          throw new Error('Failed to save boards');
        }
      },

      removeAccount: async (accountId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('User not authenticated');

        try {
          await Promise.all([
            remove(ref(database, `users/${userId}/accounts/${accountId}`)),
            remove(ref(database, `users/${userId}/boards/${accountId}`)),
          ]);

          set((state) => {
            state.accounts = state.accounts.filter((a) => a.id !== accountId);
            delete state.boards[accountId];
            if (state.selectedAccountId === accountId) {
              state.selectedAccountId = state.accounts[0]?.id || null;
            }
          });
        } catch (error) {
          console.error('Error removing account:', error);
          throw new Error('Failed to remove account');
        }
      },

      resetStore: () => {
        set({
          accounts: [],
          selectedAccountId: null,
          boards: {},
          initialized: false,
          error: null,
        });
      },

      setError: (error) => set({ error }),

      getAccount: (accountId) => get().accounts.find((a) => a.id === accountId),

      initializeStore: async (userId) => {
        if (get().initialized) return;

        try {
          const accountsRef = ref(database, `users/${userId}/accounts`);
          const boardsRef = ref(database, `users/${userId}/boards`);

          const [accountsSnapshot, boardsSnapshot] = await Promise.all([
            get(accountsRef),
            get(boardsRef),
          ]);

          const accounts: PinterestAccount[] = accountsSnapshot.exists()
            ? Object.entries(accountsSnapshot.val() || {}).map(([id, data]) => ({
                id,
                ...data,
              }))
            : [];

          const boards: Record<string, PinterestBoard[]> = boardsSnapshot.exists()
            ? boardsSnapshot.val()
            : {};

          set({
            accounts,
            boards,
            initialized: true,
            selectedAccountId: accounts[0]?.id || null,
          });

          // Listen for account updates
          onValue(accountsRef, (snapshot) => {
            const updatedAccounts: PinterestAccount[] = snapshot.exists()
              ? Object.entries(snapshot.val()).map(([id, data]) => ({
                  id,
                  ...data,
                }))
              : [];

            set((state) => {
              state.accounts = updatedAccounts;
              if (state.selectedAccountId && !updatedAccounts.find((a) => a.id === state.selectedAccountId)) {
                state.selectedAccountId = updatedAccounts[0]?.id || null;
              }
            });
          });

          // Listen for board updates
          onValue(boardsRef, (snapshot) => {
            const updatedBoards = snapshot.exists() ? snapshot.val() : {};
            set({ boards: updatedBoards });
          });
        } catch (error) {
          console.error('Error initializing store:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize store',
          });
        }
      },
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId,
      }),
    }
  )
);
