import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { UserRole, VehicleType } from '../../types';
import { ImageUpload } from '../Common/ImageUpload';
import { Logo } from '../Common/Logo';
import { sendVerificationOTP } from '../../lib/emailService';
import { 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  Car, 
  Sun, 
  Moon, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface SignupViewProps {
  onBackToLogin: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onBackToLogin }) => {
  const { signup, isLoading, users } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP Verification States
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpInputs, setOtpInputs] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pending approval screen state (for drivers & park admins)
  const [pendingRegistration, setPendingRegistration] = useState<{
    role: UserRole;
    fullName: string;
    email: string;
    phone?: string;
    parkScope?: string;
    vehicleType?: string;
  } | null>(null);

  // Password validation checks
  const passwordValidations = {
    hasMinLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  };

  const isPasswordValid = 
    passwordValidations.hasMinLength &&
    passwordValidations.hasUpper &&
    passwordValidations.hasNumber &&
    passwordValidations.hasSpecial;

  // Phone validation: exactly 11 digits, starts with 0
  const isPhoneValid = /^0\d{10}$/.test(phone.trim());

  // Resend cooldown timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isVerifyingEmail && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isVerifyingEmail, resendCooldown]);

  // Handle Initial Form Submission -> Trigger 6-Digit Email Verification
  const handleInitiateSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    // Phone validation check: strictly 11 digits and starts with 0
    if (!isPhoneValid) {
      setErrorMessage('Phone number must consist of exactly 11 numbers and start with 0 (e.g. 08012345678).');
      return;
    }

    // Password complexity check
    if (!isPasswordValid) {
      setErrorMessage(
        'Password must be at least 8 characters long, contain an uppercase letter, at least one number, and at least one special character.'
      );
      return;
    }

    // Password confirmation match check
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Duplicate account check
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMessage('An account with this email already exists. Please sign in instead.');
      return;
    }

    setErrorMessage(null);

    // Generate secure 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpInputs(['', '', '', '', '', '']);
    setOtpError(null);
    setResendCooldown(30);

    // Dispatch verification email with 6-digit code
    sendVerificationOTP(email.trim(), fullName.trim(), otp);

    // Switch view to OTP screen
    setIsVerifyingEmail(true);
  };

  // Handle OTP Input Change (supports single digit entry and auto-advance)
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newInputs = [...otpInputs];
    newInputs[index] = digit;
    setOtpInputs(newInputs);
    setOtpError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Pasting full 6-digit code into OTP boxes
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newInputs = [...otpInputs];
      for (let i = 0; i < 6; i++) {
        newInputs[i] = pasted[i] || '';
      }
      setOtpInputs(newInputs);
      setOtpError(null);
      const focusIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Resend 6-digit verification code
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpInputs(['', '', '', '', '', '']);
    setOtpError(null);
    setResendCooldown(30);

    sendVerificationOTP(email.trim(), fullName.trim(), newOtp);
    toast.info(`New 6-digit code sent to ${email.trim()}`);
  };

  // Complete Verification & Create Account
  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpInputs.join('');

    if (enteredCode.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (enteredCode !== generatedOtp) {
      setOtpError('Incorrect verification code. Please check your email or resend the code.');
      return;
    }

    setOtpError(null);

    // Call AuthContext signup
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
      setOtpError(result.error || 'Failed to complete registration.');
      return;
    }

    if (role === 'student') {
      toast.success('Email verified successfully! Welcome to CampusGo.');
      // Student is automatically logged in and redirected by App.tsx
    } else {
      // Drivers & Park Admins must wait for verification/approval
      toast.success('Email verified successfully! Account submitted for administrator approval.');
      setPendingRegistration({
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        parkScope: role === 'park_admin' ? parkScope : undefined,
        vehicleType: role === 'driver' ? preferredVehicleType : undefined,
      });
      setIsVerifyingEmail(false);
    }
  };

  // =========================================================================
  // SCREEN 1: PENDING APPROVAL CONFIRMATION (for Drivers & Park Admins)
  // =========================================================================
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
                Email Verified · Pending Administrator Approval
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white pt-1">
                Account Listed for Approval
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-normal max-w-sm mx-auto">
                {isDriver && (
                  <>
                    Your email is verified! Driver accounts must first be approved and assigned a vehicle by a <strong>Park Admin</strong> or <strong>Central Admin</strong>. Once approved, an email will be sent to <strong>{pendingRegistration.email}</strong> prompting you to log in.
                  </>
                )}
                {isParkAdmin && (
                  <>
                    Your email is verified! Park Admin accounts must first be verified and granted park permissions by <strong>Central Admin</strong>. Once approved, an email will be sent to <strong>{pendingRegistration.email}</strong> prompting you to log in.
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
                <span className="text-gray-400 dark:text-gray-500">Verified Email</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
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

            {/* Notice */}
            <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 rounded-2xl p-3.5 text-left text-xs border border-blue-100 dark:border-blue-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Next Steps</p>
                <p className="text-blue-800 dark:text-blue-200 text-[11px] leading-relaxed">
                  You do not need to do anything further right now. Once your account is approved by an administrator, an email notification will be dispatched to <strong>{pendingRegistration.email}</strong> informing you that you can log in.
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

  // =========================================================================
  // SCREEN 2: 6-DIGIT EMAIL OTP VERIFICATION SCREEN
  // =========================================================================
  if (isVerifyingEmail) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D1017] flex flex-col justify-center items-center p-4 sm:p-8 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#151821] sm:rounded-3xl sm:border border-gray-100 dark:border-[#252B3A] sm:shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-10 flex flex-col justify-between transition-colors">
          <div>
            <div className="pt-2 pb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsVerifyingEmail(false)}
                className="p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-2xl hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Back to edit registration details"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit details</span>
              </button>
              <Logo size="sm" />
              <div className="w-8" />
            </div>

            <div className="text-center space-y-3 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-[#00C269] flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <Mail className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Verify Your Email
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                  We sent a 6-digit verification code to{' '}
                  <span className="font-bold text-gray-800 dark:text-gray-200 block mt-0.5">
                    {email}
                  </span>
                </p>
              </div>
            </div>

            {/* Simulated Live Inbox Banner */}
            <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 text-left">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  CampusGo Verification Email
                </span>
                <span className="font-mono text-[10px] bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                  Valid 10 mins
                </span>
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-200">
                Your 6-digit code is:{' '}
                <strong className="font-mono text-base tracking-widest text-[#00A86B] dark:text-[#34D186] font-extrabold ml-1">
                  {generatedOtp}
                </strong>
              </p>
            </div>

            {otpError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs flex items-start gap-2 border border-red-100 dark:border-red-900">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-6">
              {/* 6 Digit Input Boxes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center mb-3">
                  Enter 6-Digit Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otpInputs.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      autoFocus={idx === 0}
                      className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-extrabold font-mono rounded-2xl bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white border-2 border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] outline-none transition-all shadow-xs"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Action */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-400 dark:text-gray-500">Didn't get the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="font-bold text-[#00C269] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? '' : 'animate-spin-slow'}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend new code'}
                  </span>
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.99] text-white font-black py-4 rounded-2xl shadow-md shadow-emerald-500/25 text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Activating account...' : 'Verify Code & Activate Account'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerifyingEmail(false)}
                  className="w-full text-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-xs font-semibold py-1.5 cursor-pointer"
                >
                  Change Email Address
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 3: MAIN SIGNUP REGISTRATION FORM
  // =========================================================================
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

          <form onSubmit={handleInitiateSignup} className="space-y-4">
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
              <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                A 6-digit verification code will be dispatched to this email to activate your account.
              </span>
            </div>

            {/* Phone Number Field (Strictly 11 digits, starts with 0) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone Number *
                </label>
                <span className={`text-[11px] font-mono font-bold ${
                  phone.length === 11 && phone.startsWith('0') 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : phone.length > 0 
                    ? 'text-amber-500' 
                    : 'text-gray-400'
                }`}>
                  {phone.length}/11 digits
                </span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setPhone(cleaned);
                }}
                maxLength={11}
                placeholder="08012345678"
                required
                className={`w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-mono font-medium rounded-2xl px-4 py-3.5 outline-none border transition-all ${
                  phone.length > 0 && !isPhoneValid
                    ? 'border-amber-400 focus:border-amber-500'
                    : 'border-transparent focus:border-[#00C269]'
                }`}
              />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                Must be exactly 11 digits and start with 0 (e.g. 08012345678).
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
                    <strong>Verification & Approval Required:</strong> You will first verify your email with a 6-digit code. Then your driver registration will be listed for Park Admin / Central Admin approval. Once approved, you will receive an approval email prompting you to log in.
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
                    <strong>Verification & Approval Required:</strong> You will first verify your email with a 6-digit code. Then your park admin account will be listed for Central Admin approval. Once verified, you will receive an approval email prompting you to log in.
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

            {/* Password Fields with Show/Hide Password Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl pl-4 pr-11 py-3 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl pl-4 pr-11 py-3 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements Description Box (Live Visual Guidance) */}
            <div className="p-3.5 bg-gray-50 dark:bg-[#1E2330] rounded-2xl border border-gray-100 dark:border-gray-800 text-[11px] space-y-1.5">
              <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Password Complexity Requirements:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-gray-500 dark:text-gray-400">
                <div className={`flex items-center gap-1.5 ${passwordValidations.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                  {passwordValidations.hasMinLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 ml-1 mr-1 shrink-0" />
                  )}
                  <span>At least 8 characters</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordValidations.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                  {passwordValidations.hasUpper ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 ml-1 mr-1 shrink-0" />
                  )}
                  <span>At least 1 uppercase letter (A-Z)</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordValidations.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                  {passwordValidations.hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 ml-1 mr-1 shrink-0" />
                  )}
                  <span>At least 1 number (0-9)</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordValidations.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                  {passwordValidations.hasSpecial ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 ml-1 mr-1 shrink-0" />
                  )}
                  <span>At least 1 special symbol (!@#$...)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.99] text-white font-black py-4 rounded-2xl shadow-md shadow-emerald-500/25 text-sm sm:text-base transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading 
                  ? 'Processing...' 
                  : 'Continue to Email Verification'}
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
