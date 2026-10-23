import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../Common/StatusBadge';
import { Vehicle, VehicleLocation, OperationalStatus } from '../../types';
import { Plus, Bus, Car, Search, X } from 'lucide-react';

export const CentralAdminDriversVehicles: React.FC = () => {
  const { vehicles, updateVehicleLocation, updateDriverOperationalStatus, addVehicle, addDriver } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'buses' | 'tricycles'>('all');
  const [search, setSearch] = useState('');
  
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [newVehNumber, setNewVehNumber] = useState('');
  const [newVehType, setNewVehType] = useState<'bus' | 'tricycle'>('bus');
  const [newVehLocation, setNewVehLocation] = useState<VehicleLocation>('Campus Gate');

  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState('');

  const filteredVehicles = vehicles.filter((v) => {
    if (activeTab === 'buses' && v.vehicle_type !== 'bus') return false;
    if (activeTab === 'tricycles' && v.vehicle_type !== 'tricycle') return false;
    if (search.trim()) {
      return (
        v.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
        (v.assigned_driver_name && v.assigned_driver_name.toLowerCase().includes(search.toLowerCase())) ||
        v.current_location.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehNumber.trim()) return;

    addVehicle(
      {
        vehicle_number: newVehNumber.trim(),
        vehicle_type: newVehType,
        current_location: newVehLocation,
        status: 'Available',
        updated_by: user?.full_name || 'Central Admin',
      },
      user?.full_name || 'Central Admin'
    );

    setNewVehNumber('');
    setIsAddVehicleOpen(false);
  };

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverVehicle) return;

    const veh = vehicles.find((v) => v.vehicle_number === newDriverVehicle);

    addDriver(
      {
        user_id: `user-dr-${Date.now()}`,
        name: newDriverName.trim(),
        phone: newDriverPhone.trim() || undefined,
        vehicle_assigned: newDriverVehicle,
        vehicle_type: veh?.vehicle_type || 'bus',
        shift_status: 'On duty',
        operational_status: 'Available',
        current_location: veh?.current_location || 'Campus Gate',
        updated_by: user?.full_name || 'Central Admin',
        updated_by_role: 'admin',
      },
      user?.full_name || 'Central Admin'
    );

    setNewDriverName('');
    setNewDriverPhone('');
    setIsAddDriverOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 block tracking-tight">
            Central administrator
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
            Drivers and Vehicles
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            One shared pool across Campus Gate Car Park and SUB Car Park (FR-14, FR-18)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddDriverOpen(true)}
            className="bg-white dark:bg-[#151821] hover:bg-gray-50 dark:hover:bg-[#1E2330] border border-gray-200 dark:border-[#252B3A] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Driver</span>
          </button>
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-[#EAECEF] dark:bg-[#1E2330] p-1.5 rounded-2xl w-fit transition-colors">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 dark:bg-white dark:text-black shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            All Fleet ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('buses')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'buses'
                ? 'bg-white text-gray-900 dark:bg-white dark:text-black shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Buses ({vehicles.filter((v) => v.vehicle_type === 'bus').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tricycles')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tricycles'
                ? 'bg-white text-gray-900 dark:bg-white dark:text-black shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Tricycles ({vehicles.filter((v) => v.vehicle_type === 'tricycle').length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle or driver..."
            className="w-full bg-white dark:bg-[#151821] border border-gray-200 dark:border-[#252B3A] text-gray-900 dark:text-white text-xs font-medium pl-10 pr-4 py-2.5 rounded-2xl outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Fleet Table Card */}
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-medium">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                <th className="pb-4 pt-2">Vehicle</th>
                <th className="pb-4 pt-2">Type</th>
                <th className="pb-4 pt-2">Assigned Driver</th>
                <th className="pb-4 pt-2">Location</th>
                <th className="pb-4 pt-2">Status</th>
                <th className="pb-4 pt-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1A1E29] transition-colors">
                  <td className="py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
                        {v.vehicle_type === 'bus' ? <Bus className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                      </div>
                      <span>{v.vehicle_number}</span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-600 dark:text-gray-400 capitalize whitespace-nowrap">{v.vehicle_type}</td>
                  <td className="py-4 text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">
                    {v.assigned_driver_name || 'Unassigned'}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-900 dark:text-white">{v.current_location}</span>
                    {v.current_location === 'En route' && v.en_route_destination && (
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 ml-1">→ {v.en_route_destination}</span>
                    )}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <StatusBadge status={v.status} size="sm" />
                  </td>
                  <td className="py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditingVehicle(v)}
                      className="text-xs font-bold bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#282F40] text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Vehicle Location & Status */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-[#252B3A] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Update {editingVehicle.vehicle_number}
                </h3>
                <p className="text-xs text-gray-400">
                  Driver: {editingVehicle.assigned_driver_name || 'Unassigned'}
                </p>
              </div>
              <button
                onClick={() => setEditingVehicle(null)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Change Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Move Vehicle Location (Shared Pool)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Campus Gate', 'SUB', 'En route', 'Unknown / Other'] as VehicleLocation[]).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      const dest = loc === 'En route' ? (editingVehicle.current_location === 'Campus Gate' ? 'SUB' : 'Campus Gate') : undefined;
                      updateVehicleLocation(
                        editingVehicle.id,
                        loc,
                        dest,
                        user?.full_name || 'Central Admin',
                        'Correction'
                      );
                      setEditingVehicle(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editingVehicle.current_location === loc
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-gray-100 dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-[#252B3A]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Operational Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Available', 'On trip', 'On break', 'Unconfirmed'] as OperationalStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      if (editingVehicle.assigned_driver_id) {
                        updateDriverOperationalStatus(
                          editingVehicle.assigned_driver_id,
                          st,
                          user?.full_name || 'Central Admin',
                          'Correction'
                        );
                      }
                      setEditingVehicle(null);
                    }}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#252B3A] transition-all text-center cursor-pointer"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Vehicle */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-[#252B3A]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Add New Vehicle
              </h3>
              <button
                onClick={() => setIsAddVehicleOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Vehicle Number / Identifier *
                </label>
                <input
                  type="text"
                  value={newVehNumber}
                  onChange={(e) => setNewVehNumber(e.target.value)}
                  placeholder="e.g. Bus 15 or Tricycle 08"
                  required
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['bus', 'tricycle'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewVehType(t)}
                      className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        newVehType === t ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-gray-100 dark:bg-[#1E2330] text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Initial Location
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Campus Gate', 'SUB'] as const).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setNewVehLocation(loc)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newVehLocation === loc ? 'bg-[#00A86B] text-white border-[#00A86B]' : 'bg-gray-100 dark:bg-[#1E2330] text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-sm text-xs sm:text-sm cursor-pointer"
                >
                  Create Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Driver */}
      {isAddDriverOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-[#252B3A]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Register Driver
              </h3>
              <button
                onClick={() => setIsAddDriverOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="e.g. Babatunde Lawal"
                  required
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  placeholder="e.g. 08023456789"
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Assign Vehicle *
                </label>
                <select
                  value={newDriverVehicle}
                  onChange={(e) => setNewDriverVehicle(e.target.value)}
                  required
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none"
                >
                  <option value="">-- Select a vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.vehicle_number}>
                      {v.vehicle_number} ({v.vehicle_type} at {v.current_location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-sm text-xs sm:text-sm cursor-pointer"
                >
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
