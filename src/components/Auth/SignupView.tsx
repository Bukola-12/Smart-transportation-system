import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, VehicleType } from '../../types';
import { ImageUpload } from '../Common/ImageUpload';
import { ArrowLeft, AlertCircle, Clock, ShieldCheck, CheckCircle2, User, Phone, Mail, Car } from 'lucide-react';

interface SignupViewProps {
  onBackToLogin: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onBackToLogin }) => {
  const { signup, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [parkScope, setParkScope] = useState<'Campus Gate' | 'SUB'>('Campus Gate');
  const [preferredVehicleType, setPreferredVehicleType] = useState<VehicleType>('tricycle');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pending approval screen state (for drivers & park admins)
  const [pendingRegistration, setPendingRegistration] = useState<{
    role: UserRole;
    fullName: string;
    email: string;
    phone?: string;
    parkScope?: string;
    vehicleType?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please provide a phone number for trip contact.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setErrorMessage(null);
    const result = await signup({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() ? phone.trim() : undefined,
      matricNumber: matricNumber.trim() ? matricNumber.trim() : undefined,
      role,
      parkScope: role === 'park_admin' ? parkScope : undefined,
      preferredVehicleType: role === 'driver' ? preferredVehicleType : undefined,
      password,
      avatarFile,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create account.');
      return;
    }

    // Drivers & Park Admins must wait for verification/approval
    if (result.pendingApproval) {
      setPendingRegistration({
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        parkScope: role === 'park_admin' ? parkScope : undefined,
        vehicleType: role === 'driver' ? preferredVehicleType : undefined,
      });
    }
  };

  // If driver or park admin registration is pending verification, show confirmation screen
  if (pendingRegistration) {
    const isDriver = pendingRegistration.role === 'driver';
    const isParkAdmin = pendingRegistration.role === 'park_admin';

    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white sm:rounded-3xl sm:border sm:border-gray-100 sm:shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-10 flex flex-col justify-between">
          <div className="text-center space-y-4 pt-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full inline-block">
                Pending Administrator Approval
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 pt-1">
                Registration Submitted
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm font-normal max-w-sm mx-auto">
                {isDriver && (
                  <>
                    Driver accounts must first be approved by a <strong>Park Admin</strong> or <strong>Central Admin</strong> before you can log in.
                  </>
                )}
                {isParkAdmin && (
                  <>
                    Park Admin accounts must first be verified by <strong>Central Admin</strong> before you can log in.
                  </>
                )}
              </p>
            </div>

            {/* Application Summary Box */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 text-left space-y-2.5 border border-gray-100 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                <span className="text-gray-400">Applicant</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {pendingRegistration.fullName}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                <span className="text-gray-400">Email</span>
                <span className="font-medium text-gray-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {pendingRegistration.email}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                <span className="text-gray-400">Phone</span>
                <span className="font-mono font-medium text-gray-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {pendingRegistration.phone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                <span className="text-gray-400">Requested Role</span>
                <span className="font-bold capitalize text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {pendingRegistration.role.replace('_', ' ')}
                </span>
              </div>
              {isDriver && pendingRegistration.vehicleType && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Vehicle Type</span>
                  <span className="font-bold capitalize text-gray-800 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-[#00A86B]" />
                    {pendingRegistration.vehicleType}
                  </span>
                </div>
              )}
              {isParkAdmin && pendingRegistration.parkScope && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Assigned Park</span>
                  <span className="font-bold text-gray-800">
                    {pendingRegistration.parkScope}
                  </span>
                </div>
              )}
            </div>

            {/* Note & Policy */}
            <div className="bg-blue-50 text-blue-900 rounded-2xl p-3.5 text-left text-xs border border-blue-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">CampusGo Security Policy</p>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  Only student accounts are immediately active. Drivers and administrators undergo verification to confirm campus credentials and allocate vehicle assignments.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full bg-[#121212] hover:bg-black text-white font-semibold py-3.5 rounded-2xl shadow-sm text-sm transition-all cursor-pointer"
            >
              Return to Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingRegistration(null);
                setRole('student');
              }}
              className="w-full text-center text-xs text-gray-500 hover:text-black py-2 cursor-pointer font-medium"
            >
              Register another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white sm:rounded-3xl sm:border sm:border-gray-100 sm:shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-10 flex flex-col justify-between min-h-screen sm:min-h-0">
        <div>
          <div className="pt-2 pb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToLogin}
              className="p-2 -ml-2 text-gray-700 hover:text-black rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-[#00A86B] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Create account
            </h1>
            <p className="text-gray-500 text-sm font-normal">
              Join CampusGo for campus transportation.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Photo Upload */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Profile Photo (Optional)
              </label>
              <ImageUpload
                fallbackInitials={fullName ? fullName.slice(0, 2).toUpperCase() : 'U'}
                onUpload={async (file) => {
                  setAvatarFile(file);
                }}
                label="Select Photo"
                size="md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adaeze Nwosu"
                required
                className="w-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-gray-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="w-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-gray-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                required
                className="w-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-gray-400 focus:bg-white transition-all"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Required for direct phone calling between drivers and students during trips.
              </span>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Role *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'driver', 'park_admin'] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                      role === r
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Role-Specific Notices & Information */}
            {role === 'student' && (
              <div className="bg-[#EBF7EE] text-[#1B4332] rounded-2xl p-3 border border-[#D8F3DC] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                <span>Student accounts are created and activated immediately.</span>
              </div>
            )}

            {role === 'driver' && (
              <div className="space-y-3">
                <div className="bg-amber-50 text-amber-900 rounded-2xl p-3 border border-amber-200 text-xs flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Driver Approval Required:</strong> Your account must first be approved and assigned a vehicle by a Park Admin or Central Admin before login.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Vehicle Type Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['tricycle', 'bus'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setPreferredVehicleType(type)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                          preferredVehicleType === type
                            ? 'bg-[#00A86B] text-white border-[#00A86B]'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {role === 'park_admin' && (
              <div className="space-y-3">
                <div className="bg-amber-50 text-amber-900 rounded-2xl p-3 border border-amber-200 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Verification Required:</strong> Park Admin accounts must first be verified by Central Admin before you can log in.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Assigned Park Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Campus Gate', 'SUB'] as const).map((park) => (
                      <button
                        type="button"
                        key={park}
                        onClick={() => setParkScope(park)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          parkScope === park
                            ? 'bg-[#00A86B] text-white border-[#00A86B]'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {park}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {role === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Matric Number (Optional)
                </label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="e.g. CSC/2021/042"
                  className="w-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-gray-400 focus:bg-white transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full bg-[#F3F4F6] text-gray-900 text-sm font-medium rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-gray-400 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Confirm *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full bg-[#F3F4F6] text-gray-900 text-sm font-medium rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-gray-400 focus:bg-white"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="pt-6 pb-2 space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#121212] hover:bg-black text-white font-semibold py-4 rounded-2xl shadow-sm text-sm sm:text-base transition-all active:scale-[0.99] cursor-pointer"
          >
            {isLoading 
              ? 'Creating account...' 
              : role === 'student' 
              ? 'Create student account' 
              : role === 'driver'
              ? 'Submit driver registration'
              : 'Submit park admin registration'}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full text-center text-gray-500 hover:text-black text-xs sm:text-sm font-medium py-2 cursor-pointer"
          >
            Already have an account? <span className="font-semibold text-[#00A86B]">Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
};
