import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { 
  ArrowLeft, 
  Check, 
  Phone, 
  MapPin, 
  Image as ImageIcon, 
  X, 
  Zap, 
  Clock, 
  Car, 
  ShieldCheck, 
  AlertCircle,
  Share2
} from 'lucide-react';

interface CharterStatusViewProps {
  bookingId: string;
  onBack: () => void;
}

export const CharterStatusView: React.FC<CharterStatusViewProps> = ({
  bookingId,
  onBack,
}) => {
  const { bookings, cancelCharterRequest } = useApp();
  const { user } = useAuth();
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  if (!booking) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Charter booking not found.</p>
        <button 
          onClick={onBack} 
          className="text-[#00C269] hover:underline font-bold text-sm cursor-pointer"
        >
          Return to home
        </button>
      </div>
    );
  }

  const isPending = booking.status === 'Pending';
  const isAccepted = booking.status === 'Accepted';
  const isInProgress = booking.status === 'In progress';
  const isCompleted = booking.status === 'Completed';
  const isCancelled = booking.status === 'Cancelled' || booking.status === 'Rejected';

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this tricycle charter request?')) {
      cancelCharterRequest(booking.id, user?.full_name || 'Student', true);
    }
  };

  return (
    <div className="pb-32 pt-3 md:py-8 px-4 sm:px-6 md:px-8 max-w-xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 -ml-2 text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white rounded-2xl hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono font-bold text-gray-400">
              Trip #{booking.id}
            </span>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Live Trip Status
            </h2>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Main Status Container (Bolt Live Ride Style) */}
      <div className="bg-white dark:bg-[#151821] p-6 sm:p-7 rounded-3xl border border-gray-100 dark:border-[#252B3A] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6 transition-colors">
        {/* Dynamic Status Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {isPending && (
              <div className="w-3 h-3 rounded-full bg-[#00C269] animate-ping" />
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00C269]">
              {isPending && 'Connecting with Campus Drivers'}
              {isAccepted && 'Driver Confirmed'}
              {isInProgress && 'Trip in Motion'}
              {isCompleted && 'Arrived Safely'}
              {isCancelled && 'Request Concluded'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            {isPending && 'Waiting for driver...'}
            {isAccepted && 'Driver on the way'}
            {isInProgress && 'Charter in progress'}
            {isCompleted && 'Trip completed!'}
            {isCancelled && 'Request cancelled'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            {isPending && 'We are notifying on-duty campus tricycle drivers. You will receive their details instantly upon acceptance.'}
            {isAccepted && 'Your driver has accepted! Call them directly below to coordinate exact meeting point.'}
            {isInProgress && 'You are currently on your charter trip to your destination.'}
            {isCompleted && 'You reached your destination. Please settle the agreed fare directly with the driver.'}
            {isCancelled && 'This charter booking was cancelled or rejected.'}
          </p>
        </div>

        {/* Assigned Driver Card (Bolt Driver Pill) */}
        {booking.assigned_driver_name && (
          <div className="bg-[#EBF7EE] dark:bg-emerald-950/40 rounded-3xl p-5 border border-[#D8F3DC] dark:border-emerald-800/60 space-y-4 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#00C269] text-white font-black text-base flex items-center justify-center shadow-xs">
                  {booking.assigned_driver_name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    Assigned Driver
                  </span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    {booking.assigned_driver_name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    {booking.assigned_vehicle || 'Tricycle'} • Verified Campus Fleet
                  </p>
                </div>
              </div>

              {/* Click to Call Button */}
              {booking.driver_phone && (
                <a
                  href={`tel:${booking.driver_phone}`}
                  className="inline-flex items-center gap-2 bg-[#00C269] hover:bg-[#00AB5D] text-white font-black text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-md shadow-emerald-500/25 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Driver</span>
                </a>
              )}
            </div>

            {/* Transparent Attribution: Who Accepted (Driver vs Admin on Behalf) */}
            {booking.accepted_by && (
              <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Dispatch Method:</span>
                <span className={`font-bold px-2.5 py-1 rounded-xl text-[11px] ${
                  booking.accepted_on_behalf
                    ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-white dark:bg-[#151821] text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                }`}>
                  {booking.accepted_on_behalf
                    ? booking.accepted_by
                    : `Accepted directly by driver (${booking.assigned_driver_name})`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* BOLT ROUTE CARD (Pickup & Destination with vertical line)*/}
        {/* ======================================================== */}
        <div className="bg-[#F6F8FA] dark:bg-[#1E2330] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4 transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#00C269] ring-4 ring-[#00C269]/20" />
              <div className="w-0.5 h-10 bg-gradient-to-b from-[#00C269] to-gray-400 my-1" />
              <div className="w-2.5 h-2.5 rounded-xs bg-gray-900 dark:bg-white" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Pickup Point
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white block">
                  {booking.pickup}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Destination
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white block">
                  {booking.destination}
                </span>
              </div>
            </div>
          </div>

          {/* Extra Details Row */}
          <div className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Departure</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{booking.when_type}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Your Phone</span>
              <span className="font-bold font-mono text-gray-800 dark:text-gray-200">{booking.requester_phone || '08031234567'}</span>
            </div>
          </div>

          {booking.preferred_driver_name && (
            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">Requested Driver:</span>
              <span className="font-bold text-[#00C269]">
                ★ {booking.preferred_driver_name}
              </span>
            </div>
          )}

          {/* Student's Pickup Landmark Note */}
          {booking.pickup_note && (
            <div className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00C269]" />
                Your Landmark Note
              </span>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-[#151821] p-3 rounded-2xl border border-gray-200/70 dark:border-gray-700">
                "{booking.pickup_note}"
              </p>
            </div>
          )}

          {/* Student's Attached Location Photo */}
          {booking.pickup_image_url && (
            <div className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-[#00C269]" />
                Location Photo Attached
              </span>
              <div 
                onClick={() => setEnlargedImage(booking.pickup_image_url || null)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group border border-gray-200 dark:border-gray-700 h-32"
              >
                <img 
                  src={booking.pickup_image_url} 
                  alt="Location landmark" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                  Tap to expand photo
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4-STEP PROGRESS STEPPER                                  */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Trip Progression
          </span>

          <div className="space-y-4 pl-1">
            {/* Step 1: Request sent */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00C269] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                  Request dispatched
                </h4>
                <p className="text-[11px] text-gray-400">{booking.created_at}</p>
              </div>
            </div>

            {/* Step 2: Driver accepts */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isAccepted || isInProgress || isCompleted
                    ? 'bg-[#00C269] text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-gray-800 text-transparent'
                }`}
              >
                {isAccepted || isInProgress || isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : null}
              </div>
              <div>
                <h4 className={`text-xs sm:text-sm font-bold ${isAccepted || isInProgress || isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {booking.accepted_on_behalf ? 'Admin confirmed on behalf' : 'Driver accepted'}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isAccepted || isInProgress || isCompleted
                    ? (booking.assigned_driver_name ? `${booking.assigned_driver_name} is en route to you` : 'Assigned')
                    : 'Waiting for driver response'}
                </p>
              </div>
            </div>

            {/* Step 3: Trip in progress */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isInProgress || isCompleted
                    ? 'bg-[#00C269] text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-gray-800 text-transparent'
                }`}
              >
                {isInProgress || isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : null}
              </div>
              <div>
                <h4 className={`text-xs sm:text-sm font-bold ${isInProgress || isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  Trip in progress
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isInProgress ? 'Passenger boarded, in transit' : isInProgress || isCompleted ? 'Completed' : 'Boarding pending'}
                </p>
              </div>
            </div>

            {/* Step 4: Completed */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-[#00C269] text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-gray-800 text-transparent'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
              </div>
              <div>
                <h4 className={`text-xs sm:text-sm font-bold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  Arrived at destination
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isCompleted ? 'Safely reached destination' : 'Pending completion'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Button (Only while pending or accepted) */}
        {(isPending || isAccepted) && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3.5 bg-gray-100 dark:bg-[#1E2330] hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Cancel Charter Request
            </button>
          </div>
        )}
      </div>

      {/* Enlarged Photo Modal */}
      {enlargedImage && (
        <div 
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg w-full bg-white dark:bg-[#151821] rounded-3xl overflow-hidden p-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 px-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Your Landmark Photo
              </span>
              <button
                type="button"
                onClick={() => setEnlargedImage(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={enlargedImage}
              alt="Enlarged landmark"
              className="w-full max-h-[70vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
