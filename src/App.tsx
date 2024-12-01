import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { routes } from '@/routes';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { getApps } from 'firebase/app';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: routes,
  },
]);

export default function App() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Verify Firebase initialization
      if (getApps().length === 0) {
        throw new Error('Firebase failed to initialize');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize application');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please check your environment configuration and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}