import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../Common/Logo';
import { GoogleIcon } from '../Common/GoogleIcon';
import { GoogleSetupModal } from '../Common/GoogleSetupModal';
import { AlertCircle, Sun, Moon, Eye, EyeOff, Mail } from 'lucide-react';

interface LoginViewProps {
  onGoToSignup: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onGoToSignup }) => {
  const { login, loginWithGoogle, resendVerificationEmail, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or matric number.');
      return;
    }
    setErrorMessage(null);
    setUnconfirmedEmail(null);

    const result = await login(identifier, password);
    if (!result.success) {
      if (result.isUnconfirmed && result.email) {
        setUnconfirmedEmail(result.email);
      } else {
        setErrorMessage(result.error || 'Failed to sign in. Check your details.');
      }
    } else {
      toast.success('Signed in successfully.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setUnconfirmedEmail(null);
    const result = await loginWithGoogle();
    if (!result.success) {
      if (result.isProviderDisabled) {
        setShowGoogleModal(true);
      } else {
        setErrorMessage(result.error || 'Failed to initialize Google login.');
      }
    }
  };

  const handleResendUnconfirmed = async (targetEmail: string) => {
    setIsResending(true);
    const result = await resendVerificationEmail(targetEmail);
    setIsResending(false);
    if (result.success) {
      toast.success(`Verification email resent to ${targetEmail}. Please check your inbox or spam.`);
    } else {
      toast.error(result.error || 'Failed to resend confirmation email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D1017] flex flex-col justify-center items-center p-4 sm:p-8 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#151821] sm:rounded-3xl sm:border border-gray-100 dark:border-[#252B3A] sm:shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-10 flex flex-col justify-between min-h-screen sm:min-h-0 transition-colors">
        {/* Top Section */}
        <div>
          <div className="pt-2 sm:pt-0 pb-8 flex items-center justify-between">
            <Logo size="lg" />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-[#1E2330] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#252B3A] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
            </button>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Campus rides,<br />made clear.
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-normal">
              Sign in to check buses and request a tricycle.
            </p>
          </div>

          {/* Unconfirmed Email Notice via Supabase Auth */}
          {unconfirmedEmail && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm space-y-3">
              <div className="flex items-start gap-2.5">
                <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block uppercase tracking-wider text-xs text-amber-900 dark:text-amber-200">
                    Email Verification Required
                  </span>
                  <p className="text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                    Your account registration for <strong>{unconfirmedEmail}</strong> is awaiting email verification. Please check your inbox for the confirmation link.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                <button
                  type="button"
                  disabled={isResending}
                  onClick={() => handleResendUnconfirmed(unconfirmedEmail)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
                <button
                  type="button"
                  onClick={() => setUnconfirmedEmail(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs py-2 px-2 cursor-pointer font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 border ${
              errorMessage.toLowerCase().includes('pending')
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                errorMessage.toLowerCase().includes('pending') ? 'text-amber-600' : 'text-red-500'
              }`} />
              <div className="space-y-1">
                {errorMessage.toLowerCase().includes('pending') && (
                  <span className="font-bold block text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Verification In Progress
                  </span>
                )}
                <span>{errorMessage}</span>
                {errorMessage.includes('Google Sign-In is not enabled') && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGoogleModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-xs"
                    >
                      View Setup Instructions
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Google Sign In Option */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white dark:bg-[#1E2330] hover:bg-gray-50 dark:hover:bg-[#252B3A] text-gray-800 dark:text-gray-100 font-bold py-3.5 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs text-sm sm:text-base transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Continue with Google</span>
            </button>

            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
              <span className="bg-white dark:bg-[#151821] px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Or sign in with email
              </span>
              <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Email or matric number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@university.edu"
                required
                className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-4 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl pl-4 pr-12 py-4 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => toast.info('Password reset instructions sent to your registered email.')}
                className="text-[#00C269] hover:underline text-xs font-semibold cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Buttons */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.99] text-white font-black py-4 rounded-2xl shadow-md shadow-emerald-500/25 text-sm sm:text-base transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={onGoToSignup}
                className="w-full bg-[#F0F2F5] dark:bg-[#1E2330] hover:bg-[#E4E6EA] dark:hover:bg-[#252B3A] text-gray-900 dark:text-white font-semibold py-4 rounded-2xl text-sm sm:text-base transition-all active:scale-[0.99] cursor-pointer text-center"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Google Setup Guide Modal */}
      <GoogleSetupModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />
    </div>
  );
};
