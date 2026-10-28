import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../Common/StatusBadge';
import { ImageUpload } from '../Common/ImageUpload';
import { ArrowRight, Car } from 'lucide-react';

export const DriverProfileView: React.FC = () => {
  const { user, logout, updateProfileImage } = useAuth();
  const { drivers, bookings, activityLogs } = useApp();
  const { theme, setTheme } = useTheme();

  // Find driver record matching current user
  const currentDriver = drivers.find(
    (d) => d.user_id === user?.id || (user?.full_name && d.name.toLowerCase() === user.full_name.toLowerCase())
  );

  const isBusDriver =
    currentDriver?.vehicle_type === 'bus' ||
    user?.preferred_vehicle_type === 'bus' ||
    user?.vehicle_assigned?.toLowerCase().startsWith('bus') ||
    currentDriver?.vehicle_assigned?.toLowerCase().startsWith('bus');

  // Filter real charters handled by this driver (only relevant for tricycle drivers)
  const driverBookings = bookings.filter(
    (b) => b.assigned_driver_id === user?.id || (user?.full_name && b.assigned_driver_name?.toLowerCase() === user.full_name.toLowerCase())
  );

  const completedCharters = driverBookings.filter((b) => b.status === 'Completed').length;
  const tripsToday = currentDriver?.trips_today ?? completedCharters;
  const shiftStatus = currentDriver?.shift_status || 'Not checked in';
  const operationalStatus = currentDriver?.operational_status || 'Available';

  const vehicleAssigned = user?.vehicle_assigned || currentDriver?.vehicle_assigned || (isBusDriver ? 'Campus Bus' : 'Campus Tricycle');
  const location = currentDriver?.current_location || user?.park_scope || 'Campus Gate';

  const myActivityLogs = activityLogs.filter(
    (l) =>
      (currentDriver && (l.entity === currentDriver.name || l.entity === currentDriver.vehicle_assigned || l.changed_by === currentDriver.name)) ||
      (user?.full_name && l.changed_by === user.full_name)
  );

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (isBusDriver ? 'BD' : 'TD');

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
        Driver Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Driver Card */}
        <div className="md:col-span-5 bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 transition-colors">
          <div className="flex items-center gap-4">
            <ImageUpload
              currentUrl={user?.avatar_url || currentDriver?.avatar_url}
              fallbackInitials={initials}
              onUpload={async (file) => {
                await updateProfileImage(file);
              }}
              size="lg"
              label="Change Photo"
            />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {user?.full_name || currentDriver?.name || 'Driver'}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {isBusDriver ? 'Campus Shuttle Bus Driver' : 'Campus Tricycle Driver'} • {vehicleAssigned}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Email</span>
              <span className="text-gray-900 dark:text-white font-bold">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Phone</span>
              <span className="text-gray-900 dark:text-white font-mono font-bold">
                {user?.phone || currentDriver?.phone || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Assigned Vehicle</span>
              <span className="text-gray-900 dark:text-white font-bold">{vehicleAssigned}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Current Park</span>
              <span className="text-gray-900 dark:text-white font-bold">{location}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Account Status</span>
              <StatusBadge status={user?.status || 'Active'} size="sm" />
            </div>
          </div>

          {/* Disciplinary Record for Driver */}
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
                    ? `Until ${new Date(user.suspended_until).toLocaleDateString()}`
                    : 'Indefinitely'}
                  {user.suspension_reason && <p className="mt-1 italic">"{user.suspension_reason}"</p>}
                </div>
              )}

              {user.warnings && user.warnings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {user.warnings.map((w) => (
                    <div key={w.id} className="text-[11px] text-amber-900 dark:text-amber-300">
                      <span className="font-semibold">• {w.date}:</span> {w.reason}
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

        {/* Right Column: Dynamic Driver Stats & Recent Charters */}
        <div className="md:col-span-7 space-y-6">
          {/* Metric Cards Row */}
          {isBusDriver ? (
            /* Bus Driver: Only operational and shift metrics, NO trips made */
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
                <span className="text-xl md:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block leading-tight pt-1">
                  {shiftStatus}
                </span>
                <span className="text-xs text-gray-400 font-medium mt-1 block">
                  Shift status
                </span>
              </div>

              <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
                <span className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white block leading-tight pt-1">
                  {operationalStatus}
                </span>
                <span className="text-xs text-gray-400 font-medium mt-1 block">
                  Status
                </span>
              </div>

              <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white block leading-tight pt-1">
                  Gate ⇄ SUB
                </span>
                <span className="text-xs text-gray-400 font-medium mt-1 block">
                  Route
                </span>
              </div>
            </div>
          ) : (
            /* Tricycle Driver: Trips today, shift status, and charters */
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                  {tripsToday}
                </span>
                <span className="text-xs text-gray-400 font-medium mt-1 block">
                  Trips today
                </span>
              </div>

              <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
                <span className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white block leading-tight pt-1">
                  {shiftStatus}
                </span>
                <span className="text-xs text-gray-400 font-medium mt-1 block">
                  Shift status
                </span>
              </div>

              <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 text-left border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                  {completedCharters}
                </span>
                <span className="text-xs text-gray-400 font-medium mt-1 block">
                  Charters
                </span>
              </div>
            </div>
          )}

          {/* Recent Activity Section */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {isBusDriver ? 'Campus Shuttle Operations' : 'Recent Charters'}
            </h3>

            {isBusDriver ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#1A1E29] border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                  <span className="font-extrabold text-gray-900 dark:text-white block text-sm">
                    🚌 Campus Shuttle Route Operations
                  </span>
                  <p>
                    Assigned to scheduled campus shuttle service connecting <strong>Campus Gate Car Park</strong> and <strong>SUB Car Park</strong>. Regular fare ticketing is administered directly at car park boarding sheds.
                  </p>
                </div>

                {myActivityLogs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-3.5 flex items-center justify-between border border-gray-100 dark:border-gray-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block">{log.change}</span>
                      <span className="text-[11px] text-gray-400">{log.time} • Recorded by {log.changed_by}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {log.method}
                    </span>
                  </div>
                ))}
              </div>
            ) : driverBookings.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-gray-400 dark:text-gray-500">
                <Car className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 stroke-[1.5]" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">No charter trips assigned yet</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  When you check in and accept tricycle charter orders, your completed passenger journeys will be listed here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {driverBookings.slice(0, 5).map((b) => (
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
                        Passenger: {b.requester_name}
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
