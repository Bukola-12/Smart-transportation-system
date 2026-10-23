import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Ban, 
  History, 
  Search, 
  Phone, 
  X, 
  RefreshCw, 
  CheckCircle,
  Info
} from 'lucide-react';

export const ParkAdminDiscipline: React.FC = () => {
  const { users, warnUser, suspendUser, reactivateUser, user: currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'driver'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Suspended'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  // Warn modal state
  const [targetUserForWarning, setTargetUserForWarning] = useState<UserProfile | null>(null);
  const [warningReason, setWarningReason] = useState('');

  // Suspend modal state (CAPPED AT 30 DAYS / 1 MONTH)
  const [targetUserForSuspension, setTargetUserForSuspension] = useState<UserProfile | null>(null);
  const [suspensionDays, setSuspensionDays] = useState<number>(7);
  const [suspensionReason, setSuspensionReason] = useState('');

  // History modal state
  const [targetUserForHistory, setTargetUserForHistory] = useState<UserProfile | null>(null);

  // Park admin disciplines ONLY students and drivers
  const filteredUsers = users.filter((u) => {
    if (u.role !== 'student' && u.role !== 'driver') return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.full_name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchMatric = u.matric_number ? u.matric_number.toLowerCase().includes(q) : false;
      const matchPhone = u.phone ? u.phone.toLowerCase().includes(q) : false;
      const matchVeh = u.vehicle_assigned ? u.vehicle_assigned.toLowerCase().includes(q) : false;
      return matchName || matchEmail || matchMatric || matchPhone || matchVeh;
    }
    return true;
  });

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
      currentUser?.full_name || 'Park Admin',
      'park_admin'
    );

    setNotice(`Warning officially recorded for ${targetUserForWarning.full_name}.`);
    setTimeout(() => setNotice(null), 3500);
    setTargetUserForWarning(null);
  };

  const handleOpenSuspendModal = (u: UserProfile) => {
    setTargetUserForSuspension(u);
    setSuspensionDays(7);
    setSuspensionReason('');
  };

  const handleConfirmSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForSuspension || !suspensionReason.trim()) return;

    // Strict 30 days maximum cap enforcement for Park Admin
    const safeDays = Math.min(30, Math.max(1, suspensionDays));

    suspendUser(
      targetUserForSuspension.id,
      safeDays,
      suspensionReason.trim(),
      currentUser?.full_name || 'Park Admin',
      'park_admin'
    );

    setNotice(`Account for ${targetUserForSuspension.full_name} suspended for ${safeDays} day(s) (1 month max cap).`);
    setTimeout(() => setNotice(null), 4000);
    setTargetUserForSuspension(null);
  };

  const handleReactivate = (u: UserProfile) => {
    reactivateUser(u.id, currentUser?.full_name || 'Park Admin');
    setNotice(`Suspension lifted for ${u.full_name}. Account is now Active.`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="pb-28 pt-4 md:py-8 px-5 md:px-8 max-w-6xl xl:max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight uppercase">
            Operations Discipline
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
            Student & Driver Discipline
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Check student passengers and drivers, record warnings, and enforce temporary suspensions (max 1 month).
          </p>
        </div>

        {/* Park Admin Authority Pill */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-2xl flex items-center gap-2 self-start sm:self-auto max-w-sm">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-[11px] text-amber-900 dark:text-amber-200 font-medium">
            Park Admin suspensions are strictly capped at <strong>30 days (1 month max)</strong>.
          </span>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Directory Table Card */}
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5 transition-colors">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, driver, matric, phone..."
              className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs font-medium rounded-2xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-gray-400 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Role:</span>
            {(['all', 'student', 'driver'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-gray-100 dark:bg-[#1E2330] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}

            <span className="text-xs font-semibold text-gray-400 ml-2">Status:</span>
            {(['all', 'Active', 'Suspended'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-medium">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                <th className="pb-3.5 pt-2">User / Contact</th>
                <th className="pb-3.5 pt-2">Role & Vehicle/Matric</th>
                <th className="pb-3.5 pt-2">Status</th>
                <th className="pb-3.5 pt-2">Warnings</th>
                <th className="pb-3.5 pt-2 text-right">Park Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {filteredUsers.map((u) => {
                const warnCount = u.warnings?.length || 0;
                return (
                  <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1A1E29] transition-colors">
                    {/* User and Phone */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold text-xs uppercase shrink-0">
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

                    {/* Role & ID */}
                    <td className="py-4 whitespace-nowrap">
                      <span className="font-semibold capitalize text-gray-800 dark:text-gray-200 block text-xs">
                        {u.role}
                      </span>
                      {u.matric_number && (
                        <span className="text-[11px] text-gray-400 font-mono">Matric: {u.matric_number}</span>
                      )}
                      {u.vehicle_assigned && (
                        <span className="text-[11px] text-gray-400 block font-semibold">Vehicle: {u.vehicle_assigned}</span>
                      )}
                    </td>

                    {/* Status & Suspension Details */}
                    <td className="py-4 whitespace-nowrap">
                      <StatusBadge status={u.status} size="sm" />
                      {u.status === 'Suspended' && (
                        <div className="text-[11px] text-red-600 dark:text-red-400 mt-1 max-w-[200px] truncate" title={u.suspension_reason}>
                          {u.suspended_until ? `Until ${new Date(u.suspended_until).toLocaleDateString()}` : 'Suspended'}
                          {u.suspension_reason && `: "${u.suspension_reason}"`}
                        </div>
                      )}
                    </td>

                    {/* Warnings Badge */}
                    <td className="py-4 whitespace-nowrap">
                      {warnCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setTargetUserForHistory(u)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors cursor-pointer"
                          title="Click to view warning records"
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
                          className="px-3 py-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 font-semibold text-xs border border-amber-200 dark:border-amber-800/80 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Issue official warning"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Warn</span>
                        </button>

                        {/* Suspend (Max 30 days) */}
                        <button
                          type="button"
                          onClick={() => handleOpenSuspendModal(u)}
                          className="px-3 py-1.5 rounded-xl text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold text-xs border border-red-200 dark:border-red-800/80 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Suspend user (max 1 month)"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>

                        {/* Lift Suspension / Reactivate */}
                        {u.status === 'Suspended' && (
                          <button
                            type="button"
                            onClick={() => handleReactivate(u)}
                            className="px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-semibold text-xs border border-emerald-200 dark:border-emerald-800/80 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Lift suspension"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Lift</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs sm:text-sm">
              No students or drivers match your filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Issue Disciplinary Warning */}
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
                  Reason for Warning *
                </label>
                <textarea
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="e.g. Failure to comply with queue marshal instructions at the park."
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
                  Confirm Warning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Suspend User (Strictly Capped at 1 Month / 30 Days) */}
      {targetUserForSuspension && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-600" />
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

            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-800 dark:text-red-300">
              <span className="font-bold block mb-0.5">1-Month Ceiling Enforced:</span>
              Park Admin suspensions have a hard limit of <strong>maximum 30 days (1 month)</strong>. Suspended users are restricted from requesting charters or operating on shift.
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Suspension Duration (Max 30 Days)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { val: 1, lbl: '1 Day' },
                    { val: 3, lbl: '3 Days' },
                    { val: 7, lbl: '7 Days' },
                    { val: 14, lbl: '14 Days' },
                    { val: 30, lbl: '30 Days (Max)' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSuspensionDays(opt.val)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        suspensionDays === opt.val
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-white dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {opt.lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Custom Days (1 to 30 Days Max)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={suspensionDays}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10) || 1;
                    setSuspensionDays(Math.min(30, Math.max(1, parsed)));
                  }}
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-2xl p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Suspension Reason *
                </label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Unruly altercation at park queue or refusal to comply with campus regulations."
                  required
                  rows={2}
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-2xl p-3.5 outline-none border border-transparent focus:border-red-400"
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
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Suspend User ({suspensionDays} Days)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Warnings History */}
      {targetUserForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-500" />
                  Warning Records
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
