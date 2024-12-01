import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectPinterestAccount } from '@/lib/pinterest';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function PinterestCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Wait for auth state to be determined
        if (loading) return;

        // Redirect to sign in if no user
        if (!user) {
          console.log('No authenticated user, redirecting to signin');
          navigate('/signin', { replace: true });
          return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          console.error('Pinterest authorization error:', error);
          toast.error(`Pinterest authorization failed: ${error}`);
          navigate('/dashboard/accounts', { replace: true });
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          toast.error('Invalid callback URL');
          navigate('/dashboard/accounts', { replace: true });
          return;
        }

        setIsProcessing(true);
        await connectPinterestAccount(code);
        toast.success('Pinterest account connected successfully!');
        navigate('/dashboard/accounts', { replace: true });
      } catch (error) {
        console.error('Error processing Pinterest callback:', error);
        toast.error('Failed to connect Pinterest account. Please try again.');
        navigate('/dashboard/accounts', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, user, loading]);

  if (loading || isProcessing) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Checking authentication...' : 'Connecting your Pinterest account...'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}