import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../Common/Logo';
import { 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LayoutDashboard, 
  MapPin, 
  Truck, 
  Compass, 
  Users, 
  FileText, 
  User as UserIcon,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface CentralAdminLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const CentralAdminLayout: React.FC<CentralAdminLayoutProps> = ({
  currentTab,
  setCurrentTab,
  children,
}) => {
  const { logout, users, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const pendingApprovalsCount = users.filter(
    (u) => (u.role === 'park_admin' || u.role === 'driver') && u.status === 'Pending approval'
  ).length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'parks', label: 'Parks', icon: <MapPin className="w-4 h-4" /> },
    { id: 'drivers-vehicles', label: 'Drivers & Vehicles', icon: <Truck className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings & Charters', icon: <Compass className="w-4 h-4" /> },
    { 
      id: 'admin-accounts', 
      label: 'Accounts & Discipline', 
      icon: <Users className="w-4 h-4" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    },
    { id: 'activity-log', label: 'Activity & Audit Log', icon: <FileText className="w-4 h-4" /> },
    { id: 'profile', label: 'Admin Profile', icon: <UserIcon className="w-4 h-4" /> },
  ];

  const handleTabSelect = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const currentTabLabel = navItems.find((item) => item.id === currentTab)?.label || 'Overview';

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#0D1017] text-gray-900 dark:text-white flex flex-col md:flex-row transition-colors">
      {/* ======================================================== */}
      {/* 1. Mobile Top Navigation Bar (Sticky with Menu Trigger) */}
      {/* ======================================================== */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#151821]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#252B3A] px-4 py-3 flex items-center justify-between shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-2xl bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#2A3142] text-gray-800 dark:text-gray-100 transition-colors relative cursor-pointer"
            aria-label="Open central admin navigation menu"
          >
            <Menu className="w-5 h-5" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-[#151821] animate-pulse" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">/</span>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">
              {currentTabLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-700" />
            )}
          </button>

          <div className="w-8 h-8 rounded-full bg-[#00C269] text-white font-extrabold text-xs flex items-center justify-center overflow-hidden border border-white dark:border-gray-800 shadow-xs">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>CA</span>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. Mobile Collapsible Sidebar Slide-over Drawer         */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-[#151821] border-r border-gray-100 dark:border-[#252B3A] h-full flex flex-col justify-between p-6 shadow-2xl z-10 transition-transform duration-300 ease-in-out">
            <div>
              {/* Drawer Top Row: Logo & Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                <Logo size="md" />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Central Admin Info Pill */}
              <div className="my-5 p-3.5 bg-[#EBF7EE] dark:bg-emerald-950/40 rounded-2xl border border-[#D8F3DC] dark:border-emerald-800/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C269] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    System Authority
                  </span>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                    {user?.full_name || 'Central Administrator'}
                  </h4>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-mono">
                    Full Campus Oversight
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-[#00C269] text-white shadow-sm font-extrabold'
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E2330]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-white text-emerald-700'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            isActive ? 'text-white/80' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Actions: Theme & Sign Out */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600" />
                  )}
                  <span>{theme === 'dark' ? 'Light View' : 'Dark View'}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {theme}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. Desktop / Laptop Docked Sidebar (Hidden on Mobile)     */}
      {/* ======================================================== */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white dark:bg-[#151821] border-r border-gray-100 dark:border-[#252B3A] flex-col justify-between p-6 flex-shrink-0 transition-colors sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Logo & Theme Toggle */}
          <div className="pb-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <Logo size="md" />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </button>
          </div>

          {/* Central Admin Badge Pill */}
          <div className="my-5 p-3 bg-[#EBF7EE] dark:bg-emerald-950/40 rounded-2xl border border-[#D8F3DC] dark:border-emerald-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00C269] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Central Console
              </span>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {user?.full_name || 'Central Admin'}
              </h4>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#00C269] text-white shadow-sm font-extrabold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1E2330]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white text-emerald-700'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sign Out at bottom of docked sidebar */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 4. Main Responsive Content Area                         */}
      {/* ======================================================== */}
      <main className="flex-1 px-3 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
};
