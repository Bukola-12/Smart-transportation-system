import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Clock } from 'lucide-react';

export const DriverActivityView: React.FC = () => {
  const { activityLogs, drivers } = useApp();
  const { user } = useAuth();

  const currentDriver = drivers.find((d) => d.name === user?.full_name || d.user_id === user?.id) || drivers[0];

  const myLogs = activityLogs.filter(
    (l) =>
      l.entity === currentDriver.name ||
      l.entity === currentDriver.vehicle_assigned ||
      l.changed_by === currentDriver.name
  );

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Driver Activity
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
          Shift history, status confirmations, and trips
        </p>
      </div>

      <div className="space-y-3">
        {myLogs.length === 0 ? (
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-8 border border-gray-100 dark:border-[#252B3A] text-center text-gray-400 transition-colors">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">No recent activity logged</p>
          </div>
        ) : (
          myLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-[#151821] rounded-2xl p-4 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between transition-colors"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-900 dark:text-white block">
                  {log.change}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span>{log.time}</span>
                  <span>•</span>
                  <span>{log.entity}</span>
                </div>
              </div>

              <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded-full">
                {log.method}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
