import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../Common/StatusBadge';
import { ImageUpload } from '../Common/ImageUpload';
import { ArrowRight, Compass } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, logout, updateProfileImage } = useAuth();
  const { bookings } = useApp();
  const { theme, setTheme } = useTheme();

  // Filter actual bookings made by this logged in student
  const studentBookings = bookings.filter(
    (b) => b.requester_id === user?.id || (user?.full_name && b.requester_name.toLowerCase() === user.full_name.toLowerCase())
  );

  const totalCharters = studentBookings.length;
  const completedCharters = studentBookings.filter((b) => b.status === 'Completed').length;
  const cancelledCharters = studentBookings.filter(
    (b) => b.status === 'Cancelled' || b.status === 'Rejected'
  ).length;

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ST';

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
              fallbackInitials={initials}
              onUpload={async (file) => {
                await updateProfileImage(file);
              }}
              size="lg"
              label="Change Photo"
            />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {user?.full_name || 'Student'}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Student • {user?.matric_number || 'Undergraduate'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Email</span>
              <span className="text-gray-900 dark:text-white font-bold">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Matric No.</span>
              <span className="text-gray-900 dark:text-white font-mono font-bold">
                {user?.matric_number || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Phone</span>
              <span className="text-gray-900 dark:text-white font-mono font-bold">
                {user?.phone || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Role</span>
              <span className="text-gray-900 dark:text-white font-bold capitalize">{user?.role || 'student'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Account Status</span>
              <StatusBadge status={user?.status || 'Active'} size="sm" />
            </div>
          </div>

          {/* Warnings & Suspensions Box */}
          {((user?.warnings && user.warnings.length > 0) || user?.status === 'Suspended') && (
            <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Disciplinary Report
                </span>
                <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                  {user?.status === 'Suspended' ? 'Suspended' : `${user?.warnings?.length || 0} Warning(s)`}
                </span>
              </div>

              {user?.status === 'Suspended' && (
                <div className="p-4 bg-red-100/90 dark:bg-red-950/70 rounded-2xl text-xs text-red-900 dark:text-red-200 space-y-2 border border-red-200 dark:border-red-900">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-red-700 dark:text-red-400">Account Suspended</span>
                    <span className="font-bold text-[10px] uppercase bg-red-200 dark:bg-red-900/80 px-2 py-0.5 rounded-md text-red-800 dark:text-red-200">
                      Active Sanction
                    </span>
                  </div>

                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-red-700 dark:text-red-400 font-semibold">Duration:</span>
                      <span className="font-bold">
                        {user.suspended_until
                          ? `Until ${new Date(user.suspended_until).toLocaleDateString()} (${new Date(user.suspended_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                          : 'Indefinitely (Pending Hearing)'}
                      </span>
                    </div>
                    {user.suspended_by && (
                      <div className="flex justify-between">
                        <span className="text-red-700 dark:text-red-400 font-semibold">Issued By:</span>
                        <span className="font-bold">
                          {user.suspended_by} {user.suspended_by_role === 'park_admin' ? '(Park Admin)' : '(Central Admin)'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-red-700 dark:text-red-400 font-semibold">Restrictions:</span>
                      <span className="font-bold text-red-800 dark:text-red-300">Tricycle charters blocked</span>
                    </div>
                  </div>

                  {user.suspension_reason && (
                    <div className="mt-2 bg-white/70 dark:bg-black/30 p-2.5 rounded-xl border border-red-200/60 dark:border-red-900/40">
                      <span className="font-bold block text-[10px] text-red-700 dark:text-red-400 uppercase tracking-wider mb-0.5">
                        Official Reason:
                      </span>
                      <p className="italic font-medium">"{user.suspension_reason}"</p>
                    </div>
                  )}

                  <p className="text-[10px] text-red-600 dark:text-red-400 pt-1">
                    To appeal or request account reactivation, submit a formal appeal to the Central Transport Office.
                  </p>
                </div>
              )}

              {user?.warnings && user.warnings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-400 block">
                    Recorded Warnings:
                  </span>
                  {user.warnings.map((w) => (
                    <div key={w.id} className="text-[11px] text-amber-900 dark:text-amber-300 bg-white/60 dark:bg-black/20 p-2 rounded-xl">
                      <span className="font-semibold">• {w.date} (By {w.issued_by}):</span> {w.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

        {/* Right Column: Dynamic Stats and Recent Bookings */}
        <div className="md:col-span-7 space-y-6">
          {/* 3 Metric Cards Row (Actual User Statistics) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                {totalCharters}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1 block">
                Total Charters
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

          {/* Recent Trips Section (Real User Bookings) */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Trips</h3>

            {studentBookings.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-gray-400 dark:text-gray-500">
                <Compass className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 stroke-[1.5]" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">No charter trips yet</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  When you request a tricycle charter ride across campus, your trips and receipts will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentBookings.slice(0, 5).map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-800 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                        <span>{b.pickup}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span>{b.destination}</span>
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {b.scheduled_time || (b.when_type === 'Now' ? 'On demand' : b.when_type)}
                        {b.assigned_vehicle && ` • ${b.assigned_vehicle}`}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
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
