import React from 'react';
import { Home, Compass, Clock, User, Shield, Car, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface MobileNavProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  badgeCounts?: {
    requests?: number;
    activity?: number;
  };
}

export const MobileNav: React.FC<MobileNavProps> = ({
  role,
  activeTab,
  setActiveTab,
  badgeCounts,
}) => {
  const { users } = useAuth();
  const pendingDriversCount = users.filter((u) => u.role === 'driver' && u.status === 'Pending approval').length;

  let items: { id: string; label: string; icon: React.ReactNode; badge?: number }[] = [];

  if (role === 'student') {
    items = [
      { id: 'home', label: 'Explore', icon: <Home className="w-5 h-5" /> },
      { id: 'charter', label: 'Charter', icon: <Compass className="w-5 h-5" /> },
      { id: 'activity', label: 'Trips', icon: <Clock className="w-5 h-5" />, badge: badgeCounts?.activity },
      { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    ];
  } else if (role === 'driver') {
    items = [
      { id: 'shift', label: 'Shift', icon: <Home className="w-5 h-5" /> },
      { id: 'requests', label: 'Orders', icon: <Car className="w-5 h-5" />, badge: badgeCounts?.requests },
      { id: 'activity', label: 'Activity', icon: <Clock className="w-5 h-5" /> },
      { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    ];
  } else if (role === 'park_admin') {
    items = [
      { id: 'overview', label: 'Park', icon: <Home className="w-5 h-5" /> },
      { id: 'drivers', label: 'Fleet', icon: <Car className="w-5 h-5" />, badge: pendingDriversCount },
      { id: 'charters', label: 'Charters', icon: <Compass className="w-5 h-5" /> },
      { id: 'discipline', label: 'Discipline', icon: <ShieldAlert className="w-5 h-5" /> },
      { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    ];
  } else {
    items = [
      { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
      { id: 'bookings', label: 'Bookings', icon: <Compass className="w-5 h-5" /> },
      { id: 'activity', label: 'Activity', icon: <Clock className="w-5 h-5" /> },
      { id: 'profile', label: 'Profile', icon: <Shield className="w-5 h-5" /> },
    ];
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#151821]/95 backdrop-blur-md border-t border-gray-100 dark:border-[#252B3A] py-2 px-4 shadow-lg transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all relative py-1 px-3.5 rounded-2xl cursor-pointer ${
                isActive
                  ? 'text-[#00C269] font-black'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C269] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
