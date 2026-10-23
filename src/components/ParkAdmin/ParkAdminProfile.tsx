import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../Common/StatusBadge';
import { ImageUpload } from '../Common/ImageUpload';
import { ShieldCheck } from 'lucide-react';

export const ParkAdminProfile: React.FC = () => {
  const { user, logout, updateProfileImage } = useAuth();
  const { activityLogs } = useApp();
  const { theme, setTheme } = useTheme();

  // Filter actual audit logs performed by this admin
  const adminLogs = activityLogs.filter(
    (l) => user?.full_name && l.changed_by.toLowerCase() === user.full_name.toLowerCase()
  );

  const updatesCount = adminLogs.length;
  const driversAssisted = adminLogs.filter((l) => l.method === 'On behalf').length;
  const correctionsCount = adminLogs.filter(
    (l) => l.method === 'Correction' || l.category === 'Corrections'
  ).length;

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PA';

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
        Park Administrator Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Admin Profile Card */}
        <div className="md:col-span-5 bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 transition-colors">
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
                {user?.full_name || 'Park Administrator'}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Park Administrator • {user?.park_scope || 'Campus Gate'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Email</span>
              <span className="text-gray-900 dark:text-white font-bold">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Role</span>
              <span className="text-gray-900 dark:text-white font-bold">Park Administrator</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Park Scope</span>
              <span className="text-gray-900 dark:text-white font-bold">{user?.park_scope || 'Campus Gate'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Account Status</span>
              <StatusBadge status={user?.status || 'Active'} size="sm" />
            </div>
          </div>

          {/* Appearance Toggle */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              Appearance
            </label>
            <div className="bg-[#F3F4F6] dark:bg-[#1E2330] p-1 rounded-2xl flex items-center transition-colors">
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

          {/* Sign Out Button */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => logout()}
              className="w-full text-center text-red-600 dark:text-red-400 font-bold text-xs py-3 px-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              Sign out of account
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Park Admin Stats & Recent Updates */}
        <div className="md:col-span-7 space-y-6">
          {/* 3 Metric Cards Row (Real Admin Metrics) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {updatesCount}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1 block">
                Updates recorded
              </span>
            </div>

            <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {driversAssisted}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1 block">
                Drivers assisted
              </span>
            </div>

            <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {correctionsCount}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1 block">
                Corrections
              </span>
            </div>
          </div>

          {/* Recent Updates Section (Real Log Entries) */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Updates</h3>

            {adminLogs.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-gray-400 dark:text-gray-500">
                <ShieldCheck className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 stroke-[1.5]" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">No terminal updates logged yet</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  When you check in drivers, update vehicle departure states, or correct park records, your action history will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminLogs.slice(0, 5).map((l) => (
                  <div
                    key={l.id}
                    className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-800 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        {l.entity}: {l.change}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        Method: {l.method}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {l.time}
                    </span>
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
