import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { Download, X, Phone, MapPin, Image as ImageIcon, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CharterBooking } from '../../types';

export const CentralAdminBookings: React.FC = () => {
  const { bookings, drivers, exportBookingsCSV, resolveFlaggedBooking, acceptCharterOnBehalf } = useApp();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const [reviewBooking, setReviewBooking] = useState<CharterBooking | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Accept on behalf modal state
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

  const flaggedBooking = bookings.find((b) => b.status === 'Needs review' || b.left_open_at_closing);

  const handleOpenAcceptOnBehalf = (b: CharterBooking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAcceptingBooking(b);
    setAcceptFeedback(null);
    // Pre-select preferred driver if they are on duty, otherwise first available on-duty driver
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
      user?.full_name || 'Central Admin',
      'central_admin'
    );

    setAcceptFeedback(res);
  };

  const handleResolve = (resolution: 'Completed' | 'Cancelled') => {
    if (!reviewBooking) return;
    resolveFlaggedBooking(
      reviewBooking.id,
      resolution,
      resolutionNotes || 'Manually confirmed by Central Admin',
      user?.full_name || 'Central Admin'
    );
    setReviewBooking(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row (Matches Page 10 Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight">
            Central administrator
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
            Bookings
          </h1>
        </div>

        <button
          onClick={exportBookingsCSV}
          className="bg-white dark:bg-[#151821] hover:bg-gray-50 dark:hover:bg-[#1E2330] border border-gray-200 dark:border-[#252B3A] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Export</span>
        </button>
      </div>

      {/* Yellow Alert Banner (Matches Page 10 Screenshot) */}
      {flaggedBooking && (
        <div className="bg-[#FEF8E8] dark:bg-amber-950/40 rounded-3xl p-5 border border-[#FDE68A] dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-[#92400E] dark:text-amber-300">
              1 booking was left open at the daily closing. It has not been marked completed.
            </span>
          </div>

          <button
            onClick={() => setReviewBooking(flaggedBooking)}
            className="bg-white dark:bg-[#1E2330] hover:bg-amber-50 dark:hover:bg-amber-950/70 text-gray-900 dark:text-white text-xs font-bold px-5 py-2 rounded-xl border border-amber-200/80 dark:border-amber-800/80 shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
          >
            Review
          </button>
        </div>
      )}

      {/* Filter Tabs (Matches Page 10 Screenshot) */}
      <div className="flex items-center gap-1.5 bg-[#EAECEF] dark:bg-[#1E2330] p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar transition-colors">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`py-2 px-4 sm:px-5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeFilter === tab
                ? 'bg-[#00C269] text-white shadow-xs font-black'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Table Card (Matches Page 10 Screenshot) */}
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm font-medium min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                <th className="pb-4 pt-2">Booking</th>
                <th className="pb-4 pt-2">Requested by</th>
                <th className="pb-4 pt-2">Route</th>
                <th className="pb-4 pt-2">Driver</th>
                <th className="pb-4 pt-2">Accepted by</th>
                <th className="pb-4 pt-2">Status</th>
                <th className="pb-4 pt-2 text-right">Actions / Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setReviewBooking(b)}
                  className={`hover:bg-gray-50/60 dark:hover:bg-[#1A1E29] transition-colors cursor-pointer ${
                    b.status === 'Needs review' ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{b.id}</td>
                  <td className="py-4 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    <div>
                      <span>{b.requester_name}</span>
                      {b.requester_phone && (
                        <span className="block text-[11px] text-gray-400 font-mono">{b.requester_phone}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-gray-900 dark:text-gray-200 font-medium">
                    <div>
                      <span>{b.pickup} → {b.destination}</span>
                      {b.preferred_driver_name && (
                        <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          ★ Prefers: {b.preferred_driver_name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    <div>
                      <span>{b.assigned_driver_name || 'Not assigned'}</span>
                      {b.driver_phone && (
                        <span className="block text-[11px] text-gray-400 font-mono">{b.driver_phone}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs max-w-[200px] truncate">
                    {b.accepted_by ? (
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        b.accepted_on_behalf 
                          ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {b.accepted_on_behalf ? 'Admin (On behalf)' : 'Driver directly'}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unaccepted</span>
                    )}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td className="py-4 text-right text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenAcceptOnBehalf(b, e)}
                          className="bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.98] text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          title="Accept on behalf of an on-duty driver"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Accept on Behalf</span>
                        </button>
                      )}
                      <span className="text-xs text-gray-400">{b.created_at}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal for Trip Details & Verification */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Review Charter Trip
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {reviewBooking.id} · {reviewBooking.status}
                </p>
              </div>
              <button
                onClick={() => setReviewBooking(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                <span className="text-gray-400">Route</span>
                <span className="font-bold text-gray-900 dark:text-white text-right">{reviewBooking.pickup} → {reviewBooking.destination}</span>
              </div>

              {/* Student Details & Phone Contact */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                <div>
                  <span className="text-gray-400 block text-xs">Student Requester</span>
                  <span className="font-bold text-gray-900 dark:text-white">{reviewBooking.requester_name}</span>
                </div>
                {reviewBooking.requester_phone ? (
                  <a
                    href={`tel:${reviewBooking.requester_phone}`}
                    className="inline-flex items-center gap-1.5 bg-[#00A86B] hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {reviewBooking.requester_phone}</span>
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No phone</span>
                )}
              </div>

              {/* Driver Details & Phone Contact */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                <div>
                  <span className="text-gray-400 block text-xs">Assigned Driver</span>
                  <span className="font-bold text-gray-900 dark:text-white">{reviewBooking.assigned_driver_name || 'Unassigned'}</span>
                  {reviewBooking.assigned_vehicle && (
                    <span className="text-xs text-gray-400 block">({reviewBooking.assigned_vehicle})</span>
                  )}
                </div>
                {reviewBooking.driver_phone ? (
                  <a
                    href={`tel:${reviewBooking.driver_phone}`}
                    className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {reviewBooking.driver_phone}</span>
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">{reviewBooking.assigned_driver_name ? 'No phone' : 'Waiting for driver'}</span>
                )}
              </div>

              {/* Accepted By Breakdown */}
              {reviewBooking.accepted_by && (
                <div className="pb-2 border-b border-gray-200/60 dark:border-gray-800">
                  <span className="text-gray-400 block text-xs">Accepted By</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      reviewBooking.accepted_on_behalf 
                        ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {reviewBooking.accepted_by}
                    </span>
                  </div>
                </div>
              )}

              {/* Preferred Driver (if chosen by student) */}
              {reviewBooking.preferred_driver_name && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                  <span className="text-gray-400 text-xs">Student Preferred Driver</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    ★ {reviewBooking.preferred_driver_name}
                  </span>
                </div>
              )}

              {/* Student Location Note */}
              {reviewBooking.pickup_note && (
                <div className="pb-2 border-b border-gray-200/60 dark:border-gray-800">
                  <span className="text-gray-400 text-xs flex items-center gap-1 block mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Student Landmark Note
                  </span>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-[#151821] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    "{reviewBooking.pickup_note}"
                  </p>
                </div>
              )}

              {/* Student Location Photo */}
              {reviewBooking.pickup_image_url && (
                <div>
                  <span className="text-gray-400 text-xs flex items-center gap-1 block mb-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Student Landmark Photo
                  </span>
                  <img
                    src={reviewBooking.pickup_image_url}
                    alt="Pickup location"
                    className="w-full h-36 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}

              {reviewBooking.notes && (
                <div className="pt-1">
                  <span className="text-amber-700 dark:text-amber-300 font-semibold block text-xs">System Note:</span>
                  <span className="text-amber-800 dark:text-amber-200 text-xs">{reviewBooking.notes}</span>
                </div>
              )}
            </div>

            {/* Resolution Form for Flagged or Unresolved Trips (FR-12) */}
            {reviewBooking.status === 'Needs review' && (
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Admin Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Called passenger and driver; trip was completed safely before shift closing."
                  rows={2}
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs font-medium rounded-2xl p-3 outline-none border border-transparent focus:border-gray-400"
                />

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleResolve('Cancelled')}
                    className="flex-1 py-3 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#282F40] text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Mark Cancelled
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolve('Completed')}
                    className="flex-1 py-3 bg-[#00A86B] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            )}

            {/* If pending, Central Admin can accept on behalf directly from here */}
            {reviewBooking.status === 'Pending' && (
              <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    const target = reviewBooking;
                    setReviewBooking(null);
                    handleOpenAcceptOnBehalf(target);
                  }}
                  className="w-full py-3 bg-[#00A86B] hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Accept on Behalf of an On-Duty Driver</span>
                </button>
              </div>
            )}

            {reviewBooking.status !== 'Needs review' && (
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="w-full py-3 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#252B3A] text-gray-800 dark:text-gray-200 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Close Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal: Accept on Behalf of an On-Shift Driver (FR & User Prompt) */}
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
                  Booking #{acceptingBooking.id} · Assign an on-duty driver
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
                <span className="font-bold text-gray-900 dark:text-white">{acceptingBooking.pickup} → {acceptingBooking.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Student</span>
                <span className="font-bold text-gray-900 dark:text-white">{acceptingBooking.requester_name}</span>
              </div>
              {acceptingBooking.preferred_driver_name && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1 border-t border-gray-200/60 dark:border-gray-800">
                  <span className="font-semibold">Student Preferred Driver:</span>
                  <span className="font-bold">★ {acceptingBooking.preferred_driver_name}</span>
                </div>
              )}
            </div>

            {/* Feedback / Call Prompt after accepting */}
            {acceptFeedback && acceptFeedback.success ? (
              <div className="bg-[#EBF7EE] dark:bg-emerald-950/40 border border-[#D8F3DC] dark:border-emerald-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Successfully Accepted on Behalf!</h4>
                    <p className="text-xs mt-0.5 text-emerald-700 dark:text-emerald-400">
                      The charter has been assigned to driver <strong>{acceptFeedback.driverName}</strong> and marked as Accepted.
                    </p>
                  </div>
                </div>

                {/* Direct Phone Call Button to Notify Driver */}
                <div className="pt-2">
                  <a
                    href={`tel:${acceptFeedback.driverPhone}`}
                    className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.98] text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Driver ({acceptFeedback.driverName} · {acceptFeedback.driverPhone}) to Notify</span>
                  </a>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center block mt-1.5">
                    Click above to immediately dial and inform the driver they have been assigned this charter.
                  </span>
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
                    Select Driver On Shift ({onDutyDrivers.length} Available)
                  </label>
                  {onDutyDrivers.length === 0 ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs rounded-2xl border border-amber-200 dark:border-amber-800/80">
                      No drivers are currently checked in "On duty". Drivers must be on shift to be assigned charters.
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
                    Charters will be registered with your admin name: "{user?.full_name || 'Central Admin'} (Central Admin on behalf of driver)".
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
