import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { UserProfile, AdminPermissions, VehicleType, VehicleLocation } from '../../types';
import { 
  Plus, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  X, 
  Phone, 
  Mail, 
  Car, 
  Check,
  AlertTriangle,
  Trash2,
  Ban,
  History,
  ShieldAlert,
  Search,
  UserX,
  RefreshCw
} from 'lucide-react';
import { StatusBadge } from '../Common/StatusBadge';

interface CentralAdminAccountsProps {
  onOpenAddAdmin: () => void;
}

export const CentralAdminAccounts: React.FC<CentralAdminAccountsProps> = ({ onOpenAddAdmin }) => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { 
    users, 
    updateUserPermissions, 
    approveParkAdminAccount, 
    approveDriverAccount, 
    rejectAccountRegistration,
    warnUser,
    suspendUser,
    reactivateUser,
    deactivateUser,
    deleteUser,
    user: currentUser 
  } = useAuth();
  const { vehicles, approveAndEnrollDriver } = useApp();

  const [activeTab, setActiveTab] = useState<'park_admins' | 'pending_admins' | 'pending_drivers' | 'discipline'>('park_admins');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Active or Suspended Park Admins
  const existingParkAdmins = users.filter(
    (u) => u.role === 'park_admin' && u.status !== 'Pending approval'
  );

  // Pending Park Admin accounts awaiting Central Admin verification
  const pendingParkAdmins = users.filter(
    (u) => u.role === 'park_admin' && u.status === 'Pending approval'
  );

  // Pending Driver accounts awaiting Central or Park Admin approval
  const pendingDrivers = users.filter(
    (u) => u.role === 'driver' && u.status === 'Pending approval'
  );

  // Selected Admin for editing existing permissions
  const [selectedAdminId, setSelectedAdminId] = useState<string>(
    existingParkAdmins[0]?.id || ''
  );
  const selectedAdmin = existingParkAdmins.find((u) => u.id === selectedAdminId) || existingParkAdmins[0];

  const [permissions, setPermissions] = useState<AdminPermissions>({
    update_driver_status: selectedAdmin?.permissions?.update_driver_status ?? true,
    record_vehicle_location: selectedAdmin?.permissions?.record_vehicle_location ?? true,
    accept_charters_on_behalf: selectedAdmin?.permissions?.accept_charters_on_behalf ?? true,
    correct_records: selectedAdmin?.permissions?.correct_records ?? true,
    manage_bookings_other_parks: selectedAdmin?.permissions?.manage_bookings_other_parks ?? false,
  });

  const [parkScope, setParkScope] = useState<'Campus Gate' | 'SUB'>(
    (selectedAdmin?.park_scope as 'Campus Gate' | 'SUB') || 'Campus Gate'
  );

  const [status, setStatus] = useState<'Active' | 'Suspended'>(
    selectedAdmin?.status === 'Suspended' ? 'Suspended' : 'Active'
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  // State for verifying a pending Park Admin
  const [verifyingAdmin, setVerifyingAdmin] = useState<UserProfile | null>(null);
  const [verifyingScope, setVerifyingScope] = useState<'Campus Gate' | 'SUB'>('Campus Gate');
  const [verifyingPermissions, setVerifyingPermissions] = useState<AdminPermissions>({
    update_driver_status: true,
    record_vehicle_location: true,
    accept_charters_on_behalf: true,
    correct_records: true,
    manage_bookings_other_parks: false,
  });

  // State for approving a pending Driver
  const [approvingDriver, setApprovingDriver] = useState<UserProfile | null>(null);
  const [driverVehicleNumber, setDriverVehicleNumber] = useState('');
  const [driverVehicleType, setDriverVehicleType] = useState<VehicleType>('tricycle');
  const [driverParkLocation, setDriverParkLocation] = useState<VehicleLocation>('Campus Gate');

  // Disciplinary tab state
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const [disciplineRoleFilter, setDisciplineRoleFilter] = useState<'all' | 'student' | 'driver' | 'park_admin'>('all');
  const [disciplineStatusFilter, setDisciplineStatusFilter] = useState<'all' | 'Active' | 'Suspended' | 'Deactivated'>('all');

  // Warning Modal State
  const [targetUserForWarning, setTargetUserForWarning] = useState<UserProfile | null>(null);
  const [warningReason, setWarningReason] = useState('');

  // Suspension Modal State (No ceiling for Central Admin!)
  const [targetUserForSuspension, setTargetUserForSuspension] = useState<UserProfile | null>(null);
  const [suspensionDurationOption, setSuspensionDurationOption] = useState<
    '1' | '3' | '7' | '14' | '30' | '60' | '90' | '180' | '365' | 'custom' | 'indefinite'
  >('30');
  const [customSuspensionDays, setCustomSuspensionDays] = useState<number>(45);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Warnings History Modal State
  const [targetUserForHistory, setTargetUserForHistory] = useState<UserProfile | null>(null);

  const handleSelectUser = (u: UserProfile) => {
    setSelectedAdminId(u.id);
    setPermissions({
      update_driver_status: u.permissions?.update_driver_status ?? true,
      record_vehicle_location: u.permissions?.record_vehicle_location ?? true,
      accept_charters_on_behalf: u.permissions?.accept_charters_on_behalf ?? true,
      correct_records: u.permissions?.correct_records ?? true,
      manage_bookings_other_parks: u.permissions?.manage_bookings_other_parks ?? false,
    });
    setParkScope((u.park_scope as 'Campus Gate' | 'SUB') || 'Campus Gate');
    setStatus(u.status === 'Suspended' ? 'Suspended' : 'Active');
    setSaveSuccess(false);
  };

  const handleToggle = (key: keyof AdminPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (!selectedAdmin) return;
    updateUserPermissions(selectedAdmin.id, {
      permissions,
      park_scope: parkScope,
      status,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Open modal to verify a Park Admin
  const handleOpenVerifyModal = (adminUser: UserProfile) => {
    setVerifyingAdmin(adminUser);
    setVerifyingScope((adminUser.park_scope as 'Campus Gate' | 'SUB') || 'Campus Gate');
    setVerifyingPermissions({
      update_driver_status: true,
      record_vehicle_location: true,
      accept_charters_on_behalf: true,
      correct_records: true,
      manage_bookings_other_parks: false,
    });
  };

  // Confirm Park Admin Verification
  const handleConfirmVerifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingAdmin) return;

    approveParkAdminAccount(
      verifyingAdmin.id,
      verifyingScope,
      verifyingPermissions,
      currentUser?.full_name || 'Central Admin'
    );

    setSuccessNotice(`Park Administrator ${verifyingAdmin.full_name} has been verified and activated for ${verifyingScope}!`);
    setTimeout(() => setSuccessNotice(null), 4000);
    setVerifyingAdmin(null);
  };

  // Open modal to approve a Driver
  const handleOpenApproveDriverModal = (driverUser: UserProfile) => {
    setApprovingDriver(driverUser);
    const pref = driverUser.preferred_vehicle_type || 'tricycle';
    setDriverVehicleType(pref);
    const existingVeh = vehicles.find((v) => v.vehicle_type === pref && !v.assigned_driver_name);
    setDriverVehicleNumber(existingVeh ? existingVeh.vehicle_number : pref === 'bus' ? 'Bus 12' : 'Tricycle 08');
    setDriverParkLocation('Campus Gate');
  };

  // Confirm Driver Approval
  const handleConfirmApproveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingDriver || !driverVehicleNumber.trim()) return;

    const actor = currentUser?.full_name || 'Central Admin';
    const vehNumber = driverVehicleNumber.trim();

    approveDriverAccount(approvingDriver.id, vehNumber, driverParkLocation as 'Campus Gate' | 'SUB', actor);
    approveAndEnrollDriver(approvingDriver, vehNumber, driverVehicleType, driverParkLocation, actor);

    setSuccessNotice(`Driver ${approvingDriver.full_name} has been approved and enrolled with ${vehNumber}!`);
    setTimeout(() => setSuccessNotice(null), 4000);
    setApprovingDriver(null);
  };

  const handleReject = async (userId: string, name: string) => {
    const ok = await confirm({
      title: 'Decline Account Registration',
      message: `Are you sure you want to decline the account registration for ${name}?\n\nThis will mark the registration application as rejected.`,
      confirmText: 'Decline Application',
      cancelText: 'Keep Application',
      variant: 'danger',
      implicationText: `Registration application for ${name} was declined.`,
      cancelImplicationText: 'Decline action cancelled. Registration remains in review.',
    });

    if (ok) {
      rejectAccountRegistration(userId, currentUser?.full_name || 'Central Admin');
      setSuccessNotice(`Registration for ${name} was declined.`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  // Disciplinary Handlers (Central Admin exclusive authority)
  const handleOpenWarnModal = (u: UserProfile) => {
    setTargetUserForWarning(u);
    setWarningReason('');
  };

  const handleConfirmWarn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForWarning || !warningReason.trim()) return;

    warnUser(
      targetUserForWarning.id,
      warningReason.trim(),
      currentUser?.full_name || 'Central Admin',
      'central_admin'
    );

    setSuccessNotice(`Disciplinary warning issued to ${targetUserForWarning.full_name}.`);
    setTimeout(() => setSuccessNotice(null), 3500);
    setTargetUserForWarning(null);
  };

  const handleOpenSuspendModal = (u: UserProfile) => {
    setTargetUserForSuspension(u);
    setSuspensionDurationOption('30');
    setCustomSuspensionDays(45);
    setSuspensionReason('');
  };

  const handleConfirmSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForSuspension || !suspensionReason.trim()) return;

    let days: number | null = null;
    if (suspensionDurationOption === 'indefinite') {
      days = null;
    } else if (suspensionDurationOption === 'custom') {
      days = Math.max(1, customSuspensionDays);
    } else {
      days = parseInt(suspensionDurationOption, 10);
    }

    suspendUser(
      targetUserForSuspension.id,
      days,
      suspensionReason.trim(),
      currentUser?.full_name || 'Central Admin',
      'central_admin'
    );

    const durText = days ? `${days} day(s)` : 'indefinitely';
    setSuccessNotice(`Account for ${targetUserForSuspension.full_name} suspended (${durText}).`);
    setTimeout(() => setSuccessNotice(null), 4000);
    setTargetUserForSuspension(null);
  };

  const handleDeactivate = async (u: UserProfile) => {
    const ok = await confirm({
      title: 'Deactivate Account Indefinitely',
      message: `Deactivate account for ${u.full_name} (${u.role.toUpperCase()}) indefinitely?\n\nThey will be unable to log in until you reactivate their account.`,
      confirmText: 'Deactivate Account',
      cancelText: 'Cancel',
      variant: 'danger',
      implicationText: `Account for ${u.full_name} has been deactivated.`,
      cancelImplicationText: 'Deactivation cancelled. Account remains active.',
    });

    if (ok) {
      deactivateUser(u.id, currentUser?.full_name || 'Central Admin');
      setSuccessNotice(`Account for ${u.full_name} has been deactivated.`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleReactivate = (u: UserProfile) => {
    reactivateUser(u.id, currentUser?.full_name || 'Central Admin');
    setSuccessNotice(`Account for ${u.full_name} has been reactivated to Active.`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleDeleteUser = async (u: UserProfile) => {
    const ok = await confirm({
      title: 'PERMANENTLY DELETE ACCOUNT',
      message: `PERMANENTLY DELETE account for ${u.full_name} (${u.role.toUpperCase()})?\n\nThis will completely erase the user record from the system. Only Central Admin has the authority to delete accounts. This action CANNOT be undone.`,
      confirmText: 'Permanently Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      implicationText: `Account for ${u.full_name} has been permanently deleted from the database.`,
      cancelImplicationText: 'Deletion cancelled. User account is safe.',
    });

    if (ok) {
      const res = deleteUser(u.id, currentUser?.full_name || 'Central Admin');
      if (res.success) {
        setSuccessNotice(`Account for ${u.full_name} was permanently removed.`);
        toast.success(`Account for ${u.full_name} was permanently deleted.`);
      } else {
        toast.error(res.error || 'Failed to delete user.');
      }
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const disciplineUsers = users.filter((u) => {
    if (u.role === 'central_admin') return false;
    if (disciplineRoleFilter !== 'all' && u.role !== disciplineRoleFilter) return false;
    if (disciplineStatusFilter !== 'all' && u.status !== disciplineStatusFilter) return false;
    if (disciplineSearch.trim()) {
      const q = disciplineSearch.toLowerCase();
      const matchName = u.full_name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchMatric = u.matric_number ? u.matric_number.toLowerCase().includes(q) : false;
      const matchPhone = u.phone ? u.phone.toLowerCase().includes(q) : false;
      const matchVeh = u.vehicle_assigned ? u.vehicle_assigned.toLowerCase().includes(q) : false;
      return matchName || matchEmail || matchMatric || matchPhone || matchVeh;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Row (Matches Page 9 Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight">
            Central administrator
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
            Admin accounts & Approvals
          </h1>
        </div>

        <button
          onClick={onOpenAddAdmin}
          className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add park admin</span>
        </button>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-[#EAECEF] dark:bg-[#1E2330] p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('park_admins')}
          className={`py-2 px-4 sm:px-5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'park_admins'
              ? 'bg-white text-gray-900 dark:bg-[#252B3A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Park Administrators ({existingParkAdmins.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending_admins')}
          className={`py-2 px-4 sm:px-5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pending_admins'
              ? 'bg-white text-gray-900 dark:bg-[#252B3A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Verify Park Admins</span>
          {pendingParkAdmins.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {pendingParkAdmins.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending_drivers')}
          className={`py-2 px-4 sm:px-5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pending_drivers'
              ? 'bg-white text-gray-900 dark:bg-[#252B3A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Approve Drivers</span>
          {pendingDrivers.length > 0 && (
            <span className="bg-blue-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {pendingDrivers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discipline')}
          className={`py-2 px-4 sm:px-5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'discipline'
              ? 'bg-white text-gray-900 dark:bg-[#252B3A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
          <span>Discipline & Actions</span>
        </button>
      </div>

      {/* TAB 1: EXISTING PARK ADMINISTRATORS (Page 9 Mockup) */}
      {activeTab === 'park_admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Table (2 Cols Wide) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#151821] rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left text-xs sm:text-sm font-medium min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                    <th className="pb-4 pt-2">Name</th>
                    <th className="pb-4 pt-2">Role</th>
                    <th className="pb-4 pt-2">Park scope</th>
                    <th className="pb-4 pt-2">Status</th>
                    <th className="pb-4 pt-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {existingParkAdmins.map((admin) => {
                    const isSelected = selectedAdmin?.id === admin.id;
                    return (
                      <tr
                        key={admin.id}
                        className={`hover:bg-gray-50/60 dark:hover:bg-[#1A1E29] transition-colors ${
                          isSelected ? 'bg-gray-50/80 dark:bg-[#1A1E29]/80' : ''
                        }`}
                      >
                        <td className="py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{admin.full_name}</div>
                          <div className="text-xs text-gray-400 font-normal">
                            {admin.email} {admin.phone ? `• ${admin.phone}` : ''}
                          </div>
                        </td>
                        <td className="py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">Park administrator</td>
                        <td className="py-4 text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">
                          {admin.park_scope || 'Campus Gate'}
                        </td>
                        <td className="py-4 whitespace-nowrap">
                          <StatusBadge status={admin.status} size="sm" />
                        </td>
                        <td className="py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleSelectUser(admin)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                                : 'bg-gray-100 dark:bg-[#202533] hover:bg-gray-200 dark:hover:bg-[#2A3142] text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Permissions Editor (Matches Page 9 Screenshot) */}
          {selectedAdmin ? (
            <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 transition-colors">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {selectedAdmin.full_name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Park administrator permissions</p>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00A86B]" />
                  <span>Permissions successfully updated!</span>
                </div>
              )}

              {/* Park Scope Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Park Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Campus Gate', 'SUB'] as const).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => {
                        setParkScope(scope);
                        setSaveSuccess(false);
                      }}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        parkScope === scope
                          ? 'bg-[#121212] text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                          : 'bg-[#F8F9FA] dark:bg-[#1A1E29] text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Radio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Account Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Active', 'Suspended'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatus(st);
                        setSaveSuccess(false);
                      }}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        status === st
                          ? st === 'Active'
                            ? 'bg-[#00A86B] text-white border-transparent'
                            : 'bg-red-500 text-white border-transparent'
                          : 'bg-[#F8F9FA] dark:bg-[#1A1E29] text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes List (Matches Page 9 Screenshot) */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Operational Permissions
                </label>

                {[
                  { key: 'update_driver_status', label: 'Update driver status' },
                  { key: 'record_vehicle_location', label: 'Record vehicle location' },
                  { key: 'accept_charters_on_behalf', label: 'Accept charters on behalf of driver' },
                  { key: 'correct_records', label: 'Correct records' },
                  { key: 'manage_bookings_other_parks', label: 'Manage bookings for other parks' },
                ].map((item) => {
                  const isChecked = permissions[item.key as keyof AdminPermissions];
                  return (
                    <label
                      key={item.key}
                      onClick={() => handleToggle(item.key as keyof AdminPermissions)}
                      className="flex items-center gap-3 cursor-pointer select-none group"
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-[#00A86B] border-[#00A86B] text-white'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-[13px] font-medium text-gray-800 dark:text-gray-200">
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-3.5 rounded-2xl shadow-sm text-xs sm:text-sm transition-all active:scale-[0.99] cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#151821] rounded-3xl p-8 border border-gray-100 dark:border-[#252B3A] text-center text-gray-400">
              Select an administrator to configure permissions.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING PARK ADMIN APPLICATIONS AWAITING CENTRAL ADMIN VERIFICATION */}
      {activeTab === 'pending_admins' && (
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Pending Park Admin Applications
              </h2>
              <p className="text-xs text-gray-400">
                Central Admin must verify credentials and configure permissions before Park Admins can log in.
              </p>
            </div>
          </div>

          {pendingParkAdmins.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs sm:text-sm">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No park admin applications are currently pending verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {pendingParkAdmins.map((applicant) => (
                <div
                  key={applicant.id}
                  className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-[#1A1E29] border border-gray-100 dark:border-gray-800 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
                        Park Admin Applicant
                      </span>
                      <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                        {applicant.full_name}
                      </h4>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{applicant.email}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                      Requested: {applicant.park_scope || 'Campus Gate'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                        {applicant.phone || 'No phone provided'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-50 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => handleReject(applicant.id, applicant.full_name)}
                      className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenVerifyModal(applicant)}
                      className="px-5 py-2.5 text-xs font-bold bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      Verify & Activate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PENDING DRIVER APPLICATIONS */}
      {activeTab === 'pending_drivers' && (
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Pending Driver Registrations
              </h2>
              <p className="text-xs text-gray-400">
                Review driver applicants and enroll them into active vehicle shifts.
              </p>
            </div>
          </div>

          {pendingDrivers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs sm:text-sm">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">All drivers approved!</p>
              <p className="text-xs text-gray-400 mt-1">There are no pending driver accounts awaiting verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {pendingDrivers.map((applicant) => (
                <div
                  key={applicant.id}
                  className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-[#1A1E29] border border-gray-100 dark:border-gray-800 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-0.5">
                        Driver Applicant
                      </span>
                      <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                        {applicant.full_name}
                      </h4>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{applicant.email}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 capitalize">
                      Prefers {applicant.preferred_vehicle_type || 'tricycle'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                        {applicant.phone || 'No phone provided'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-50 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => handleReject(applicant.id, applicant.full_name)}
                      className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenApproveDriverModal(applicant)}
                      className="px-5 py-2.5 text-xs font-bold bg-[#00A86B] hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      Approve & Enroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENTS & DRIVERS DISCIPLINARY MANAGEMENT (CENTRAL ADMIN NO-CEILING) */}
      {activeTab === 'discipline' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-600" />
                  Students & Drivers Disciplinary Management
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Check user profiles, issue warnings, impose suspensions (no duration ceiling), deactivate, or permanently delete accounts.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={disciplineSearch}
                  onChange={(e) => setDisciplineSearch(e.target.value)}
                  placeholder="Search name, phone, matric..."
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs font-medium rounded-2xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                <span className="text-xs font-semibold text-gray-400 shrink-0">Role:</span>
                {(['all', 'student', 'driver', 'park_admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDisciplineRoleFilter(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      disciplineRoleFilter === r
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-[#1E2330] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {r === 'all' ? 'All Roles' : r === 'park_admin' ? 'Park Admins' : `${r}s`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                <span className="text-xs font-semibold text-gray-400 shrink-0">Status:</span>
                {(['all', 'Active', 'Suspended', 'Deactivated'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDisciplineStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      disciplineStatusFilter === s
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {s === 'all' ? 'All Status' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left text-xs sm:text-sm font-medium min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                    <th className="pb-3.5 pt-2">User / Contact</th>
                    <th className="pb-3.5 pt-2">Role / Identity</th>
                    <th className="pb-3.5 pt-2">Status</th>
                    <th className="pb-3.5 pt-2">Warnings</th>
                    <th className="pb-3.5 pt-2 text-right">Central Admin Disciplinary Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {disciplineUsers.map((u) => {
                    const warnCount = u.warnings?.length || 0;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1A1E29] transition-colors">
                        {/* Name and Phone */}
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {u.full_name.substring(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white block">{u.full_name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-400">{u.email}</span>
                                {u.phone && (
                                  <a
                                    href={`tel:${u.phone}`}
                                    className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                                    title="Call user directly"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {u.phone}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Details */}
                        <td className="py-4 whitespace-nowrap">
                          <span className="font-semibold capitalize text-gray-800 dark:text-gray-200 block text-xs">
                            {u.role.replace('_', ' ')}
                          </span>
                          {u.matric_number && (
                            <span className="text-[11px] text-gray-400 font-mono">Matric: {u.matric_number}</span>
                          )}
                          {u.vehicle_assigned && (
                            <span className="text-[11px] text-gray-400 block font-semibold">Vehicle: {u.vehicle_assigned}</span>
                          )}
                        </td>

                        {/* Status & Suspension details */}
                        <td className="py-4 whitespace-nowrap">
                          <StatusBadge status={u.status} size="sm" />
                          {u.status === 'Suspended' && (
                            <div className="text-[11px] text-red-600 dark:text-red-400 mt-1 max-w-[200px] truncate" title={u.suspension_reason}>
                              {u.suspended_until ? `Until ${new Date(u.suspended_until).toLocaleDateString()}` : 'Indefinite'}
                              {u.suspension_reason && `: "${u.suspension_reason}"`}
                            </div>
                          )}
                        </td>

                        {/* Warnings */}
                        <td className="py-4 whitespace-nowrap">
                          {warnCount > 0 ? (
                            <button
                              type="button"
                              onClick={() => setTargetUserForHistory(u)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors cursor-pointer"
                              title="Click to view warning history"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{warnCount} Warning{warnCount > 1 ? 's' : ''}</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Clean record</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Warn */}
                            <button
                              type="button"
                              onClick={() => handleOpenWarnModal(u)}
                              className="p-2 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 font-semibold text-xs border border-amber-200 dark:border-amber-800/80 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Issue warning"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Warn</span>
                            </button>

                            {/* Suspend (No ceiling) */}
                            <button
                              type="button"
                              onClick={() => handleOpenSuspendModal(u)}
                              className="p-2 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 font-semibold text-xs border border-purple-200 dark:border-purple-800/80 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Suspend user without duration ceiling"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Suspend</span>
                            </button>

                            {/* Reactivate (if suspended or deactivated) */}
                            {u.status !== 'Active' ? (
                              <button
                                type="button"
                                onClick={() => handleReactivate(u)}
                                className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-semibold text-xs border border-emerald-200 dark:border-emerald-800/80 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Reactivate user"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Reactivate</span>
                              </button>
                            ) : (
                              /* Deactivate */
                              <button
                                type="button"
                                onClick={() => handleDeactivate(u)}
                                className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-xs border border-gray-200 dark:border-gray-700 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Deactivate account indefinitely"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Deactivate</span>
                              </button>
                            )}

                            {/* Permanently Delete (Central Admin Exclusive) */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold text-xs border border-red-200 dark:border-red-900 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Permanently delete account (Central Admin only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {disciplineUsers.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-xs sm:text-sm">
                  No users matched the selected filter and search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Verify & Activate Park Admin (Central Admin Exclusive) */}
      {verifyingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Verify Park Admin
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Confirm credentials, park scope & permissions
                </p>
              </div>
              <button
                onClick={() => setVerifyingAdmin(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmVerifyAdmin} className="space-y-4">
              <div className="p-3.5 bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl text-xs space-y-1">
                <span className="text-gray-400">Applicant:</span>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{verifyingAdmin.full_name}</p>
                <p className="text-gray-500 font-mono">{verifyingAdmin.email} · {verifyingAdmin.phone}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Assigned Park Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Campus Gate', 'SUB'] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setVerifyingScope(sc)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        verifyingScope === sc
                          ? 'bg-[#121212] text-white dark:bg-white dark:text-black border-transparent'
                          : 'bg-white dark:bg-[#1E2330] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Grant Permissions
                </label>
                {[
                  { key: 'update_driver_status', label: 'Update driver status' },
                  { key: 'record_vehicle_location', label: 'Record vehicle location' },
                  { key: 'accept_charters_on_behalf', label: 'Accept charters on behalf' },
                  { key: 'correct_records', label: 'Correct records' },
                ].map((item) => {
                  const isChecked = verifyingPermissions[item.key as keyof AdminPermissions];
                  return (
                    <label
                      key={item.key}
                      onClick={() =>
                        setVerifyingPermissions((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof AdminPermissions],
                        }))
                      }
                      className="flex items-center gap-2.5 text-xs text-gray-800 dark:text-gray-200 cursor-pointer"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-[#00A86B] border-[#00A86B] text-white' : 'border-gray-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-sm text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Verify & Activate Park Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Approve & Enroll Driver */}
      {approvingDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Approve Driver
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assign vehicle number & initialize park shift
                </p>
              </div>
              <button
                onClick={() => setApprovingDriver(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApproveDriver} className="space-y-4">
              <div className="p-3.5 bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl text-xs space-y-1">
                <span className="text-gray-400">Driver Applicant:</span>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{approvingDriver.full_name}</p>
                <p className="text-gray-500 font-mono">{approvingDriver.email} · {approvingDriver.phone}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['tricycle', 'bus'] as VehicleType[]).map((vt) => (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setDriverVehicleType(vt)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        driverVehicleType === vt
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
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Assign Vehicle Number *
                </label>
                <input
                  type="text"
                  value={driverVehicleNumber}
                  onChange={(e) => setDriverVehicleNumber(e.target.value)}
                  placeholder="e.g. Bus 12 or Tricycle 08"
                  required
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-2xl px-4 py-3 outline-none"
                />
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
                      onClick={() => setDriverParkLocation(park)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        driverParkLocation === park
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
                  Approve Driver & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Issue Disciplinary Warning */}
      {targetUserForWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Issue Warning
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Target: {targetUserForWarning.full_name} ({targetUserForWarning.role})
                </p>
              </div>
              <button
                onClick={() => setTargetUserForWarning(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmWarn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Warning Reason *
                </label>
                <textarea
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="e.g. Failure to comply with campus passenger queue guidelines at SUB."
                  required
                  rows={3}
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-2xl p-3.5 outline-none border border-transparent focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetUserForWarning(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#282F40] text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Record Warning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Suspend User (Central Admin - No Ceiling) */}
      {targetUserForSuspension && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Ban className="w-5 h-5 text-purple-600" />
                  Suspend User Account
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Target: {targetUserForSuspension.full_name} ({targetUserForSuspension.role})
                </p>
              </div>
              <button
                onClick={() => setTargetUserForSuspension(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-purple-800 dark:text-purple-300">
              <span className="font-bold block mb-0.5">Central Admin Authority:</span>
              Unlike Park Admins who are strictly capped at 1 month (30 days), Central Admin has <strong>no duration ceiling</strong> and can impose long-term or indefinite suspensions.
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Suspension Duration
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { val: '1', lbl: '1 Day' },
                    { val: '3', lbl: '3 Days' },
                    { val: '7', lbl: '7 Days' },
                    { val: '14', lbl: '14 Days' },
                    { val: '30', lbl: '1 Month' },
                    { val: '60', lbl: '2 Months' },
                    { val: '90', lbl: '3 Months' },
                    { val: '180', lbl: '6 Months' },
                    { val: '365', lbl: '1 Year' },
                    { val: 'custom', lbl: 'Custom' },
                    { val: 'indefinite', lbl: 'Indefinite' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSuspensionDurationOption(opt.val as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        suspensionDurationOption === opt.val
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {opt.lbl}
                    </button>
                  ))}
                </div>
              </div>

              {suspensionDurationOption === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Custom Duration in Days (No Ceiling)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={customSuspensionDays}
                    onChange={(e) => setCustomSuspensionDays(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-2xl p-3 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Suspension Reason *
                </label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Repeated violation of campus transportation charter regulations."
                  required
                  rows={2}
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-2xl p-3.5 outline-none border border-transparent focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetUserForSuspension(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#282F40] text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Apply Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: View Warnings History */}
      {targetUserForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-500" />
                  Disciplinary History
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Warnings issued to {targetUserForHistory.full_name}
                </p>
              </div>
              <button
                onClick={() => setTargetUserForHistory(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {targetUserForHistory.warnings && targetUserForHistory.warnings.length > 0 ? (
                targetUserForHistory.warnings.map((w, idx) => (
                  <div key={w.id || idx} className="p-3.5 bg-[#F8F9FA] dark:bg-[#1A1E29] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-gray-400">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        Issued by: {w.issued_by} ({w.issued_by_role === 'park_admin' ? 'Park Admin' : 'Central Admin'})
                      </span>
                      <span>{w.date}</span>
                    </div>
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">"{w.reason}"</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No warnings on record.</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setTargetUserForHistory(null)}
              className="w-full py-3 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#252B3A] text-gray-800 dark:text-gray-200 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
