import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { 
  Car, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const DriverRequestsView: React.FC = () => {
  const { 
    bookings, 
    drivers, 
    acceptCharterRequest, 
    rejectCharterRequest, 
    startCharterTrip, 
    completeCharterTrip 
  } = useApp();
  const { user } = useAuth();

  const currentDriver = drivers.find((d) => d.name === user?.full_name || d.user_id === user?.id) || drivers[0];
  const isSuspended = user?.status === 'Suspended';
  const isDeactivated = user?.status === 'Deactivated';

  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const pendingRequests = bookings.filter((b) => b.status === 'Pending');
  const myAssignedRequests = bookings.filter((b) => b.assigned_driver_id === currentDriver.id);

  let displayedRequests = bookings;
  if (filter === 'pending') {
    displayedRequests = pendingRequests;
  } else if (filter === 'assigned') {
    displayedRequests = myAssignedRequests;
  }

  const handleAccept = (bookingId: string) => {
    if (isSuspended || isDeactivated) {
      setErrorMessage('Your account is currently suspended from accepting charter trips.');
      return;
    }
    setErrorMessage(null);
    const result = acceptCharterRequest(bookingId, currentDriver.id, currentDriver.name);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to accept trip');
    }
  };

  return (
    <div className="pb-32 pt-3 md:py-8 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00C269]">
            Campus Dispatch Feed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Charter Requests
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            Review incoming student pickup requests and coordinate dispatches
          </p>
        </div>

        {/* Counter Pill */}
        <div className="bg-[#EBF7EE] dark:bg-emerald-950/40 text-[#00C269] px-4 py-2 rounded-2xl border border-[#D8F3DC] dark:border-emerald-800/60 text-xs font-bold self-start sm:self-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00C269] animate-pulse" />
          <span>{pendingRequests.length} Available Requests</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs rounded-2xl font-bold flex items-center gap-2 border border-red-200 dark:border-red-800/60 shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Tabs (Bolt Segmented Pill Style) */}
      <div className="bg-[#EAECEF] dark:bg-[#1E2330] p-1.5 rounded-2xl flex items-center max-w-md transition-colors">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-white dark:bg-[#2A3142] text-gray-900 dark:text-white shadow-xs font-black'
              : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-white dark:bg-[#2A3142] text-gray-900 dark:text-white shadow-xs font-black'
              : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Available ({pendingRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('assigned')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === 'assigned'
              ? 'bg-white dark:bg-[#2A3142] text-gray-900 dark:text-white shadow-xs font-black'
              : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          My Trips ({myAssignedRequests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {displayedRequests.length === 0 ? (
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-10 border border-gray-100 dark:border-[#252B3A] text-center text-gray-400 space-y-2 transition-colors">
            <Car className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No requests in this category</h4>
            <p className="text-xs text-gray-400">
              When new student charter trips are submitted, they will appear here in real time.
            </p>
          </div>
        ) : (
          displayedRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-[#151821] rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-400">#{req.id}</span>
                <StatusBadge status={req.status} size="sm" />
              </div>

              {/* Bolt Route Connector Visual */}
              <div className="flex items-start gap-3 bg-[#F6F8FA] dark:bg-[#1E2330] p-4 rounded-2xl">
                <div className="flex flex-col items-center mt-1 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00C269]" />
                  <div className="w-0.5 h-7 bg-gray-300 dark:bg-gray-600 my-0.5" />
                  <div className="w-2.5 h-2.5 rounded-xs bg-gray-900 dark:bg-white" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                      {req.pickup}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Pickup</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                      {req.destination}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Dropoff</span>
                  </div>
                </div>
              </div>

              {/* Preferred Driver Tag & Attribution */}
              <div className="flex flex-wrap items-center gap-2">
                {req.preferred_driver_name && (
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-xl ${
                    req.preferred_driver_id === currentDriver.id
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    ★ {req.preferred_driver_id === currentDriver.id ? 'Requested specifically for YOU!' : `Prefers: ${req.preferred_driver_name}`}
                  </span>
                )}

                {req.accepted_by && (
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-xl ${
                    req.accepted_on_behalf
                      ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    Accepted by: {req.accepted_by}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Passenger: <strong className="text-gray-800 dark:text-gray-200">{req.requester_name}</strong> • Time: <strong className="text-gray-800 dark:text-gray-200">{req.when_type}</strong> • Requested at: {req.created_at}
              </div>

              {/* Passenger Contact & Landmark Details */}
              <div className="space-y-2 pt-1 text-xs">
                {req.requester_phone && (
                  <div className="flex items-center justify-between bg-[#F6F8FA] dark:bg-[#1E2330] p-3 rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Phone className="w-3.5 h-3.5 text-[#00C269]" />
                      <span>Passenger Phone:</span>
                      <span className="font-mono font-bold">{req.requester_phone}</span>
                    </div>
                    <a
                      href={`tel:${req.requester_phone}`}
                      className="inline-flex items-center gap-1.5 bg-[#00C269] hover:bg-[#00AB5D] text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  </div>
                )}

                {req.pickup_note && (
                  <div className="bg-[#F6F8FA] dark:bg-[#1E2330] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#00C269]" />
                      Passenger Landmark Note
                    </span>
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
                      "{req.pickup_note}"
                    </p>
                  </div>
                )}

                {req.pickup_image_url && (
                  <div
                    onClick={() => setEnlargedImage(req.pickup_image_url || null)}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group h-28 border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={req.pickup_image_url}
                      alt="Passenger landmark"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                      Tap to view passenger's location photo
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons based on status */}
              {req.status === 'Pending' && (
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => rejectCharterRequest(req.id, currentDriver.id, currentDriver.name)}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-bold px-4 py-2.5 cursor-pointer transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    className="text-xs sm:text-sm bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.98] text-white font-black px-6 py-3 rounded-2xl shadow-md shadow-emerald-500/25 cursor-pointer transition-all"
                  >
                    Accept Trip
                  </button>
                </div>
              )}

              {req.status === 'Accepted' && req.assigned_driver_id === currentDriver.id && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => startCharterTrip(req.id, currentDriver.name)}
                    className="w-full bg-[#00C269] hover:bg-[#00AB5D] text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    Start Trip (Passenger Boarded)
                  </button>
                </div>
              )}

              {req.status === 'In progress' && req.assigned_driver_id === currentDriver.id && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => completeCharterTrip(req.id, currentDriver.name)}
                    className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    Complete Trip (Arrived Safely)
                  </button>
                </div>
              )}
            </div>
          ))
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
                Passenger Landmark Photo
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
              alt="Passenger landmark"
              className="w-full max-h-[70vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
