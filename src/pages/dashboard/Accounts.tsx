import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { getPinterestAuthUrl, fetchPinterestBoards } from '@/lib/pinterest/api';
import { useAccountStore } from '@/lib/store';
import { toast } from 'sonner';
import { Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Accounts() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { user } = useAuth();
  const { 
    accounts, 
    selectedAccountId, 
    boards, 
    setSelectedAccount,
    error,
  } = useAccountStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleConnectPinterest = () => {
    try {
      setIsConnecting(true);
      const authUrl = getPinterestAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Pinterest:', error);
      toast.error('Failed to connect to Pinterest');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefreshBoards = async (accountId: string) => {
    try {
      setIsRefreshing(true);
      const account = useAccountStore.getState().getAccount(accountId);
      const updatedBoards = await fetchPinterestBoards(account.token.access_token);
      await useAccountStore.getState().setBoards(accountId, updatedBoards);
      toast.success('Boards refreshed successfully');
    } catch (error) {
      console.error('Error refreshing boards:', error);
      toast.error('Failed to refresh boards');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      setIsDisconnecting(true);
      await useAccountStore.getState().removeAccount(accountId);
      toast.success('Account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error('Failed to disconnect account');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-gray-900">Please sign in first</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pinterest Accounts</h1>
        <Button
          onClick={handleConnectPinterest}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Pinterest Account'}
        </Button>
      </div>

      {accounts?.length > 0 ? (
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account
            </label>
            <div className="flex items-center space-x-4">
              <select
                className="flex-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
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
              {selectedAccountId && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleRefreshBoards(selectedAccountId)}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Boards'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnectAccount(selectedAccountId)}
                    disabled={isDisconnecting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {selectedAccountId && boards?.[selectedAccountId] && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium">
                  Boards ({boards[selectedAccountId].length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {boards[selectedAccountId].map((board) => (
                  <div key={board.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-3">
                      {board.image_thumbnail_url && (
                        <img
                          src={board.image_thumbnail_url}
                          alt={board.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{board.name}</h3>
                        {board.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {board.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Privacy: {board.privacy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            No Pinterest accounts connected yet.
            Connect your first account to get started!
          </div>
        </div>
      )}
    </div>
  );
}
