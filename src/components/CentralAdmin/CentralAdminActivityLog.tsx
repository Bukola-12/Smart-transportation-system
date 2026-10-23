import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download } from 'lucide-react';
import { ActivityLogItem } from '../../types';

export const CentralAdminActivityLog: React.FC = () => {
  const { activityLogs, exportActivityLogCSV } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterOptions = [
    'All',
    'Driver status',
    'Vehicle location',
    'Bookings',
    'Corrections',
  ];

  const filteredLogs = activityLogs.filter((log) => {
    if (selectedFilter === 'All') return true;
    return log.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  const getMethodBadge = (method: ActivityLogItem['method']) => {
    switch (method) {
      case 'Admin':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400 dark:border dark:border-blue-800/60';
      case 'Driver app':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border dark:border-emerald-800/60';
      case 'Student app':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border dark:border-emerald-800/60';
      case 'On behalf':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400 dark:border dark:border-indigo-800/60';
      case 'Automatic':
        return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 dark:border dark:border-zinc-700/60';
      case 'Correction':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 dark:border dark:border-amber-800/60';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row (Matches Page 8 Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight">
            Central administrator
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
            Activity log
          </h1>
        </div>

        <button
          onClick={exportActivityLogCSV}
          className="bg-white dark:bg-[#151821] hover:bg-gray-50 dark:hover:bg-[#1E2330] border border-gray-200 dark:border-[#252B3A] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Export</span>
        </button>
      </div>

      {/* Filter Chips (Matches Page 8 Screenshot: All, Driver status, Vehicle location, Bookings, Corrections) */}
      <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 no-scrollbar">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSelectedFilter(opt)}
            className={`py-2 px-4 sm:px-5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedFilter === opt
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'bg-white dark:bg-[#151821] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E2330] border border-gray-100 dark:border-[#252B3A]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Activity Log Table Card */}
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm font-medium min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                <th className="pb-4 pt-2">Time</th>
                <th className="pb-4 pt-2">Entity</th>
                <th className="pb-4 pt-2">Change</th>
                <th className="pb-4 pt-2">Changed by</th>
                <th className="pb-4 pt-2 text-right">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1A1E29] transition-colors">
                  <td className="py-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{item.time}</td>
                  <td className="py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{item.entity}</td>
                  <td className="py-4 text-gray-800 dark:text-gray-200">{item.change}</td>
                  <td className="py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.changed_by}</td>
                  <td className="py-4 text-right whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getMethodBadge(
                        item.method
                      )}`}
                    >
                      {item.method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
