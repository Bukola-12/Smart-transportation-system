import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../Common/StatusBadge';
import { CheckInDriverModal } from './CheckInDriverModal';
import { UpdateDriverModal } from './UpdateDriverModal';
import { DriverRecord } from '../../types';
import { ArrowUpDown, CheckCircle2, Plus, Compass, ShieldAlert, Phone } from 'lucide-react';

interface ParkAdminDashboardProps {
  onGoToDrivers: () => void;
  onGoToProfile: () => void;
  onGoToCharters?: () => void;
  onGoToDiscipline?: () => void;
}

export const ParkAdminDashboard: React.FC<ParkAdminDashboardProps> = ({
  onGoToDrivers,
  onGoToProfile,
  onGoToCharters,
  onGoToDiscipline,
}) => {
  const { toast } = useToast();
  const { drivers, confirmDriverStatus, bookings } = useApp();
  const { user } = useAuth();

  const pendingChartersCount = bookings.filter((b) => b.status === 'Pending').length;

  const [currentPark, setCurrentPark] = useState<'Campus Gate' | 'SUB'>(
    user?.park_scope === 'SUB' ? 'SUB' : 'Campus Gate'
  );

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedDriverForEdit, setSelectedDriverForEdit] = useState<DriverRecord | null>(null);

  const parkDrivers = drivers.filter(
    (d) => d.current_location === currentPark || (currentPark === 'Campus Gate' && d.current_location === 'Unknown / Other')
  );

  const availableCount = drivers.filter((d) => d.operational_status === 'Available').length;
  const onTripCount = drivers.filter((d) => d.operational_status === 'On trip').length;
  const breakCount = drivers.filter((d) => d.operational_status === 'On break').length;
  const staleCount = drivers.filter((d) => d.operational_status === 'Unconfirmed').length;

  const staleDrivers = drivers.filter((d) => d.operational_status === 'Unconfirmed');

  const handleReviewStale = () => {
    if (staleDrivers.length > 0) {
      setSelectedDriverForEdit(staleDrivers[0]);
    } else {
      toast.info('All driver statuses are currently fresh and confirmed.');
    }
  };

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-6xl xl:max-w-7xl mx-auto">
      {/* Mobile-Only Top Header (Page 6 Mockup) */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight">
            Park administrator
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              {currentPark} Car Park
            </h1>
            <button
              onClick={() => setCurrentPark(currentPark === 'Campus Gate' ? 'SUB' : 'Campus Gate')}
              className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-[#1E2330] px-2 py-0.5 rounded-lg font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              title="Switch park view"
            >
              <ArrowUpDown className="w-3 h-3" />
              Switch
            </button>
          </div>
        </div>

        <button
          onClick={onGoToProfile}
          className="w-10 h-10 rounded-full bg-[#EAECEF] dark:bg-gray-700 hover:bg-gray-300 flex items-center justify-center text-gray-900 dark:text-white font-extrabold text-sm transition-colors overflow-hidden"
          title="Admin Profile"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span>PA</span>
          )}
        </button>
      </div>

      {/* Desktop Heading with quick action buttons */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight uppercase">
            Park Operations
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">
            {currentPark} Car Park
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPark(currentPark === 'Campus Gate' ? 'SUB' : 'Campus Gate')}
            className="bg-white dark:bg-[#151821] hover:bg-gray-50 dark:hover:bg-[#1E2330] border border-gray-200 dark:border-[#252B3A] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Switch to {currentPark === 'Campus Gate' ? 'SUB' : 'Campus Gate'}</span>
          </button>
          <button
            onClick={() => setIsCheckInOpen(true)}
            className="bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.98] text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Check in a driver</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards in a Row (Page 6 Screenshot: 3 Available, 2 On trip, 1 Break, 1 Stale) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-[#EAF7EE] dark:bg-emerald-950/50 rounded-3xl p-5 md:p-6 text-left border border-transparent dark:border-emerald-800/40 transition-colors">
          <span className="text-3xl md:text-4xl font-extrabold text-[#111827] dark:text-white block leading-none">
            {availableCount}
          </span>
          <span className="text-xs md:text-sm font-bold text-[#00A86B] dark:text-emerald-400 mt-2 block">
            Available
          </span>
        </div>

        <div className="bg-[#FEF7E8] dark:bg-amber-950/50 rounded-3xl p-5 md:p-6 text-left border border-transparent dark:border-amber-800/40 transition-colors">
          <span className="text-3xl md:text-4xl font-extrabold text-[#111827] dark:text-white block leading-none">
            {onTripCount}
          </span>
          <span className="text-xs md:text-sm font-bold text-[#D97706] dark:text-amber-400 mt-2 block">
            On trip
          </span>
        </div>

        <div className="bg-[#EEF2F7] dark:bg-blue-950/50 rounded-3xl p-5 md:p-6 text-left border border-transparent dark:border-blue-800/40 transition-colors">
          <span className="text-3xl md:text-4xl font-extrabold text-[#111827] dark:text-white block leading-none">
            {breakCount}
          </span>
          <span className="text-xs md:text-sm font-bold text-[#3B82F6] dark:text-blue-400 mt-2 block">
            Break
          </span>
        </div>

        <div className="bg-[#F4F4F6] dark:bg-zinc-800/60 rounded-3xl p-5 md:p-6 text-left border border-transparent dark:border-zinc-700/50 transition-colors">
          <span className="text-3xl md:text-4xl font-extrabold text-[#111827] dark:text-white block leading-none">
            {staleCount}
          </span>
          <span className="text-xs md:text-sm font-bold text-[#6B7280] dark:text-zinc-300 mt-2 block">
            Stale
          </span>
        </div>
      </div>

      {/* Responsive Grid: 1 col on mobile, 2 cols on laptop/desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Drivers List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Drivers at this park
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              Tap any driver to update status
            </span>
          </div>

          <div className="space-y-3">
            {parkDrivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriverForEdit(driver)}
                className="bg-white dark:bg-[#151821] rounded-3xl p-5 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">
                    {driver.vehicle_assigned} · {driver.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium">
                    {driver.operational_status === 'Unconfirmed'
                      ? 'Last confirmed 2 h 10 min ago'
                      : driver.updated_by_role === 'driver'
                      ? 'Updated by driver · 6 min ago'
                      : 'Updated by admin · 18 min ago'}
                  </p>
                </div>

                <StatusBadge status={driver.operational_status} />
              </div>
            ))}
          </div>

          {/* Mobile Check in a driver button */}
          <div className="md:hidden pt-2">
            <button
              type="button"
              onClick={() => setIsCheckInOpen(true)}
              className="w-full bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-4 rounded-2xl text-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              Check in a driver
            </button>
          </div>
        </div>

        {/* Right Column: Alerts & Actions (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Yellow Alert Card (Matches Page 6: 1 status needs confirming [Review]) */}
          {staleCount > 0 ? (
            <div className="bg-[#FEF8E8] dark:bg-amber-950/40 rounded-3xl p-6 border border-[#FDE68A] dark:border-amber-800/60 space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#92400E] dark:text-amber-300">
                  {staleCount} status needs confirming
                </span>
                <button
                  onClick={handleReviewStale}
                  className="bg-white dark:bg-[#1E2330] hover:bg-amber-50 dark:hover:bg-amber-950/80 text-gray-900 dark:text-white text-xs font-bold px-4 py-2 rounded-xl border border-amber-200/60 dark:border-amber-800/60 shadow-sm transition-colors cursor-pointer"
                >
                  Review
                </button>
              </div>
              <p className="text-xs text-[#92400E]/80 dark:text-amber-300/80 leading-relaxed">
                A driver has had no confirmed activity in over 2 hours (FR-09). Their operational status is marked Unconfirmed until verified.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/60 flex items-center gap-3 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                  All driver statuses are fresh
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  No stale statuses pending confirmation at this park.
                </span>
              </div>
            </div>
          )}

          {/* Charters & Disciplinary Quick Access */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3 transition-colors">
            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center justify-between">
              <span>Charters & Discipline</span>
              {pendingChartersCount > 0 && (
                <span className="text-[10px] font-bold bg-[#00A86B] text-white px-2 py-0.5 rounded-full">
                  {pendingChartersCount} Pending
                </span>
              )}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Accept tricycle charters on behalf of on-shift drivers, or manage student & driver disciplinary warnings and suspensions (1 month max).
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onGoToCharters && (
                <button
                  type="button"
                  onClick={onGoToCharters}
                  className="py-2.5 px-3 bg-[#EBF7EE] dark:bg-emerald-950/50 hover:bg-[#D8F3DC] text-emerald-900 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Park Charters</span>
                </button>
              )}
              {onGoToDiscipline && (
                <button
                  type="button"
                  onClick={onGoToDiscipline}
                  className="py-2.5 px-3 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-900 dark:text-purple-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Discipline</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Park Operations Notice */}
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
            <h4 className="font-bold text-gray-900 dark:text-white text-base">
              Park Administrator Role (FR-03)
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              As a park administrator for {currentPark}, you can record check-ins and check-outs for drivers without smartphones, update vehicle departure/arrival, and verify operational status.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCheckInOpen(true)}
                className="w-full bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                + Check In Driver on Behalf
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCheckInOpen && (
        <CheckInDriverModal
          currentParkName={currentPark}
          adminName={user?.full_name || 'Park Admin'}
          onClose={() => setIsCheckInOpen(false)}
        />
      )}

      {selectedDriverForEdit && (
        <UpdateDriverModal
          driver={selectedDriverForEdit}
          adminName={user?.full_name || 'Park Admin'}
          onClose={() => setSelectedDriverForEdit(null)}
        />
      )}
    </div>
  );
};
