import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { POPULAR_DESTINATIONS } from '../../data/campusLocations';
import { ArrowRight, Search, Zap, Compass, MapPin, Bus, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StudentHomeProps {
  onGoToCharter: (destination?: string) => void;
  onGoToProfile: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  onGoToCharter,
  onGoToProfile,
}) => {
  const { parks, vehicles, drivers } = useApp();
  const { user } = useAuth();
  const [vehicleTab, setVehicleTab] = useState<'buses' | 'tricycle'>('buses');

  const campusGatePark = parks.find((p) => p.short_name === 'Campus Gate') || parks[0];
  const subPark = parks.find((p) => p.short_name === 'SUB') || parks[1];

  const enRouteBuses = vehicles.filter(
    (v) => v.vehicle_type === 'bus' && v.current_location === 'En route'
  );

  const tricycleVehicles = vehicles.filter((v) => v.vehicle_type === 'tricycle');
  const onDutyTricycleDrivers = drivers.filter(
    (d) => d.shift_status === 'On duty' && d.vehicle_type === 'tricycle'
  );

  const cgTricycles = tricycleVehicles.filter((v) => v.current_location === 'Campus Gate');
  const subTricycles = tricycleVehicles.filter((v) => v.current_location === 'SUB');
  const enRouteTricycles = tricycleVehicles.filter((v) => v.current_location === 'En route');

  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const getTricycleParkFreshness = (parkLoc: 'Campus Gate' | 'SUB') => {
    const parkDrivers = onDutyTricycleDrivers.filter((d) => d.current_location === parkLoc);
    if (parkDrivers.length === 0) return 'No active drivers';
    const sorted = [...parkDrivers].sort(
      (a, b) => new Date(b.last_confirmed_at).getTime() - new Date(a.last_confirmed_at).getTime()
    );
    return `Last confirmed ${formatTimeAgo(sorted[0].last_confirmed_at)}`;
  };

  return (
    <div className="pb-28 pt-3 md:py-8 px-4 sm:px-6 md:px-8 max-w-6xl xl:max-w-7xl mx-auto space-y-6">
      {/* Mobile-Only Top Header (Page 2 Mockup with Bolt styling) */}
      <div className="md:hidden flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#00A86B] to-[#34D186] flex items-center justify-center text-white font-black shadow-xs">
            <Zap className="w-4 h-4 fill-white text-white" />
          </div>
          <span className="font-black text-gray-900 dark:text-white tracking-tight text-xl font-sans">
            Campus<span className="text-[#00C269]">Go</span>
          </span>
        </div>

        <button
          onClick={onGoToProfile}
          className="w-9 h-9 rounded-full bg-[#E5E7EB] dark:bg-gray-700 hover:bg-gray-300 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold text-sm transition-colors overflow-hidden border border-white dark:border-gray-800"
          title="View profile"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span>{user ? user.full_name.charAt(0).toUpperCase() : 'S'}</span>
          )}
        </button>
      </div>

      {/* Disciplinary Suspension Alert if Suspended */}
      {user?.status === 'Suspended' && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-2xl flex items-start gap-3 shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1.5 animate-pulse" />
          <div className="text-xs sm:text-sm text-red-800 dark:text-red-300">
            <span className="font-extrabold text-red-900 dark:text-red-200 block">Account Suspended from Booking Charters</span>
            Suspension active {user.suspended_until ? `until ${new Date(user.suspended_until).toLocaleDateString()}` : 'indefinitely'}
            {user.suspended_by ? ` (Issued by ${user.suspended_by})` : ''}.
            {user.suspension_reason && <span className="block mt-0.5 text-xs italic font-medium">"{user.suspension_reason}"</span>}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BOLT-STYLE "WHERE TO?" HERO DISPATCH SEARCH CARD         */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00C269] dark:text-[#34D186] block">
              Smart Campus Mobility
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Where to?
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {onDutyTricycleDrivers.length} Tricycles Active
            </span>
            <div className="w-2 h-2 rounded-full bg-[#00C269] animate-pulse" />
          </div>
        </div>

        {/* Big Search Bar Pill (Directly opens Charter Request) */}
        <div
          onClick={() => onGoToCharter()}
          className="bg-[#F4F6F8] dark:bg-[#1E2330] hover:bg-gray-100 dark:hover:bg-[#252B3A] border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#151821] flex items-center justify-center text-[#00C269] shadow-xs group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white block">
                Find destination or charter tricycle
              </span>
              <span className="text-[11px] text-gray-400 block">
                SUB, Library, Faculty of Tech, Health Centre, PG Hall...
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl bg-[#00C269] text-white flex items-center justify-center shadow-sm group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Destination Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Shortcuts:
          </span>
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => onGoToCharter(dest)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F4F6F8] dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 hover:bg-[#EBF7EE] dark:hover:bg-emerald-950/40 hover:text-[#00C269] shrink-0 transition-colors cursor-pointer border border-transparent hover:border-[#00C269]/30"
            >
              {dest.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Heading & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {vehicleTab === 'buses' ? 'Where is the next bus?' : 'Where is the next tricycle?'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
            {vehicleTab === 'buses'
              ? 'Confirmed availability at Campus Gate and SUB car parks'
              : 'Confirmed availability and last updated times for campus tricycles'}
          </p>
        </div>

        {/* Vehicle Switcher: Buses / Tricycle */}
        <div className="bg-[#EAECEF] dark:bg-[#1E2330] p-1 rounded-2xl flex items-center max-w-xs transition-colors self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setVehicleTab('buses')}
            className={`py-2 px-5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              vehicleTab === 'buses'
                ? 'bg-white dark:bg-[#2A3142] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Buses Fleet
          </button>
          <button
            type="button"
            onClick={() => setVehicleTab('tricycle')}
            className={`py-2 px-5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              vehicleTab === 'tricycle'
                ? 'bg-white dark:bg-[#2A3142] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Tricycle Fleet
          </button>
        </div>
      </div>

      {/* Responsive Grid: 1 col on mobile, 2 cols on laptop/desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Park Availability Cards (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {vehicleTab === 'buses' ? (
            <>
              {/* Card 1: Campus Gate Car Park (Buses) */}
              <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-7 border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg md:text-xl">
                      Campus Gate Car Park
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-400 font-medium mt-0.5">
                      {campusGatePark.last_confirmed_text}
                    </p>
                  </div>
                  <StatusBadge status={campusGatePark.status === 'Confirmed' ? 'Available' : 'Unconfirmed'} />
                </div>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    {campusGatePark.bus_count}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-base">
                    buses waiting at park
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 text-xs">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                    <Bus className="w-3.5 h-3.5 text-[#00C269]" /> Regular campus route
                  </span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Fare: Campus Gate ⇄ SUB
                  </span>
                </div>
              </div>

              {/* Card 2: SUB Car Park (Buses) */}
              <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-7 border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg md:text-xl">
                      SUB Car Park
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-400 font-medium mt-0.5">
                      {subPark.last_confirmed_text}
                    </p>
                  </div>
                  <StatusBadge status={subPark.status === 'Confirmed' ? 'Available' : 'Unconfirmed'} />
                </div>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    {subPark.bus_count}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-base">
                    buses waiting at park
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 text-xs">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                    <Bus className="w-3.5 h-3.5 text-blue-500" /> Student Union Building
                  </span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Fare: SUB ⇄ Campus Gate
                  </span>
                </div>
              </div>

              {/* Card 3: En route status banner */}
              <div className="bg-[#EBF7EE] dark:bg-emerald-950/40 rounded-3xl p-5 border border-[#D8F3DC] dark:border-emerald-800/60 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#00C269] flex items-center justify-center text-white font-bold shadow-xs">
                    {enRouteBuses.length}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1B4332] dark:text-emerald-200">
                      {enRouteBuses.length} bus(es) en route
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                      Currently transit between Campus Gate & SUB
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-white/70 dark:bg-black/30 px-3 py-1 rounded-full">
                  Live
                </span>
              </div>
            </>
          ) : (
            <>
              {/* TRICYCLE FLEET: Campus Gate Park */}
              <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-7 border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg md:text-xl">
                      Campus Gate Car Park (Tricycles)
                    </h3>
                    <p className="text-xs text-[#00C269] dark:text-[#34D186] font-semibold mt-0.5">
                      {getTricycleParkFreshness('Campus Gate')}
                    </p>
                  </div>
                  <StatusBadge status={cgTricycles.some(v => v.status === 'Available') ? 'Available' : 'Unconfirmed'} />
                </div>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    {cgTricycles.filter(v => v.status === 'Available').length}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-base">
                    tricycle(s) ready for charter
                  </span>
                </div>

                {/* List of Tricycles at Campus Gate with Last Updated Timestamps */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {cgTricycles.map((tri) => (
                    <div
                      key={tri.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F8FA] dark:bg-[#1E2330] text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-gray-900 dark:text-white block">
                          {tri.vehicle_number} · {tri.assigned_driver_name || 'Driver'}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Last updated: <strong className="text-gray-700 dark:text-gray-300">{tri.last_updated}</strong>
                        </span>
                      </div>
                      <StatusBadge status={tri.status} size="sm" />
                    </div>
                  ))}
                  {cgTricycles.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No tricycles currently stationed at Campus Gate.</p>
                  )}
                </div>
              </div>

              {/* TRICYCLE FLEET: SUB Car Park */}
              <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-7 border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg md:text-xl">
                      SUB Car Park (Tricycles)
                    </h3>
                    <p className="text-xs text-[#00C269] dark:text-[#34D186] font-semibold mt-0.5">
                      {getTricycleParkFreshness('SUB')}
                    </p>
                  </div>
                  <StatusBadge status={subTricycles.some(v => v.status === 'Available') ? 'Available' : 'Unconfirmed'} />
                </div>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    {subTricycles.filter(v => v.status === 'Available').length}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-base">
                    tricycle(s) ready for charter
                  </span>
                </div>

                {/* List of Tricycles at SUB with Last Updated Timestamps */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {subTricycles.map((tri) => (
                    <div
                      key={tri.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F8FA] dark:bg-[#1E2330] text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-gray-900 dark:text-white block">
                          {tri.vehicle_number} · {tri.assigned_driver_name || 'Driver'}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Last updated: <strong className="text-gray-700 dark:text-gray-300">{tri.last_updated}</strong>
                        </span>
                      </div>
                      <StatusBadge status={tri.status} size="sm" />
                    </div>
                  ))}
                  {subTricycles.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No tricycles currently stationed at SUB.</p>
                  )}
                </div>
              </div>

              {/* En Route Tricycles Banner */}
              <div className="bg-[#EBF7EE] dark:bg-emerald-950/40 rounded-3xl p-5 border border-[#D8F3DC] dark:border-emerald-800/60 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#00C269] flex items-center justify-center text-white font-bold shadow-xs">
                    {enRouteTricycles.length}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1B4332] dark:text-emerald-200">
                      {enRouteTricycles.length} tricycle(s) on trip
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                      In transit with passenger charters across campus
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-white/70 dark:bg-black/30 px-3 py-1 rounded-full">
                  Live
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Tricycle Charter Action Box (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-7 border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF7EE] dark:bg-emerald-950/50 flex items-center justify-center text-[#00C269]">
              <Compass className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00C269]">
                Dedicated Ride
              </span>
              <h3 className="font-black text-xl text-gray-900 dark:text-white">
                Need a Tricycle Charter?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Skip walking across campus under the hot sun or rain. Book an on-duty tricycle driver to pick you up directly from your hall or department.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onGoToCharter()}
                className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.99] text-white font-black py-3.5 px-5 rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request a Tricycle Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Drivers Live Status Pill */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 border border-gray-100 dark:border-[#252B3A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Active Tricycle Drivers ({onDutyTricycleDrivers.length})
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Live Sync
              </span>
            </div>
            <div className="space-y-2">
              {onDutyTricycleDrivers.map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-xl bg-[#F6F8FA] dark:bg-[#1E2330] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">
                      {d.name} ({d.vehicle_assigned})
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Confirmed {formatTimeAgo(d.last_confirmed_at)} • At {d.current_location}
                    </span>
                  </div>
                  <StatusBadge status={d.operational_status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer Card */}
          <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
              <ShieldCheck className="w-4 h-4 text-[#00C269]" />
              <span>Official OAU Transport Information</span>
            </div>
            <p className="leading-relaxed">
              Bus and tricycle statuses update in real time based on park check-ins and driver confirmations across campus hubs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
