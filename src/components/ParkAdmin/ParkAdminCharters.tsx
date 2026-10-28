import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { CharterBooking } from '../../types';
import { 
  Compass, 
  UserCheck, 
  Phone, 
  MapPin, 
  X, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';

export const ParkAdminCharters: React.FC = () => {
  const { bookings, drivers, acceptCharterOnBehalf } = useApp();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<CharterBooking | null>(null);

  // Accept on Behalf modal state
  const [acceptingBooking, setAcceptingBooking] = useState<CharterBooking | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [acceptFeedback, setAcceptFeedback] = useState<{
    success: boolean;
    driverPhone?: string;
    driverName?: string;
    error?: string;
  } | null>(null);

  const filterTabs = ['All', 'Pending', 'Accepted', 'In progress', 'Completed', 'Cancelled'];

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'All') return true;
    return b.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const onDutyDrivers = drivers.filter((d) => d.shift_status === 'On duty');

  const handleOpenAcceptOnBehalf = (b: CharterBooking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAcceptingBooking(b);
    setAcceptFeedback(null);
    const preferredOnDuty = onDutyDrivers.find((d) => d.id === b.preferred_driver_id);
    if (preferredOnDuty) {
      setSelectedDriverId(preferredOnDuty.id);
    } else {
      setSelectedDriverId(onDutyDrivers[0]?.id || '');
    }
  };

  const handleConfirmAcceptOnBehalf = () => {
    if (!acceptingBooking || !selectedDriverId) return;

    const res = acceptCharterOnBehalf(
      acceptingBooking.id,
      selectedDriverId,
      user?.full_name || 'Park Admin',
      'park_admin'
    );

    setAcceptFeedback(res);
  };

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-6xl xl:max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight uppercase">
            Park Transportation
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
            Tricycle Charter Bookings
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Accept passenger charter requests on behalf of on-shift drivers and coordinate dispatches.
          </p>
        </div>

        {/* On Duty Drivers Counter */}
        <div className="flex items-center gap-2 bg-[#EBF7EE] dark:bg-emerald-950/40 border border-[#D8F3DC] dark:border-emerald-800/60 px-4 py-2 rounded-2xl self-start sm:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
            {onDutyDrivers.length} Driver(s) on shift
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#EAECEF] dark:bg-[#1E2330] p-1.5 rounded-2xl w-fit transition-colors">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === tab
                ? 'bg-white text-gray-900 dark:bg-[#252B3A] dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-medium">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                <th className="pb-3.5 pt-2">Booking ID</th>
                <th className="pb-3.5 pt-2">Student Passenger</th>
                <th className="pb-3.5 pt-2">Route</th>
                <th className="pb-3.5 pt-2">Assigned Driver</th>
                <th className="pb-3.5 pt-2">Accepted by</th>
                <th className="pb-3.5 pt-2">Status</th>
                <th className="pb-3.5 pt-2 text-right">Actions / Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBookingForReview(b)}
                  className="hover:bg-gray-50/60 dark:hover:bg-[#1A1E29] transition-colors cursor-pointer"
                >
                  <td className="py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{b.id}</td>

                  {/* Student */}
                  <td className="py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-900 dark:text-white block">{b.requester_name}</span>
                    {b.requester_phone && (
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {b.requester_phone}
                      </span>
                    )}
                  </td>

                  {/* Route */}
                  <td className="py-4 font-medium text-gray-800 dark:text-gray-200">
                    <div>
                      <span>{b.pickup} → {b.destination}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          👥 {b.passenger_count || 1} Person{(b.passenger_count || 1) > 1 ? 's' : ''}
                        </span>
                        {b.preferred_driver_name && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            • ★ Prefers: {b.preferred_driver_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Driver */}
                  <td className="py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    <div>
                      <span className="font-semibold block">{b.assigned_driver_name || 'Unassigned'}</span>
                      {b.driver_phone && (
                        <span className="text-[11px] font-mono font-bold text-gray-600 dark:text-gray-300 inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {b.driver_phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Accepted by label */}
                  <td className="py-4 whitespace-nowrap text-xs max-w-[200px] truncate">
                    {b.accepted_by ? (
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        b.accepted_on_behalf
                          ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {b.accepted_on_behalf ? 'Admin (On behalf)' : 'Driver directly'}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unaccepted</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 whitespace-nowrap">
                    <StatusBadge status={b.status} size="sm" />
                  </td>

                  {/* Actions / Time */}
                  <td className="py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenAcceptOnBehalf(b, e)}
                          className="bg-[#00A86B] hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Accept on Behalf</span>
                        </button>
                      )}
                      <span className="text-xs text-gray-400 font-medium">{b.created_at}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs sm:text-sm">
              No charter requests match the selected status filter.
            </div>
          )}
        </div>
      </div>

      {/* Booking Review Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Charter Trip Details
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedBookingForReview.id} · {selectedBookingForReview.status}
                </p>
              </div>
              <button
                onClick={() => setSelectedBookingForReview(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 space-y-3 text-xs sm:text-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                <span className="text-gray-400">Route</span>
                <span className="font-bold text-gray-900 dark:text-white text-right">
                  {selectedBookingForReview.pickup} → {selectedBookingForReview.destination}
                </span>
              </div>

              {/* Passenger Capacity */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                <span className="text-gray-400 text-xs">Passengers Boarding</span>
                <span className="font-bold text-gray-900 dark:text-white text-xs">
                  👥 {selectedBookingForReview.passenger_count || 1} Person{(selectedBookingForReview.passenger_count || 1) > 1 ? 's' : ''}
                </span>
              </div>

              {/* Passenger */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                <div>
                  <span className="text-gray-400 text-xs block">Student Requester</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedBookingForReview.requester_name}</span>
                </div>
                {selectedBookingForReview.requester_phone && (
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#1E2330] px-3 py-1.5 rounded-xl border border-gray-200/60 dark:border-gray-800">
                    <Phone className="w-3.5 h-3.5 text-[#00A86B]" />
                    <span>{selectedBookingForReview.requester_phone}</span>
                  </div>
                )}
              </div>

              {/* Driver */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                <div>
                  <span className="text-gray-400 text-xs block">Assigned Driver</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedBookingForReview.assigned_driver_name || 'Unassigned'}
                  </span>
                  {selectedBookingForReview.assigned_vehicle && (
                    <span className="text-xs text-gray-400 block font-semibold">({selectedBookingForReview.assigned_vehicle})</span>
                  )}
                </div>
                {selectedBookingForReview.driver_phone && (
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#1E2330] px-3 py-1.5 rounded-xl border border-gray-200/60 dark:border-gray-800">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>{selectedBookingForReview.driver_phone}</span>
                  </div>
                )}
              </div>

              {/* Who Accepted */}
              {selectedBookingForReview.accepted_by && (
                <div className="pb-2 border-b border-gray-200/60 dark:border-gray-800">
                  <span className="text-gray-400 block text-xs">Accepted By</span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedBookingForReview.accepted_by}
                  </p>
                </div>
              )}

              {/* Preferred Driver */}
              {selectedBookingForReview.preferred_driver_name && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                  <span className="text-gray-400 text-xs">Student Preferred Driver</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    ★ {selectedBookingForReview.preferred_driver_name}
                  </span>
                </div>
              )}

              {/* Note */}
              {selectedBookingForReview.pickup_note && (
                <div className="pb-2 border-b border-gray-200/60 dark:border-gray-800">
                  <span className="text-gray-400 text-xs flex items-center gap-1 block mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Student Landmark Description
                  </span>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-[#151821] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    "{selectedBookingForReview.pickup_note}"
                  </p>
                </div>
              )}

              {/* Photo */}
              {selectedBookingForReview.pickup_image_url && (
                <div>
                  <span className="text-gray-400 text-xs flex items-center gap-1 block mb-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Student Location Photo
                  </span>
                  <img
                    src={selectedBookingForReview.pickup_image_url}
                    alt="Pickup landmark"
                    className="w-full h-36 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            {selectedBookingForReview.status === 'Pending' && (
              <button
                type="button"
                onClick={() => {
                  const b = selectedBookingForReview;
                  setSelectedBookingForReview(null);
                  handleOpenAcceptOnBehalf(b);
                }}
                className="w-full py-3 bg-[#00A86B] hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Accept on Behalf of an On-Duty Driver</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedBookingForReview(null)}
              className="w-full py-3 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#252B3A] text-gray-800 dark:text-gray-200 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal: Accept on Behalf of an On-Duty Driver (Park Admin) */}
      {acceptingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#00A86B]" />
                  Accept Charter on Behalf
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Booking #{acceptingBooking.id} · Assign an on-duty tricycle driver
                </p>
              </div>
              <button
                onClick={() => {
                  setAcceptingBooking(null);
                  setAcceptFeedback(null);
                }}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trip summary */}
            <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 text-xs space-y-2 border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-400">Route</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {acceptingBooking.pickup} → {acceptingBooking.destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Student</span>
                <span className="font-bold text-gray-900 dark:text-white">{acceptingBooking.requester_name}</span>
              </div>
              {acceptingBooking.preferred_driver_name && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1 border-t border-gray-200/60 dark:border-gray-800">
                  <span className="font-semibold">Student Requested Driver:</span>
                  <span className="font-bold">★ {acceptingBooking.preferred_driver_name}</span>
                </div>
              )}
            </div>

            {/* Feedback & Call Button to Driver */}
            {acceptFeedback && acceptFeedback.success ? (
              <div className="bg-[#EBF7EE] dark:bg-emerald-950/40 border border-[#D8F3DC] dark:border-emerald-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Successfully Accepted on Behalf!</h4>
                    <p className="text-xs mt-0.5 text-emerald-700 dark:text-emerald-400">
                      The trip is assigned to <strong>{acceptFeedback.driverName}</strong>. Please phone the driver immediately to inform them of this pickup.
                    </p>
                  </div>
                </div>

                {/* Driver Contact Info Display */}
                <div className="pt-2 bg-[#F6F8FA] dark:bg-[#1E2330] p-4 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Driver Phone:</span>
                    <span className="font-mono font-black text-sm text-gray-900 dark:text-white">{acceptFeedback.driverPhone}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{acceptFeedback.driverName}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAcceptingBooking(null);
                    setAcceptFeedback(null);
                  }}
                  className="w-full py-2.5 bg-white dark:bg-[#1E2330] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptFeedback && !acceptFeedback.success && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-800">
                    {acceptFeedback.error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Select Driver On Shift ({onDutyDrivers.length} On Duty)
                  </label>
                  {onDutyDrivers.length === 0 ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs rounded-2xl border border-amber-200 dark:border-amber-800/80">
                      No drivers are currently checked in "On duty". Drivers must be on shift before charters can be assigned to them.
                    </div>
                  ) : (
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-gray-400 text-xs sm:text-sm cursor-pointer"
                    >
                      {onDutyDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} · {d.vehicle_assigned} ({d.vehicle_type === 'tricycle' ? 'Tricycle' : 'Bus'}) · At {d.current_location} {d.operational_status === 'Available' ? '· Ready' : `· (${d.operational_status})`}
                        </option>
                      ))}
                    </select>
                  )}
                  <span className="text-[11px] text-gray-400 block mt-1.5">
                    This booking will clearly display "{user?.full_name || 'Park Admin'} (Park Admin on behalf of driver)" to both passenger and fleet.
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAcceptingBooking(null);
                      setAcceptFeedback(null);
                    }}
                    className="flex-1 py-3 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#282F40] text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedDriverId || onDutyDrivers.length === 0}
                    onClick={handleConfirmAcceptOnBehalf}
                    className="flex-1 py-3 bg-[#00A86B] hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Confirm & Accept</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
