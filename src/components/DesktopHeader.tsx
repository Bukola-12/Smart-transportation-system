import React from 'react';
import { Logo } from './Common/Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { 
  Home, 
  Compass, 
  Clock, 
  User, 
  Car, 
  LogOut, 
  ArrowUpDown,
  Sun,
  Moon,
  ShieldAlert
} from 'lucide-react';

interface DesktopHeaderProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  badgeCounts?: {
    requests?: number;
    activity?: number;
  };
  currentPark?: 'Campus Gate' | 'SUB';
  onSwitchPark?: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  role,
  activeTab,
  setActiveTab,
  badgeCounts,
  currentPark,
  onSwitchPark,
}) => {
  const { user, users, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const pendingDriversCount = users.filter((u) => u.role === 'driver' && u.status === 'Pending approval').length;
  const isBusDriver =
    user?.role === 'driver' &&
    (user?.preferred_vehicle_type === 'bus' ||
      user?.vehicle_assigned?.toLowerCase().startsWith('bus'));

  let items: { id: string; label: string; icon: React.ReactNode; badge?: number }[] = [];

  if (role === 'student') {
    items = [
      { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
      { id: 'charter', label: 'Tricycle Charter', icon: <Compass className="w-4 h-4" /> },
      { id: 'activity', label: 'My Trips', icon: <Clock className="w-4 h-4" />, badge: badgeCounts?.activity },
      { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    ];
  } else if (role === 'driver') {
    items = [
      { id: 'shift', label: 'Shift & Status', icon: <Home className="w-4 h-4" /> },
      ...(!isBusDriver
        ? [{ id: 'requests', label: 'Charter Requests', icon: <Car className="w-4 h-4" />, badge: badgeCounts?.requests }]
        : []),
      { id: 'activity', label: 'Activity Log', icon: <Clock className="w-4 h-4" /> },
      { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    ];
  } else if (role === 'park_admin') {
    items = [
      { id: 'overview', label: 'Park Overview', icon: <Home className="w-4 h-4" /> },
      { id: 'drivers', label: 'Drivers Fleet', icon: <Car className="w-4 h-4" />, badge: pendingDriversCount },
      { id: 'charters', label: 'Park Charters', icon: <Compass className="w-4 h-4" /> },
      { id: 'discipline', label: 'Discipline', icon: <ShieldAlert className="w-4 h-4" /> },
      { id: 'activity', label: 'Audit Log', icon: <Clock className="w-4 h-4" /> },
      { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    ];
  }

  return (
    <header className="hidden md:block bg-white dark:bg-[#151821] border-b border-gray-100 dark:border-[#252B3A] sticky top-0 z-40 transition-colors shadow-xs">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Left: Brand Logo & Park Indicator */}
        <div className="flex items-center gap-6">
          <Logo size="md" />

          {role === 'park_admin' && currentPark && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#1E2330] px-3 py-1.5 rounded-xl">
                {currentPark} Car Park
              </span>
              {onSwitchPark && (
                <button
                  onClick={onSwitchPark}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Switch</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1.5">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#00C269] text-white shadow-md shadow-emerald-500/20 font-black'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E2330]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="ml-1 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Right: Theme Toggle, User Profile & Logout */}
        <div className="flex items-center gap-4">
          {/* Quick Light/Dark Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-700" />
            )}
          </button>

          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold text-xs overflow-hidden border border-gray-100 dark:border-gray-700 shadow-xs">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user ? user.full_name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-bold text-gray-900 dark:text-white block leading-tight">
                {user?.full_name}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-400 capitalize font-medium">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
