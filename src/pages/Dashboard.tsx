import { Routes, Route, Link } from 'react-router-dom';
import { CalendarDays, Users, Clock } from 'lucide-react';
import { Accounts } from './dashboard/Accounts';
import { SchedulePins } from './dashboard/SchedulePins';
import { ScheduledPins } from './dashboard/ScheduledPins';

export function Dashboard() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard/accounts"
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Users className="h-5 w-5" />
            <span>Accounts</span>
          </Link>
          <Link
            to="/dashboard/schedule"
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <CalendarDays className="h-5 w-5" />
            <span>Schedule Pins</span>
          </Link>
          <Link
            to="/dashboard/scheduled"
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Clock className="h-5 w-5" />
            <span>Scheduled Pins</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <Routes>
          <Route path="accounts" element={<Accounts />} />
          <Route path="schedule" element={<SchedulePins />} />
          <Route path="scheduled" element={<ScheduledPins />} />
          <Route index element={
            <div className="text-center mt-20">
              <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
              <p className="mt-4 text-gray-600">Connect your Pinterest account to get started</p>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}