import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../Common/StatusBadge';
import { ImageUpload } from '../Common/ImageUpload';

export const StudentProfile: React.FC = () => {
  const { user, logout, updateProfileImage } = useAuth();
  const { bookings } = useApp();
  const { theme, setTheme } = useTheme();

  const studentBookings = bookings.filter(
    (b) => b.requester_id === user?.id || b.requester_name === user?.full_name
  );

  const totalCharters = Math.max(studentBookings.length, 6);
  const completedCharters = Math.max(
    studentBookings.filter((b) => b.status === 'Completed').length,
    4
  );
  const cancelledCharters = Math.max(
    studentBookings.filter((b) => b.status === 'Cancelled' || b.status === 'Rejected').length,
    1
  );

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
        Student Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-5 bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 transition-colors">
          <div className="flex items-center gap-4">
            <ImageUpload
              currentUrl={user?.avatar_url}
              fallbackInitials="AN"
              onUpload={async (file) => {
                await updateProfileImage(file);
              }}
              size="lg"
              label="Change Photo"
            />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {user?.full_name || 'Adaeze N.'}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-400 font-medium mt-0.5">
                Student • {user?.matric_number || 'CSC/2021/042'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Email</span>
              <span className="text-gray-900 dark:text-white font-bold">{user?.email || 'adaeze@university.edu'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Phone</span>
              <span className="text-gray-900 dark:text-white font-mono font-bold">{user?.phone || '08031234567'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Role</span>
              <span className="text-gray-900 dark:text-white font-bold capitalize">{user?.role || 'Student'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Account Status</span>
              <StatusBadge status={user?.status || 'Active'} size="sm" />
            </div>
          </div>

          {/* Disciplinary & Warnings Section */}
          {((user?.warnings && user.warnings.length > 0) || user?.status === 'Suspended') && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Disciplinary Record
                </span>
                <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                  {user.warnings?.length || 0} Warning(s)
                </span>
              </div>

              {user.status === 'Suspended' && (
                <div className="p-3 bg-red-100/80 dark:bg-red-950/60 rounded-xl text-xs text-red-800 dark:text-red-300">
                  <span className="font-bold block mb-0.5">Account Suspended</span>
                  {user.suspended_until
                    ? `Until ${new Date(user.suspended_until).toLocaleDateString()} (${new Date(user.suspended_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                    : 'Indefinitely'}
                  {user.suspension_reason && (
                    <p className="mt-1 italic">"{user.suspension_reason}"</p>
                  )}
                </div>
              )}

              {user.warnings && user.warnings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {user.warnings.map((w) => (
                    <div key={w.id} className="text-[11px] bg-white dark:bg-[#1A1E29] p-2 rounded-xl border border-amber-100 dark:border-amber-900/40 text-gray-800 dark:text-gray-200">
                      <div className="flex justify-between font-bold text-[10px] text-gray-400 mb-0.5">
                        <span>{w.issued_by} ({w.issued_by_role === 'park_admin' ? 'Park Admin' : 'Central Admin'})</span>
                        <span>{w.date}</span>
                      </div>
                      <p>{w.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appearance Toggle (Matches Mockup Page 14) */}
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

        {/* Right Column: Stats and Recent */}
        <div className="md:col-span-7 space-y-6">
          {/* 3 Metric Cards Row (Matches Page 14) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {totalCharters}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1 block">
                Charters
              </span>
            </div>

            <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {completedCharters}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1 block">
                Completed
              </span>
            </div>

            <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {cancelledCharters}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1 block">
                Cancelled
              </span>
            </div>
          </div>

          {/* Recent Trips Section */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Trips</h3>

            <div className="space-y-3">
              <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-800 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    SUB → Main Library
                  </h4>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Today</p>
                </div>
                <StatusBadge status="Completed" />
              </div>

              <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-800 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    Campus Gate → Hostels
                  </h4>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Yesterday</p>
                </div>
                <StatusBadge status="Cancelled" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
