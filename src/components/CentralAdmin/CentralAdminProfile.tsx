import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { ImageUpload } from '../Common/ImageUpload';
import { ShieldCheck } from 'lucide-react';

export const CentralAdminProfile: React.FC = () => {
  const { user, users, logout, updateProfileImage } = useAuth();
  const { activityLogs, bookings } = useApp();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const parkAdminsCount = users.filter((u) => u.role === 'park_admin').length;
  const issuesResolved = bookings.filter(
    (b) => b.status === 'Completed' || b.status === 'Cancelled'
  ).length;
  const correctionsCount = activityLogs.filter(
    (l) => l.category === 'Corrections' || l.method === 'Correction'
  ).length;

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CA';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <span className="text-xs font-semibold text-gray-400 block tracking-tight">
          Central administrator
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
          Profile
        </h1>
      </div>

      {/* Main Grid: Left Card, Right Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 transition-colors">
          <div className="flex items-center gap-4">
            <ImageUpload
              currentUrl={user?.avatar_url}
              fallbackInitials={initials}
              onUpload={async (file) => {
                await updateProfileImage(file);
              }}
              size="lg"
              label="Change Photo"
            />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {user?.full_name || 'Central Admin'}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Central Administrator
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Email</span>
              <span className="text-gray-900 dark:text-white font-bold">{user?.email || 'centraladmin@university.edu'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Role</span>
              <span className="text-gray-900 dark:text-white font-bold">Central Administrator</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Access</span>
              <span className="text-gray-900 dark:text-white font-bold">All parks and accounts</span>
            </div>
          </div>

          {/* Appearance Toggle */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              Appearance
            </label>
            <div className="bg-[#F3F4F6] dark:bg-[#1E2330] p-1 rounded-2xl flex items-center max-w-xs transition-colors">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#2A3142] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Account Links */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-6 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => toast.info('Password reset instructions sent to your email.')}
              className="text-gray-900 dark:text-gray-300 hover:text-black dark:hover:text-white hover:underline cursor-pointer"
            >
              Change password
            </button>
            <button
              onClick={() => logout()}
              className="text-gray-900 dark:text-red-400 hover:text-red-600 hover:underline cursor-pointer"
            >
              Sign out of all devices
            </button>
          </div>
        </div>

        {/* Right Stats & Real Recent Actions */}
        <div className="space-y-6">
          {/* 3 Metric Cards Row (Real System Metrics) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {parkAdminsCount}
              </span>
              <span className="text-[11px] text-gray-400 font-medium mt-1 block">
                Park admins
              </span>
            </div>

            <div className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {issuesResolved}
              </span>
              <span className="text-[11px] text-gray-400 font-medium mt-1 block">
                Resolved trips
              </span>
            </div>

            <div className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {correctionsCount}
              </span>
              <span className="text-[11px] text-gray-400 font-medium mt-1 block">
                Corrections
              </span>
            </div>
          </div>

          {/* Recent actions Card (Real Audit Logs) */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Recent System Actions
            </h3>

            {activityLogs.length === 0 ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">
                <ShieldCheck className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 stroke-[1.5] mb-2" />
                <p>No system activity logs recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {activityLogs.slice(0, 4).map((l) => (
                  <div key={l.id}>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {l.entity}: {l.change}
                    </p>
                    <p className="text-gray-400 mt-0.5">
                      {l.changed_by} ({l.method}) • {l.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
