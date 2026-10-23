import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../Common/Logo';
import { AlertCircle, Sun, Moon, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onGoToSignup: () => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Student', email: 'adaeze@university.edu', role: 'Student' },
  { label: 'Driver', email: 'emeka@university.edu', role: 'Bus Driver' },
  { label: 'Park Admin', email: 'folake@university.edu', role: 'Gate Admin' },
  { label: 'Central Admin', email: 'centraladmin@university.edu', role: 'Central' },
];

export const LoginView: React.FC<LoginViewProps> = ({ onGoToSignup }) => {
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or matric number.');
      return;
    }
    setErrorMessage(null);
    const result = await login(identifier, password);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to sign in. Check your details.');
    } else {
      toast.success('Signed in successfully.');
    }
  };

  const fillDemoAccount = (email: string) => {
    setIdentifier(email);
    setPassword('password123');
    setErrorMessage(null);
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

          {errorMessage && (
            <div className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 border ${
              errorMessage.toLowerCase().includes('pending')
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                errorMessage.toLowerCase().includes('pending') ? 'text-amber-600' : 'text-red-500'
              }`} />
              <div className="space-y-0.5">
                {errorMessage.toLowerCase().includes('pending') && (
                  <span className="font-bold block text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Verification In Progress
                  </span>
                )}
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium rounded-2xl px-4 py-4 outline-none border border-transparent focus:border-[#00C269] focus:bg-white dark:focus:bg-[#151821] transition-all"
              />
            </div>

            {/* Quick Demo Fill Pills */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00C269]" />
                <span>Quick demo credentials:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemoAccount(acc.email)}
                    className="text-left px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-[#1E2330] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-[#00C269] dark:hover:text-[#00C269] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{acc.label}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">Use</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toast.info('Default demo password is password123')}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs font-medium cursor-pointer"
              >
                Demo password: <span className="font-mono text-gray-700 dark:text-gray-300">password123</span>
              </button>

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
    </div>
  );
};
