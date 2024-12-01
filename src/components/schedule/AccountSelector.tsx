import { useAccountStore } from '@/lib/store';

export function AccountSelector() {
  const { accounts, selectedAccountId, setSelectedAccount } = useAccountStore();

  if (!accounts?.length) {
    return (
      <div className="text-sm text-gray-500">
        No Pinterest accounts connected. Please connect an account first.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Pinterest Account
      </label>
      <select
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
        value={selectedAccountId || ''}
        onChange={(e) => setSelectedAccount(e.target.value)}
      >
        <option value="">Select an account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.user.username}
          </option>
        ))}
      </select>
    </div>
  );
}