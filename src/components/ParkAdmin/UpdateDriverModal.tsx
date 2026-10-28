import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DriverRecord, OperationalStatus, VehicleLocation } from '../../types';
import { useConfirm } from '../../context/ConfirmContext';
import { X } from 'lucide-react';

interface UpdateDriverModalProps {
  driver: DriverRecord;
  adminName: string;
  onClose: () => void;
}

export const UpdateDriverModal: React.FC<UpdateDriverModalProps> = ({
  driver,
  adminName,
  onClose,
}) => {
  const { 
    updateDriverOperationalStatus, 
    confirmDriverStatus, 
    driverEndShift, 
    updateVehicleLocation,
    vehicles 
  } = useApp();
  const { confirm } = useConfirm();

  const [status, setStatus] = useState<OperationalStatus>(driver.operational_status);
  const [location, setLocation] = useState<VehicleLocation>(driver.current_location);

  const assignedVehicle = vehicles.find((v) => v.vehicle_number === driver.vehicle_assigned);

  const handleSave = async () => {
    const isStatusChanged = status !== driver.operational_status;
    const isLocationChanged = location !== driver.current_location;

    if (isStatusChanged || isLocationChanged) {
      const changes: string[] = [];
      if (isStatusChanged) changes.push(`Operational Status: "${driver.operational_status}" → "${status}"`);
      if (isLocationChanged) changes.push(`Location: "${driver.current_location}" → "${location}"`);

      const ok = await confirm({
        title: 'Confirm Driver Fleet Update',
        message: `Please confirm the following fleet changes for driver ${driver.name} (${driver.vehicle_assigned}):\n\n• ${changes.join('\n• ')}`,
        confirmText: 'Confirm Update',
        cancelText: 'Cancel',
        variant: 'info',
        implicationText: `Fleet status for driver ${driver.name} was successfully updated.`,
        cancelImplicationText: 'Driver status update cancelled.',
      });

      if (!ok) return;
    }

    if (isStatusChanged) {
      updateDriverOperationalStatus(driver.id, status, adminName, 'Admin');
    } else {
      confirmDriverStatus(driver.id, adminName);
    }

    if (assignedVehicle && isLocationChanged) {
      const destination = location === 'En route' ? (driver.current_location === 'Campus Gate' ? 'SUB' : 'Campus Gate') : undefined;
      updateVehicleLocation(assignedVehicle.id, location, destination, adminName, 'Admin');
    }

    onClose();
  };

  const handleEndShift = async () => {
    const ok = await confirm({
      title: 'End Driver Shift',
      message: `Are you sure you want to end the on-duty shift for driver ${driver.name} (${driver.vehicle_assigned}) on their behalf?`,
      confirmText: 'End Shift',
      cancelText: 'Keep Shift Active',
      variant: 'warning',
      implicationText: `Shift ended for driver ${driver.name}. Status set to Shift ended.`,
      cancelImplicationText: 'Driver shift remains active.',
    });

    if (ok) {
      driverEndShift(driver.id, adminName, 'On behalf');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-[#252B3A] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Manage Driver
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              {driver.vehicle_assigned} · {driver.name}
              {driver.phone && (
                <a href={`tel:${driver.phone}`} className="ml-2 font-mono text-emerald-600 dark:text-emerald-400 hover:underline">
                  📞 {driver.phone}
                </a>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Operational Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Operational Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Available', 'On trip', 'On break', 'Unconfirmed'] as OperationalStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    status === st
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                      : 'bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-[#252B3A]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Vehicle Location (Shared Pool)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Campus Gate', 'SUB', 'En route'] as const).map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    location === loc
                      ? 'bg-[#00A86B] text-white border-[#00A86B]'
                      : 'bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-[#252B3A]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Save Changes
            </button>

            {driver.shift_status === 'On duty' && (
              <button
                type="button"
                onClick={handleEndShift}
                className="w-full py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
              >
                End Driver Shift
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
