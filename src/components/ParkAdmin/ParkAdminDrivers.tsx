import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { UpdateDriverModal } from './UpdateDriverModal';
import { CheckInDriverModal } from './CheckInDriverModal';
import { DriverRecord, UserProfile, VehicleLocation, VehicleType } from '../../types';
import { useConfirm } from '../../context/ConfirmContext';
import { Search, Plus, Clock, CheckCircle, X, Shield, Phone, Mail, Car } from 'lucide-react';

export const ParkAdminDrivers: React.FC = () => {
  const { drivers, vehicles, approveAndEnrollDriver } = useApp();
  const { user, users, approveDriverAccount, rejectAccountRegistration } = useAuth();
  const { confirm } = useConfirm();

  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Approval modal state
  const [approvingApplicant, setApprovingApplicant] = useState<UserProfile | null>(null);
  const [assignedVehicleNumber, setAssignedVehicleNumber] = useState('');
  const [assignedVehicleType, setAssignedVehicleType] = useState<VehicleType>('tricycle');
  const [assignedParkLocation, setAssignedParkLocation] = useState<VehicleLocation>(
    user?.park_scope === 'SUB' ? 'SUB' : 'Campus Gate'
  );
  const [customVehicleInput, setCustomVehicleInput] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  const pendingDrivers = users.filter(
    (u) => u.role === 'driver' && u.status === 'Pending approval'
  );

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.vehicle_assigned.toLowerCase().includes(search.toLowerCase()) ||
      d.current_location.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenApproveModal = (applicant: UserProfile) => {
    setApprovingApplicant(applicant);
    const prefType = applicant.preferred_vehicle_type || 'tricycle';
    setAssignedVehicleType(prefType);

    // Pick first matching vehicle from fleet if available
    const matchingVeh = vehicles.find((v) => v.vehicle_type === prefType && !v.assigned_driver_name);
    if (matchingVeh) {
      setAssignedVehicleNumber(matchingVeh.vehicle_number);
      setCustomVehicleInput(false);
    } else {
      setAssignedVehicleNumber(prefType === 'bus' ? 'Bus 12' : 'Tricycle 08');
      setCustomVehicleInput(true);
    }

    setAssignedParkLocation(user?.park_scope === 'SUB' ? 'SUB' : 'Campus Gate');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingApplicant || !assignedVehicleNumber.trim()) return;

    const actor = user?.full_name || 'Park Admin';
    const vehNumber = assignedVehicleNumber.trim();

    // 1. Update user profile in AuthContext
    approveDriverAccount(approvingApplicant.id, vehNumber, assignedParkLocation as 'Campus Gate' | 'SUB', actor);

    // 2. Enroll driver into active fleet in AppContext
    approveAndEnrollDriver(
      approvingApplicant,
      vehNumber,
      assignedVehicleType,
      assignedParkLocation,
      actor
    );

    setApprovalMessage(`Driver ${approvingApplicant.full_name} has been approved and assigned to ${vehNumber}!`);
    setTimeout(() => setApprovalMessage(null), 4000);

    setApprovingApplicant(null);
  };

  const handleRejectApplicant = async (applicantId: string, applicantName: string) => {
    const ok = await confirm({
      title: 'Decline Driver Registration',
      message: `Are you sure you want to decline the driver registration application for ${applicantName}?\n\nThis will mark the driver account application as rejected.`,
      confirmText: 'Decline Registration',
      cancelText: 'Keep Application',
      variant: 'danger',
      implicationText: `Driver registration application for ${applicantName} was declined.`,
      cancelImplicationText: 'Decline cancelled. Driver applicant remains in queue.',
    });

    if (ok) {
      rejectAccountRegistration(applicantId, user?.full_name || 'Park Admin');
      setApprovalMessage(`Registration for ${applicantName} was declined.`);
      setTimeout(() => setApprovalMessage(null), 3000);
    }
  };

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Drivers Pool & Approvals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5">
            Manage active driver shifts and verify pending driver registrations
          </p>
        </div>

        <button
          onClick={() => setIsCheckInOpen(true)}
          className="text-xs md:text-sm bg-black dark:bg-white text-white dark:text-black font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Check in driver</span>
        </button>
      </div>

      {/* Success Banner */}
      {approvalMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
          <span>{approvalMessage}</span>
        </div>
      )}

      {/* Tabs: Active Pool vs Pending Approvals */}
      <div className="flex items-center gap-2 bg-[#EAECEF] dark:bg-[#1E2330] p-1.5 rounded-2xl w-fit transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-white text-gray-900 dark:bg-[#252B3A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Active Drivers ({drivers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-white text-gray-900 dark:bg-[#252B3A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <span>Pending Approvals</span>
          {pendingDrivers.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {pendingDrivers.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ACTIVE DRIVERS POOL */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search driver, vehicle or park..."
              className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs md:text-sm font-medium pl-10 pr-4 py-3 rounded-2xl outline-none focus:bg-white dark:focus:bg-[#151821] focus:border-gray-400 border border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className="bg-white dark:bg-[#151821] rounded-3xl p-5 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm md:text-base text-gray-900 dark:text-white">
                      {driver.vehicle_assigned} · {driver.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    Loc: <span className="text-gray-700 dark:text-gray-300 font-semibold">{driver.current_location}</span> • Shift: {driver.shift_status}
                  </p>
                  {driver.phone && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                      📞 {driver.phone}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={driver.operational_status} size="sm" />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Tap to edit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PENDING DRIVER APPROVALS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Pending Driver Account Approvals</span>
              <span>
                Drivers who registered via the sign-up form cannot log in until approved. Review their details, assign their vehicle, and confirm approval below.
              </span>
            </div>
          </div>

          {pendingDrivers.length === 0 ? (
            <div className="bg-white dark:bg-[#151821] rounded-3xl p-10 border border-gray-100 dark:border-[#252B3A] text-center space-y-2">
              <Shield className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">No Pending Driver Applications</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                All driver registrations have been reviewed. New driver signups will show up here immediately for verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDrivers.map((applicant) => (
                <div
                  key={applicant.id}
                  className="bg-white dark:bg-[#151821] rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md inline-block mb-1">
                        Awaiting Approval
                      </span>
                      <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                        {applicant.full_name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Registered {new Date(applicant.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="text-xs bg-gray-100 dark:bg-[#1E2330] text-gray-600 dark:text-gray-300 font-semibold px-2.5 py-1 rounded-full capitalize">
                      {applicant.preferred_vehicle_type || 'Tricycle'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 bg-[#F9FAFB] dark:bg-[#1A1E29] p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                        {applicant.phone || 'No phone provided'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-50 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => handleRejectApplicant(applicant.id, applicant.full_name)}
                      className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenApproveModal(applicant)}
                      className="px-5 py-2.5 text-xs font-bold bg-[#00A86B] hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      Approve Driver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Approve & Assign Vehicle to Driver */}
      {approvingApplicant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Approve Driver Account
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Verify credentials & assign vehicle
                </p>
              </div>
              <button
                onClick={() => setApprovingApplicant(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl p-4 text-xs space-y-2 border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-400">Driver</span>
                <span className="font-bold text-gray-900 dark:text-white">{approvingApplicant.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{approvingApplicant.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-700 dark:text-gray-300">{approvingApplicant.email}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['tricycle', 'bus'] as VehicleType[]).map((vt) => (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setAssignedVehicleType(vt)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        assignedVehicleType === vt
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                          : 'bg-white dark:bg-[#1E2330] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {vt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Assign Vehicle *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomVehicleInput(!customVehicleInput)}
                    className="text-[11px] text-[#00A86B] font-semibold hover:underline cursor-pointer"
                  >
                    {customVehicleInput ? 'Pick from fleet list' : 'Type custom vehicle number'}
                  </button>
                </div>

                {customVehicleInput ? (
                  <input
                    type="text"
                    value={assignedVehicleNumber}
                    onChange={(e) => setAssignedVehicleNumber(e.target.value)}
                    placeholder="e.g. Tricycle 08 or Bus 12"
                    required
                    className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-2xl px-4 py-3 outline-none"
                  />
                ) : (
                  <select
                    value={assignedVehicleNumber}
                    onChange={(e) => setAssignedVehicleNumber(e.target.value)}
                    required
                    className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-2xl px-4 py-3 outline-none cursor-pointer"
                  >
                    <option value="">-- Select fleet vehicle --</option>
                    {vehicles
                      .filter((v) => v.vehicle_type === assignedVehicleType)
                      .map((v) => (
                        <option key={v.id} value={v.vehicle_number}>
                          {v.vehicle_number} ({v.current_location})
                        </option>
                      ))}
                    <option value={assignedVehicleType === 'bus' ? 'Bus 14' : 'Tricycle 09'}>
                      {assignedVehicleType === 'bus' ? 'Bus 14 (New assignment)' : 'Tricycle 09 (New assignment)'}
                    </option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Initial Park Assignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Campus Gate', 'SUB'] as const).map((park) => (
                    <button
                      key={park}
                      type="button"
                      onClick={() => setAssignedParkLocation(park)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        assignedParkLocation === park
                          ? 'bg-[#00A86B] text-white border-[#00A86B]'
                          : 'bg-white dark:bg-[#1E2330] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {park}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-sm text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Confirm Driver Approval & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Status Modal */}
      {selectedDriver && (
        <UpdateDriverModal
          driver={selectedDriver}
          adminName={user?.full_name || 'Park Admin'}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {/* Check In Driver Modal */}
      {isCheckInOpen && (
        <CheckInDriverModal
          currentParkName={user?.park_scope === 'SUB' ? 'SUB' : 'Campus Gate'}
          adminName={user?.full_name || 'Park Admin'}
          onClose={() => setIsCheckInOpen(false)}
        />
      )}
    </div>
  );
};
