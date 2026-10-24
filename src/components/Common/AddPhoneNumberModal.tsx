import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Phone, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const AddPhoneNumberModal: React.FC = () => {
  const { user, updatePhoneNumber } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (!user) return false;
    return sessionStorage.getItem(`dismiss_phone_prompt_${user.id}`) === 'true';
  });

  // Only display if user is logged in, active, and does not have an 11-digit phone number starting with 0
  const hasValidPhone = !!user?.phone && /^0\d{10}$/.test(user.phone.trim());
  if (!user || user.status !== 'Active' || hasValidPhone || isDismissed) {
    return null;
  }

  // Real-time validation checks
  const cleanPhone = phoneNumber.trim();
  const startsWithZero = cleanPhone.startsWith('0');
  const hasExact11Digits = /^\d{11}$/.test(cleanPhone);
  const isValid = startsWithZero && hasExact11Digits;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('Phone number must consist of exactly 11 digits and start with 0 (e.g. 08012345678).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = updatePhoneNumber(cleanPhone);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Phone number added to your profile!');
    } else {
      setError(result.error || 'Failed to save phone number.');
    }
  };

  const handleDismiss = () => {
    if (user) {
      sessionStorage.setItem(`dismiss_phone_prompt_${user.id}`, 'true');
    }
    setIsDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#151821] rounded-3xl border border-gray-100 dark:border-[#252B3A] shadow-2xl p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
          title="Remind me later"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4 text-[#00C269] shadow-xs">
          <Phone className="w-7 h-7" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5 mb-5 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full inline-block">
            Profile Completion
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Add Your Phone Number
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Welcome, <strong>{user.full_name}</strong>! Please add your phone number so drivers and campus transport operators can contact you regarding your rides and tricycle charters.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setPhoneNumber(val);
                  if (error) setError(null);
                }}
                placeholder="08012345678"
                className="w-full bg-[#F8F9FA] dark:bg-[#1E2330] border border-gray-200 dark:border-gray-700 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-gray-900 dark:text-white font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C269] transition-all"
                autoFocus
              />
            </div>

            {/* Validation Feedback Indicators */}
            <div className="flex items-center gap-4 pt-1.5 text-[11px]">
              <span className={`flex items-center gap-1 font-medium transition-colors ${
                startsWithZero ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Starts with 0
              </span>
              <span className={`flex items-center gap-1 font-medium transition-colors ${
                hasExact11Digits ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Exactly 11 digits ({cleanPhone.length}/11)
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs border border-red-100 dark:border-red-900 text-left">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.99] text-white font-black py-3.5 rounded-2xl shadow-md shadow-emerald-500/25 text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Continue'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-1.5 cursor-pointer font-medium"
            >
              Remind me later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
