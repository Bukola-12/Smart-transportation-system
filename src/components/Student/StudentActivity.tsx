import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { Clock, ArrowRight, Plus } from 'lucide-react';

interface StudentActivityProps {
  onSelectBooking: (bookingId: string) => void;
  onGoToCharter: () => void;
}

export const StudentActivity: React.FC<StudentActivityProps> = ({
  onSelectBooking,
  onGoToCharter,
}) => {
  const { bookings } = useApp();
  const { user } = useAuth();

  const studentBookings = bookings.filter(
    (b) => b.requester_id === user?.id || b.requester_name === user?.full_name
  );

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Your Charter Activity
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5">
            Your tricycle charter bookings and trip history
          </p>
        </div>
        <button
          onClick={onGoToCharter}
          className="text-xs md:text-sm bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.98] text-white font-black px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New request</span>
        </button>
      </div>

      {studentBookings.length === 0 ? (
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-12 border border-gray-100 dark:border-[#252B3A] text-center space-y-3 shadow-xs transition-colors">
          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No charter trips yet</h3>
          <p className="text-xs md:text-sm text-gray-400 dark:text-gray-400 max-w-md mx-auto">
            When you request a tricycle charter, your live progression and booking history will appear here.
          </p>
          <button
            onClick={onGoToCharter}
            className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2 inline-block cursor-pointer"
          >
            Request a tricycle now →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBooking(b.id)}
              className="bg-white dark:bg-[#151821] rounded-3xl p-5 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm md:text-base text-gray-900 dark:text-white">
                    {b.pickup} → {b.destination}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 dark:text-gray-400 font-medium">
                  <span className="font-mono">{b.id}</span>
                  <span>•</span>
                  <span>{b.created_at}</span>
                  {b.assigned_driver_name && (
                    <>
                      <span>•</span>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">{b.assigned_driver_name}</span>
                    </>
                  )}
                  {b.driver_phone && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">📞 {b.driver_phone}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={b.status} size="sm" />
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
