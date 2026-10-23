import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../Common/StatusBadge';
import { Bus } from 'lucide-react';

export const CentralAdminParks: React.FC = () => {
  const { parks, vehicles, drivers } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight">
          Central administrator
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
          Parks Management
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Shared transportation hubs across Campus Gate Car Park and SUB Car Park
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parks.map((park) => {
          const parkBuses = vehicles.filter(
            (v) => v.vehicle_type === 'bus' && v.current_location === park.short_name
          );
          const parkDrivers = drivers.filter(
            (d) => d.current_location === park.short_name && d.shift_status === 'On duty'
          );

          return (
            <div
              key={park.id}
              className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {park.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-400 font-medium mt-1">
                    {park.last_confirmed_text}
                  </p>
                </div>
                <StatusBadge status={park.status} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                    {parkBuses.length}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 block">
                    Buses at Park
                  </span>
                </div>

                <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white block leading-tight">
                    {parkDrivers.length}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 block">
                    Active Drivers
                  </span>
                </div>
              </div>

              {/* Vehicles currently stationed here */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Stationed Vehicles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parkBuses.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No vehicles currently recorded</span>
                  ) : (
                    parkBuses.map((v) => (
                      <span
                        key={v.id}
                        className="bg-gray-100 dark:bg-[#1E2330] text-gray-800 dark:text-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                      >
                        <Bus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        {v.vehicle_number}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* En route note */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>En route vehicles approaching:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{park.en_route_count} bus</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
