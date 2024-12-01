import { RouteObject } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { SignIn } from '@/pages/auth/SignIn';
import { SignUp } from '@/pages/auth/SignUp';
import { Dashboard } from '@/pages/Dashboard';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PinterestCallback } from '@/pages/auth/PinterestCallback';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/callback',
    element: <PinterestCallback />,
  },
  {
    path: '/dashboard/*',
    element: (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    ),
  },
];