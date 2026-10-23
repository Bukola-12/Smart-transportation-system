import React from 'react';
import { useApp } from '../../context/AppContext';

export const ParkAdminActivity: React.FC = () => {
  const { activityLogs } = useApp();

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Park Activity Log
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
          Recent operational actions and driver updates
        </p>
      </div>

      <div className="space-y-3">
        {activityLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between transition-colors"
          >
            <div className="space-y-1 max-w-[70%]">
              <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white block leading-snug">
                {log.change}
              </span>
              <p className="text-[11px] text-gray-400">
                {log.entity} • by <span className="text-gray-600 dark:text-gray-300 font-medium">{log.changed_by}</span> ({log.time})
              </p>
            </div>

            <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded-full capitalize">
              {log.method}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
