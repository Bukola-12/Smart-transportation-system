import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { Clock, Car, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const DriverActivityView: React.FC = () => {
  const { activityLogs, drivers, bookings } = useApp();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'trips' | 'logs'>('all');

  const currentDriver = drivers.find((d) => d.name === user?.full_name || d.user_id === user?.id) || drivers[0];

  const isBusDriver =
    currentDriver?.vehicle_type === 'bus' ||
    user?.preferred_vehicle_type === 'bus' ||
    user?.vehicle_assigned?.toLowerCase().startsWith('bus');

  // Find driver's actual charter bookings
  const myBookings = bookings.filter(
    (b) =>
      b.assigned_driver_id === currentDriver.id ||
      b.assigned_driver_name?.toLowerCase() === currentDriver.name.toLowerCase() ||
      b.preferred_driver_id === currentDriver.id
  );

  // Find driver's shift and status activity logs
  const myLogs = activityLogs.filter(
    (l) =>
      l.entity === currentDriver.name ||
      l.entity === currentDriver.vehicle_assigned ||
      l.changed_by === currentDriver.name ||
      (user?.full_name && l.changed_by === user.full_name)
  );

  const completedTrips = myBookings.filter((b) => b.status === 'Completed').length;
  const activeTrips = myBookings.filter((b) => b.status === 'Accepted' || b.status === 'In progress').length;

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00C269]">
            {isBusDriver ? 'Campus Shuttle Service Log' : 'Tricycle Driver Operations'}
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Driver Activity
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5">
            Shift history, passenger trips, and operational status confirmations
          </p>
        </div>

        {/* Quick Driver Stats Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs bg-[#EBF7EE] dark:bg-emerald-950/40 text-[#00C269] font-bold px-3 py-1.5 rounded-xl border border-[#D8F3DC] dark:border-emerald-800/60">
            {currentDriver.vehicle_assigned} • {currentDriver.operational_status}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards (For Tricycle: Completed trips & Charters; For Bus: Shift status & Route) */}
      {!isBusDriver ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-xs">
            <span className="text-2xl font-black text-gray-900 dark:text-white block">
              {myBookings.length}
            </span>
            <span className="text-xs text-gray-400 font-medium">Assigned Trips</span>
          </div>
          <div className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-xs">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
              {completedTrips}
            </span>
            <span className="text-xs text-gray-400 font-medium">Completed</span>
          </div>
          <div className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-xs">
            <span className="text-2xl font-black text-amber-500 block">
              {activeTrips}
            </span>
            <span className="text-xs text-gray-400 font-medium">Active Trips</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-xs">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
              {currentDriver.shift_status}
            </span>
            <span className="text-xs text-gray-400 font-medium">Current Shift</span>
          </div>
          <div className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-xs">
            <span className="text-lg font-black text-gray-900 dark:text-white block">
              Gate ⇄ SUB Route
            </span>
            <span className="text-xs text-gray-400 font-medium">Fixed Shuttle Service</span>
          </div>
        </div>
      )}

      {/* Segmented Filter Pills */}
      {!isBusDriver && (
        <div className="flex items-center gap-1.5 bg-[#EAECEF] dark:bg-[#1E2330] p-1 rounded-2xl w-fit transition-colors">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-[#252B3A] text-gray-900 dark:text-white shadow-xs font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            All Activity ({myBookings.length + myLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('trips')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'trips'
                ? 'bg-white dark:bg-[#252B3A] text-gray-900 dark:text-white shadow-xs font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Passenger Trips ({myBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('logs')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'logs'
                ? 'bg-white dark:bg-[#252B3A] text-gray-900 dark:text-white shadow-xs font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Status Logs ({myLogs.length})
          </button>
        </div>
      )}

      {/* Main Activity Content */}
      <div className="space-y-3">
        {/* Render Trips */}
        {(filter === 'all' || filter === 'trips') && !isBusDriver && myBookings.length > 0 && (
          <div className="space-y-3">
            {filter === 'all' && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block pt-1">
                Passenger Trips & Dispatches
              </span>
            )}
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-[#151821] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-[#252B3A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-400">#{b.id}</span>
                    <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{b.pickup}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      <span>{b.destination}</span>
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span>Passenger: <strong className="text-gray-700 dark:text-gray-300 font-semibold">{b.requester_name}</strong></span>
                    {b.requester_phone && <span>• 📞 {b.requester_phone}</span>}
                    <span>• {b.created_at}</span>
                  </div>
                  {b.pickup_note && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                      Note: "{b.pickup_note}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <StatusBadge status={b.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render Status & Shift Logs */}
        {(filter === 'all' || filter === 'logs' || isBusDriver) && myLogs.length > 0 && (
          <div className="space-y-3">
            {filter === 'all' && !isBusDriver && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block pt-3">
                Shift & Status Changes
              </span>
            )}
            {myLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-xs flex items-center justify-between transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    {log.change}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span>{log.time}</span>
                    <span>•</span>
                    <span>{log.entity}</span>
                    <span>•</span>
                    <span>By {log.changed_by}</span>
                  </div>
                </div>

                <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded-full">
                  {log.method}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Empty state if nothing matches */}
        {((filter === 'trips' && myBookings.length === 0) ||
          (filter === 'logs' && myLogs.length === 0) ||
          (myBookings.length === 0 && myLogs.length === 0)) && (
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-10 border border-gray-100 dark:border-[#252B3A] text-center text-gray-400 space-y-2 transition-colors">
            <Clock className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">No activity in this category</p>
            <p className="text-xs text-gray-400">
              When shifts, trips, and status updates occur, they will be logged here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
