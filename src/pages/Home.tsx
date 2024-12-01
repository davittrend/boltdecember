import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { CalendarDays, Clock, Layout } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-white">
      <div className="relative isolate">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Streamline Your Pinterest Content Strategy
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Schedule, organize, and manage your Pinterest content with ease. Boost your Pinterest presence with our powerful scheduling and content management tools.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="flex justify-center">
              <CalendarDays className="h-12 w-12 text-pink-600" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Smart Scheduling</h3>
            <p className="mt-2 text-gray-600">Schedule pins at optimal times for maximum engagement</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              <Layout className="h-12 w-12 text-pink-600" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Content Organization</h3>
            <p className="mt-2 text-gray-600">Keep your content organized and easily accessible</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              <Clock className="h-12 w-12 text-pink-600" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Time Saving</h3>
            <p className="mt-2 text-gray-600">Automate your Pinterest workflow and save valuable time</p>
          </div>
        </div>
      </div>
    </div>
  );
}