import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { UserRole, VehicleType } from '../../types';
import { ImageUpload } from '../Common/ImageUpload';
import { Logo } from '../Common/Logo';
import { ArrowLeft, AlertCircle, Clock, ShieldCheck, User, Phone, Mail, Car, Sun, Moon } from 'lucide-react';

interface SignupViewProps {
  onBackToLogin: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onBackToLogin }) => {
  const { signup, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
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

    if (role === 'student') {
      toast.success('Account created! Welcome to CampusGo.');
    } else {
      toast.info('Registration submitted for administrator approval.');
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
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D1017] flex flex-col justify-center items-center p-4 sm:p-8 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#151821] sm:rounded-3xl sm:border border-gray-100 dark:border-[#252B3A] sm:shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-10 flex flex-col justify-between transition-colors">
          <div className="text-center space-y-4 pt-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/50 px-3 py-1 rounded-full inline-block">
                Pending Administrator Approval
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white pt-1">
                Registration Submitted
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-normal max-w-sm mx-auto">
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
            <div className="bg-[#F8F9FA] dark:bg-[#1E2330] rounded-2xl p-4 text-left space-y-2.5 border border-gray-100 dark:border-gray-800 text-xs transition-colors">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-700">
                <span className="text-gray-400 dark:text-gray-500">Applicant</span>
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {pendingRegistration.fullName}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-700">
                <span className="text-gray-400 dark:text-gray-500">Email</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {pendingRegistration.email}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-700">
                <span className="text-gray-400 dark:text-gray-500">Phone</span>
                <span className="font-mono font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {pendingRegistration.phone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-700">
                <span className="text-gray-400 dark:text-gray-500">Requested Role</span>
                <span className="font-bold capitalize text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md">
                  {pendingRegistration.role.replace('_', ' ')}
                </span>
              </div>
              {isDriver && pendingRegistration.vehicleType && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-gray-500">Vehicle Type</span>
                  <span className="font-bold capitalize text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-[#00C269]" />
                    {pendingRegistration.vehicleType}
                  </span>
                </div>
              )}
              {isParkAdmin && pendingRegistration.parkScope && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-gray-500">Assigned Park</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {pendingRegistration.parkScope}
                  </span>
                </div>
              )}
            </div>

            {/* Note & Policy */}
            <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 rounded-2xl p-3.5 text-left text-xs border border-blue-100 dark:border-blue-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">CampusGo Safety Policy</p>
                <p className="text-blue-800 dark:text-blue-200 text-[11px] leading-relaxed">
                  Only student accounts are immediately active. Drivers and administrators undergo verification to confirm campus credentials and allocate vehicle assignments.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.99] text-white font-black py-3.5 rounded-2xl shadow-md shadow-emerald-500/25 text-sm transition-all cursor-pointer"
            >
              Return to Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingRegistration(null);
                setRole('student');
              }}
              className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white py-2 cursor-pointer font-medium"
            >
              Register another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D1017] flex flex-col justify-center items-center p-4 sm:p-8 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#151821] sm:rounded-3xl sm:border border-gray-100 dark:border-[#252B3A] sm:shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-10 flex flex-col justify-between min-h-screen sm:min-h-0 transition-colors">
        <div>
          <div className="pt-2 pb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToLogin}
              className="p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-2xl hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
              title="Back to login"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Logo size="md" />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-[#1E2330] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#252B3A] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
            </button>
          </div>

          <div className="space-y-1 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Create account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">
              Join CampusGo for campus transportation.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5 border border-red-100 dark:border-red-900">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Photo Upload */}
            <div className="p-3 bg-gray-50 dark:bg-[#1E2330] rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
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
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adaeze Nwosu"
                required
                className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                required
                className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
              />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                Required for direct phone calling between drivers and students during trips.
              </span>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
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
                        ? 'bg-[#00C269] text-white border-[#00C269] shadow-sm'
                        : 'bg-white dark:bg-[#1E2330] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252B3A]'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional fields for Driver */}
            {role === 'driver' && (
              <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-[#1E2330] rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px]">
                    <strong>Verification Required:</strong> Driver accounts must first be approved by a Park Admin or Central Admin before you can log in.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Vehicle Type You Drive
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['tricycle', 'bus'] as VehicleType[]).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setPreferredVehicleType(type)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                          preferredVehicleType === type
                            ? 'bg-[#00C269] text-white border-[#00C269]'
                            : 'bg-white dark:bg-[#151821] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conditional fields for Park Admin */}
            {role === 'park_admin' && (
              <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-[#1E2330] rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px]">
                    <strong>Verification Required:</strong> Park Admin accounts must first be verified by Central Admin before you can log in.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
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
                            ? 'bg-[#00C269] text-white border-[#00C269]'
                            : 'bg-white dark:bg-[#151821] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
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
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Matric Number (Optional)
                </label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="e.g. CSC/2021/042"
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3.5 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Confirm *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm"
                  required
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.99] text-white font-black py-4 rounded-2xl shadow-md shadow-emerald-500/25 text-sm sm:text-base transition-all cursor-pointer disabled:opacity-50"
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
                className="w-full text-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-xs sm:text-sm font-medium py-2 cursor-pointer"
              >
                Already have an account? <span className="font-semibold text-[#00C269]">Sign in</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
