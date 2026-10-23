import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../Common/StatusBadge';
import { Plus, Edit2 } from 'lucide-react';

interface CentralAdminOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddAdmin: () => void;
}

export const CentralAdminOverview: React.FC<CentralAdminOverviewProps> = ({
  onNavigateTab,
  onOpenAddAdmin,
}) => {
  const { toast } = useToast();
  const { 
    drivers, 
    vehicles, 
    parks, 
    bookings, 
    shiftConfig, 
    updateShiftConfig, 
    runDailyShiftClosing
  } = useApp();
  const { user } = useAuth();

  const [isEditingClosing, setIsEditingClosing] = useState(false);
  const [closingTimeInput, setClosingTimeInput] = useState(shiftConfig.daily_closing_time);

  const campusGatePark = parks.find((p) => p.short_name === 'Campus Gate') || parks[0];
  const subPark = parks.find((p) => p.short_name === 'SUB') || parks[1];

  const handleSaveClosing = () => {
    updateShiftConfig({ daily_closing_time: closingTimeInput });
    setIsEditingClosing(false);
    toast.success(`Shift closing time updated to ${closingTimeInput}.`);
  };

  const handleRunClosingNow = () => {
    if (window.confirm('Execute 9:00 PM shift closing evaluation now? (FR-11, FR-12)\nThis will close active driver shifts and flag unresolved bookings for review.')) {
      runDailyShiftClosing(user?.full_name || 'Central Admin');
      toast.success('Shift closing executed successfully.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Row (Matches Page 7 Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight">
            Central administrator
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
            System overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('activity-log')}
            className="bg-white dark:bg-[#151821] hover:bg-gray-50 dark:hover:bg-[#1E2330] border border-gray-200 dark:border-[#252B3A] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            Review activity
          </button>
          <button
            onClick={onOpenAddAdmin}
            className="bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.98] text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add park admin</span>
          </button>
        </div>
      </div>

      {/* 4 Big Metric Cards Row (Matches Page 7 Screenshot: 12 Drivers on duty, 5 Buses available, 3 Active charters, 2 Need review) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white block tracking-tight">
            12
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-2 block">
            Drivers on duty
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white block tracking-tight">
            5
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-2 block">
            Buses available
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white block tracking-tight">
            3
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-2 block">
            Active charters
          </span>
        </div>

        {/* Metric 4 (Need review - Soft yellow/amber card) */}
        <div className="bg-[#FEF8E8] dark:bg-amber-950/40 rounded-3xl p-6 border border-[#FDE68A]/60 dark:border-amber-800/60 transition-colors">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-amber-200 block tracking-tight">
            2
          </span>
          <span className="text-xs text-[#92400E] dark:text-amber-400 font-semibold mt-2 block">
            Need review
          </span>
        </div>
      </div>

      {/* 2-Column Main Dashboard Layout (Matches Page 7 Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols Wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Drivers and vehicles - One shared pool across both parks */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Drivers and vehicles
              </h3>
              <span className="text-xs text-gray-400 font-medium">
                One shared pool across both parks
              </span>
            </div>

            {/* Shared Fleet Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                    <th className="pb-3 pt-1">Vehicle · driver</th>
                    <th className="pb-3 pt-1">Shift</th>
                    <th className="pb-3 pt-1">Status</th>
                    <th className="pb-3 pt-1">Location</th>
                    <th className="pb-3 pt-1">Last update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {/* Bus 04 · Emeka A. */}
                  <tr>
                    <td className="py-3.5 font-bold text-gray-900 dark:text-white">Bus 04 · Emeka A.</td>
                    <td className="py-3.5 text-gray-600 dark:text-gray-400">On duty</td>
                    <td className="py-3.5">
                      <StatusBadge status="Available" size="sm" />
                    </td>
                    <td className="py-3.5 text-gray-800 dark:text-gray-200 font-medium">Campus Gate</td>
                    <td className="py-3.5 text-gray-400">Driver · 6 min ago</td>
                  </tr>

                  {/* Bus 11 · Tunde B. */}
                  <tr>
                    <td className="py-3.5 font-bold text-gray-900 dark:text-white">Bus 11 · Tunde B.</td>
                    <td className="py-3.5 text-gray-600 dark:text-gray-400">On duty</td>
                    <td className="py-3.5">
                      <StatusBadge status="On break" size="sm" />
                    </td>
                    <td className="py-3.5 text-gray-800 dark:text-gray-200 font-medium">SUB</td>
                    <td className="py-3.5 text-gray-400">Admin · 18 min ago</td>
                  </tr>

                  {/* Bus 07 · Kemi O. */}
                  <tr>
                    <td className="py-3.5 font-bold text-gray-900 dark:text-white">Bus 07 · Kemi O.</td>
                    <td className="py-3.5 text-gray-600 dark:text-gray-400">On duty</td>
                    <td className="py-3.5">
                      <StatusBadge status="Unconfirmed" size="sm" />
                    </td>
                    <td className="py-3.5 text-gray-800 dark:text-gray-200 font-medium">Unknown / Other</td>
                    <td className="py-3.5 text-gray-400">2 h 10 min ago</td>
                  </tr>

                  {/* Tricycle 02 · Sade I. */}
                  <tr>
                    <td className="py-3.5 font-bold text-gray-900 dark:text-white">Tricycle 02 · Sade I.</td>
                    <td className="py-3.5 text-gray-600 dark:text-gray-400">On duty</td>
                    <td className="py-3.5">
                      <StatusBadge status="On trip" size="sm" />
                    </td>
                    <td className="py-3.5 text-gray-800 dark:text-gray-200 font-medium">Campus Gate</td>
                    <td className="py-3.5 text-gray-400">Driver · 3 min ago</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => onNavigateTab('drivers-vehicles')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                View all drivers and vehicles →
              </button>
            </div>
          </div>

          {/* Row of 2 Park Cards (Matches Page 7 Screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campus Gate Car Park */}
            <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3 transition-colors">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
                  Campus Gate Car Park
                </h4>
                <StatusBadge status="Confirmed" size="sm" />
              </div>

              <div className="pt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {campusGatePark.bus_count}
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                  buses at the park
                </span>
              </div>

              <p className="text-xs text-gray-400 pt-1">
                Updated 4 min ago
              </p>
            </div>

            {/* SUB Car Park */}
            <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3 transition-colors">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
                  SUB Car Park
                </h4>
                <StatusBadge status="Unconfirmed" size="sm" />
              </div>

              <div className="pt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {subPark.bus_count}
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                  buses at the park
                </span>
              </div>

              <p className="text-xs text-gray-400 pt-1">
                Last confirmed 2 h 10 min ago
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Matches Page 7 Screenshot) */}
        <div className="space-y-6">
          {/* Card: Needs review */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Needs review
            </h3>

            <div className="space-y-3">
              <div
                onClick={() => onNavigateTab('bookings')}
                className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E2330] p-2 -mx-2 rounded-xl transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-gray-200">1 trip left open at closing</span>
                <span className="bg-[#FEF3C7] dark:bg-yellow-950/80 text-[#92400E] dark:text-yellow-300 font-bold px-2 py-0.5 rounded-full text-[11px]">
                  Flagged
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('drivers-vehicles')}
                className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E2330] p-2 -mx-2 rounded-xl transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-gray-200">1 status unconfirmed</span>
                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold px-2 py-0.5 rounded-full text-[11px]">
                  Stale
                </span>
              </div>
            </div>
          </div>

          {/* Card: Recent activity */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Recent activity
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Park admin confirmed Bus 11 on break
                </p>
                <p className="text-gray-400 mt-0.5">18 min ago</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Driver checked in at Campus Gate
                </p>
                <p className="text-gray-400 mt-0.5">42 min ago</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Charter request accepted
                </p>
                <p className="text-gray-400 mt-0.5">1 h ago</p>
              </div>
            </div>
          </div>

          {/* Card: Shift closing (Matches Page 7 Screenshot) */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Shift closing
              </h3>
              <button
                onClick={() => setIsEditingClosing(!isEditingClosing)}
                className="text-xs font-bold text-gray-900 dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {isEditingClosing ? (
              <div className="space-y-3 pt-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Configured Closing Time (24h)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={closingTimeInput}
                    onChange={(e) => setClosingTimeInput(e.target.value)}
                    className="bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  />
                  <button
                    onClick={handleSaveClosing}
                    className="bg-[#00A86B] text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Proposed {shiftConfig.daily_closing_time === '21:00' ? '9:00 PM' : shiftConfig.daily_closing_time} daily
              </p>
            )}

            <div className="pt-2 border-t border-gray-50 dark:border-gray-800">
              <button
                type="button"
                onClick={handleRunClosingNow}
                className="w-full text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 py-2.5 px-3 rounded-xl transition-colors text-center cursor-pointer"
              >
                Run Shift Closing Now (FR-11/12)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
