import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleLocation } from '../../types';
import { X } from 'lucide-react';

interface CheckInDriverModalProps {
  currentParkName: 'Campus Gate' | 'SUB';
  adminName: string;
  onClose: () => void;
}

export const CheckInDriverModal: React.FC<CheckInDriverModalProps> = ({
  currentParkName,
  adminName,
  onClose,
}) => {
  const { drivers, driverCheckIn } = useApp();
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<VehicleLocation>(currentParkName);

  const eligibleDrivers = drivers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) return;

    driverCheckIn(
      selectedDriverId,
      selectedLocation,
      adminName,
      'On behalf'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-[#252B3A] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Check in a driver
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Record check-in on behalf of a driver without phone access (FR-05).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Select Driver
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              required
              className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-gray-400 text-sm"
            >
              <option value="">-- Choose a driver --</option>
              {eligibleDrivers.map((d) => (
                <option key={d.id} value={d.id} className="bg-white dark:bg-[#151821]">
                  {d.name} ({d.vehicle_assigned}) - {d.shift_status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Check-in Location
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Campus Gate', 'SUB'] as const).map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedLocation === loc
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-[#252B3A]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#252B3A] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedDriverId}
              className="flex-1 py-3 text-xs font-bold text-white bg-[#00A86B] hover:bg-emerald-600 rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
            >
              Confirm Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
