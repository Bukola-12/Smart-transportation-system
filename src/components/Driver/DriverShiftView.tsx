import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { OperationalStatus, VehicleLocation } from '../../types';
import { playDispatchChime } from '../../lib/soundAlert';
import { 
  Clock, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Image as ImageIcon, 
  X, 
  Zap, 
  CheckCircle2, 
  PauseCircle, 
  Navigation,
  Car,
  Bus,
  ShieldCheck,
  ChevronRight,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react';

interface DriverShiftViewProps {
  onGoToProfile: () => void;
}

export const DriverShiftView: React.FC<DriverShiftViewProps> = ({ onGoToProfile }) => {
  const { 
    drivers, 
    vehicles, 
    bookings, 
    updateDriverOperationalStatus, 
    confirmDriverStatus, 
    driverCheckIn, 
    driverEndShift, 
    updateVehicleLocation,
    acceptCharterRequest,
    rejectCharterRequest,
    startCharterTrip,
    completeCharterTrip
  } = useApp();
  const { user } = useAuth();

  const isSuspended = user?.status === 'Suspended';
  const isDeactivated = user?.status === 'Deactivated';
  const hasWarnings = (user?.warnings && user.warnings.length > 0) || false;

  const currentDriver = drivers.find((d) => d.name === user?.full_name || d.user_id === user?.id) || drivers[0];
  const isOnDuty = currentDriver.shift_status === 'On duty';

  const isBusDriver =
    currentDriver.vehicle_type === 'bus' ||
    user?.preferred_vehicle_type === 'bus' ||
    user?.vehicle_assigned?.toLowerCase().startsWith('bus') ||
    currentDriver.vehicle_assigned.toLowerCase().startsWith('bus');

  const currentVehicle = vehicles.find((v) => v.vehicle_number === currentDriver.vehicle_assigned) || vehicles[0];

  const pendingRequests = bookings.filter((b) => b.status === 'Pending');
  const activeBooking = bookings.find(
    (b) => b.assigned_driver_id === currentDriver.id && (b.status === 'Accepted' || b.status === 'In progress')
  );

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const [incomingAlert, setIncomingAlert] = useState<{ id: string; pickup: string; destination: string; passenger: string } | null>(null);

  const prevPendingCountRef = useRef(pendingRequests.length);

  // Hands-free sound chime and in-app banner for tricycle drivers so they don't get distracted checking their phones while driving
  useEffect(() => {
    if (isOnDuty && !isBusDriver && pendingRequests.length > prevPendingCountRef.current) {
      const newest = pendingRequests[0];
      if (newest) {
        if (soundAlertsEnabled) {
          playDispatchChime();
        }
        setIncomingAlert({
          id: newest.id,
          pickup: newest.pickup,
          destination: newest.destination,
          passenger: newest.requester_name,
        });
      }
    }
    prevPendingCountRef.current = pendingRequests.length;
  }, [pendingRequests.length, isOnDuty, isBusDriver, soundAlertsEnabled]);

  const handleStatusChange = (status: OperationalStatus) => {
    updateDriverOperationalStatus(
      currentDriver.id,
      status,
      currentDriver.name,
      'Driver app'
    );
  };

  const handleLocationChange = (loc: VehicleLocation) => {
    if (!currentVehicle) return;
    const destination = loc === 'En route' ? (currentDriver.current_location === 'Campus Gate' ? 'SUB' : 'Campus Gate') : undefined;
    updateVehicleLocation(
      currentVehicle.id,
      loc,
      destination,
      currentDriver.name,
      'Driver app'
    );
  };

  const handleAcceptRequest = (bookingId: string) => {
    setConflictError(null);
    const result = acceptCharterRequest(bookingId, currentDriver.id, currentDriver.name);
    if (!result.success) {
      setConflictError(result.error || 'Could not accept trip.');
    }
  };

  const handleConfirmFreshness = () => {
    confirmDriverStatus(currentDriver.id, currentDriver.name);
    setConfirmNotice(true);
    setTimeout(() => setConfirmNotice(false), 3000);
  };

  return (
    <div className="pb-32 pt-3 md:py-8 px-4 sm:px-6 md:px-8 max-w-6xl xl:max-w-7xl mx-auto space-y-6">
      {/* Mobile-Only Top Header (Bolt Driver App Style) */}
      <div className="md:hidden flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#00A86B] to-[#34D186] flex items-center justify-center text-white font-black shadow-xs">
            <Zap className="w-4 h-4 fill-white text-white" />
          </div>
          <span className="font-black text-gray-900 dark:text-white tracking-tight text-xl font-sans">
            Campus<span className="text-[#00C269]">Driver</span>
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
            <span>{currentDriver.name ? currentDriver.name.charAt(0).toUpperCase() : 'D'}</span>
          )}
        </button>
      </div>

      {/* Driver Disciplinary Suspension Banner */}
      {isSuspended && (
        <div className="p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-3xl space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-extrabold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>Driver Account Suspended</span>
          </div>
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 leading-relaxed">
            Your driver account has been temporarily suspended
            {user?.suspended_until ? (
              <span className="font-bold"> until {new Date(user.suspended_until).toLocaleDateString()}</span>
            ) : (
              <span className="font-bold"> indefinitely</span>
            )}
            {user?.suspended_by ? (
              <span> by <strong className="font-semibold">{user.suspended_by}</strong></span>
            ) : ''}.
          </p>
          {user?.suspension_reason && (
            <div className="text-xs bg-white dark:bg-[#1A1E29] p-3 rounded-2xl border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200">
              <span className="font-bold text-red-700 dark:text-red-400 block mb-0.5">Reason:</span>
              "{user.suspension_reason}"
            </div>
          )}
          <p className="text-[11px] text-red-600 dark:text-red-400 font-bold pt-1">
            ⚠️ You cannot check in to active shifts or accept passenger bookings while suspended.
          </p>
        </div>
      )}

      {/* Disciplinary Warnings Notice */}
      {!isSuspended && hasWarnings && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-bold">Notice:</span> You have {user?.warnings?.length} warning(s) on your record. Please adhere strictly to campus speed limits and transport regulations.
          </div>
        </div>
      )}

      {conflictError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs rounded-2xl font-bold border border-red-200 dark:border-red-800/60 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{conflictError}</span>
        </div>
      )}

      {/* Hands-free Audio Alert Notification Banner for Tricycle Drivers */}
      {incomingAlert && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-[#00C269] text-white rounded-3xl shadow-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-100 block">
                🔔 New Dispatch Alert
              </span>
              <h4 className="text-sm sm:text-base font-black">
                {incomingAlert.pickup} → {incomingAlert.destination}
              </h4>
              <p className="text-xs text-emerald-100">Passenger: {incomingAlert.passenger}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleAcceptRequest(incomingAlert.id);
                setIncomingAlert(null);
              }}
              className="bg-white text-emerald-800 hover:bg-gray-100 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Accept Trip
            </button>
            <button
              type="button"
              onClick={() => setIncomingAlert(null)}
              className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. BOLT DRIVER ONLINE STATUS HERO BAR                   */}
      {/* ======================================================== */}
      <div className="bg-[#12161A] dark:bg-[#151821] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-white/5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  isOnDuty
                    ? 'bg-[#00C269] shadow-[0_0_12px_#00C269] animate-pulse'
                    : 'bg-gray-500'
                }`}
              />
              <span className="text-xs font-black tracking-wider uppercase text-[#00C269]">
                {isOnDuty ? "YOU'RE ONLINE • ON DUTY" : 'OFFLINE • OFF DUTY'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isOnDuty ? `Active since ${currentDriver.shift_started_at || '8:05 AM'}` : 'Shift Not Started'}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 pt-0.5">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-lg font-bold">
                {currentDriver.vehicle_assigned}
              </span>
              <span>•</span>
              <span>Stationed at <strong className="text-white">{currentDriver.current_location}</strong></span>
              <span>•</span>
              <span className="font-semibold text-emerald-400">{isOnDuty ? currentDriver.operational_status : 'Offline'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOnDuty && !isBusDriver && (
              <button
                type="button"
                onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
                title={soundAlertsEnabled ? 'Sound alerts active' : 'Sound alerts muted'}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                {soundAlertsEnabled ? <Volume2 className="w-4 h-4 text-[#00C269]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                <span className="hidden sm:inline">{soundAlertsEnabled ? 'Audio ON' : 'Muted'}</span>
              </button>
            )}

            {isOnDuty ? (
              <button
                type="button"
                onClick={() => driverEndShift(currentDriver.id, currentDriver.name, 'Driver app')}
                className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-2xl transition-all cursor-pointer border border-white/10"
              >
                End Shift
              </button>
            ) : (
              <button
                type="button"
                disabled={isSuspended || isDeactivated}
                onClick={() => driverCheckIn(currentDriver.id, 'Campus Gate', currentDriver.name, 'Driver app')}
                className="bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                {isSuspended ? 'Account Suspended' : 'Go Online & Check In'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. OPERATIONAL STATUS CONTROLS (Bolt Driver App Style)  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Status & Location Controls (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Selector Card */}
          <div className="bg-white dark:bg-[#151821] p-6 sm:p-7 rounded-3xl border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                  Operational Status
                </h3>
                <p className="text-xs text-gray-400">
                  {isOnDuty
                    ? 'Broadcast your immediate availability to students & park admins'
                    : 'Shift is currently inactive'}
                </p>
              </div>
              <StatusBadge status={isOnDuty ? currentDriver.operational_status : 'Unconfirmed'} />
            </div>

            {/* 3 Tactile Status Buttons */}
            <div className={`grid grid-cols-3 gap-2 p-1.5 bg-[#F6F8FA] dark:bg-[#1E2330] rounded-2xl ${!isOnDuty ? 'opacity-50 pointer-events-none' : ''}`}>
              <button
                type="button"
                disabled={!isOnDuty}
                onClick={() => handleStatusChange('Available')}
                className={`py-3 px-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  currentDriver.operational_status === 'Available' && isOnDuty
                    ? 'bg-white dark:bg-[#2A3142] text-[#00C269] shadow-sm font-black'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#00C269]" />
                <span>Available</span>
              </button>

              <button
                type="button"
                disabled={!isOnDuty}
                onClick={() => handleStatusChange('On trip')}
                className={`py-3 px-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  currentDriver.operational_status === 'On trip' && isOnDuty
                    ? 'bg-white dark:bg-[#2A3142] text-amber-500 shadow-sm font-black'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Car className="w-4 h-4 text-amber-500" />
                <span>On Trip</span>
              </button>

              <button
                type="button"
                disabled={!isOnDuty}
                onClick={() => handleStatusChange('On break')}
                className={`py-3 px-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  currentDriver.operational_status === 'On break' && isOnDuty
                    ? 'bg-white dark:bg-[#2A3142] text-blue-500 shadow-sm font-black'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <PauseCircle className="w-4 h-4 text-blue-500" />
                <span>On Break</span>
              </button>
            </div>

            {!isOnDuty && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl text-xs text-gray-500 dark:text-gray-400">
                You are offline. Operational status is turned off until you start your shift.
              </div>
            )}

            {/* Status Freshness Confirmation Button */}
            {isOnDuty && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-gray-400 font-medium">
                  Last verified: {currentDriver.operational_status === 'Unconfirmed' ? '⚠️ Stale (>2 hours ago)' : 'Recently confirmed'}
                </span>

                <button
                  type="button"
                  onClick={handleConfirmFreshness}
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{confirmNotice ? 'Status Confirmed!' : 'Confirm Status Freshness'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Vehicle Location Selector */}
          <div className="bg-white dark:bg-[#151821] p-6 sm:p-7 rounded-3xl border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Vehicle Location
              </h3>
              <p className="text-xs text-gray-400">
                {currentDriver.operational_status === 'On trip'
                  ? 'Vehicle is currently en route with passenger'
                  : 'Where is your vehicle parked right now?'}
              </p>
            </div>

            {/* If driver is On trip, vehicle location is turned off / locked */}
            {currentDriver.operational_status === 'On trip' ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-bold block">Vehicle Location Locked to "En route"</span>
                <p>
                  While an active charter trip is in progress, manual park selection is turned off. Complete or conclude the trip to relocate.
                </p>
              </div>
            ) : !isOnDuty ? (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-xs text-gray-500 dark:text-gray-400">
                Stationed at <strong>{currentDriver.current_location}</strong>. Location selection activates when you go online.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['Campus Gate', 'SUB', 'En route'] as const).map((loc) => {
                  const isSelected = currentDriver.current_location === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLocationChange(loc)}
                      className={`p-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-[#00C269] text-white shadow-sm font-black'
                          : 'bg-[#F6F8FA] dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2A3142]'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{loc === 'En route' ? 'En route' : `${loc} Park`}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Trip & Pending Request Offers (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Trip in Progress Card (If driver currently has accepted charter) */}
          {activeBooking && (
            <div className="bg-[#EBF7EE] dark:bg-emerald-950/40 p-6 rounded-3xl border border-[#D8F3DC] dark:border-emerald-800/60 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Active Charter Trip
                </span>
                <StatusBadge status={activeBooking.status} size="sm" />
              </div>

              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white">
                  {activeBooking.pickup} → {activeBooking.destination}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Passenger: <strong className="font-bold text-gray-900 dark:text-white">{activeBooking.requester_name}</strong>
                </p>
              </div>

              {/* Passenger Phone Display (Plain text, not a call button) */}
              {activeBooking.requester_phone && (
                <div className="flex items-center gap-2 bg-white dark:bg-[#151821] p-3 rounded-2xl text-xs text-gray-700 dark:text-gray-300 font-medium border border-gray-100 dark:border-gray-800">
                  <Phone className="w-3.5 h-3.5 text-[#00C269]" />
                  <span>Passenger Phone:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{activeBooking.requester_phone}</span>
                </div>
              )}

              {/* Action Buttons for Active Trip */}
              <div className="pt-2">
                {activeBooking.status === 'Accepted' && (
                  <button
                    type="button"
                    onClick={() => startCharterTrip(activeBooking.id, currentDriver.name)}
                    className="w-full bg-[#00C269] hover:bg-[#00AB5D] text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    Start Trip (Passenger Onboard)
                  </button>
                )}

                {activeBooking.status === 'In progress' && (
                  <button
                    type="button"
                    onClick={() => completeCharterTrip(activeBooking.id, currentDriver.name)}
                    className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    Complete Trip (Arrived Safely)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Column: Bus Driver Route Card vs Tricycle Driver Charter Offers */}
          {isBusDriver ? (
            <div className="bg-white dark:bg-[#151821] p-6 sm:p-7 rounded-3xl border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#00C269] flex items-center justify-center">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    Campus Shuttle Operations
                  </h3>
                  <p className="text-xs text-gray-400">Regular campus shuttle schedule</p>
                </div>
              </div>

              <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                  <span className="text-gray-400 font-medium">Service Route</span>
                  <span className="font-extrabold text-gray-900 dark:text-white">Campus Gate ⇄ SUB Car Park</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                  <span className="text-gray-400 font-medium">Bus Vehicle</span>
                  <span className="font-mono font-bold text-[#00C269]">{currentDriver.vehicle_assigned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Boarding Protocol</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Park Queue Boarding Sheds</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Campus shuttle buses service designated park-to-park routes. Passenger ticketing and boarding are managed at the terminal sheds.
              </p>
            </div>
          ) : (
            /* Incoming Charter Requests (Bolt Driver Offer Style for Tricycles) */
            <div className="bg-white dark:bg-[#151821] p-6 rounded-3xl border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#00C269]" />
                  <span>Pending Charters ({pendingRequests.length})</span>
                </h3>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No pending charter requests right now. When students submit a booking, it will appear here with an instant audio chime.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-[#F6F8FA] dark:bg-[#1E2330] border border-gray-100 dark:border-gray-800 space-y-2.5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-gray-400">#{req.id}</span>
                        {req.preferred_driver_id === currentDriver.id && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                            ★ For YOU
                          </span>
                        )}
                      </div>

                      <div>
                        <h5 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                          {req.pickup} → {req.destination}
                        </h5>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          Passenger: {req.requester_name} • {req.when_type}
                        </span>
                      </div>

                      {req.pickup_note && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 italic bg-white dark:bg-[#151821] p-2 rounded-xl">
                          "{req.pickup_note}"
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => rejectCharterRequest(req.id, currentDriver.id, currentDriver.name)}
                          className="text-xs font-bold text-gray-500 hover:text-red-500 px-3 py-1.5 cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="bg-[#00C269] hover:bg-[#00AB5D] text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          Accept Trip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
