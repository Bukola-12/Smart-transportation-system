import React, { useState } from 'react';
import { GoogleIcon } from './GoogleIcon';
import { ExternalLink, Copy, Check, X, ShieldAlert, Globe } from 'lucide-react';

interface GoogleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSetupModal: React.FC<GoogleSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [copiedSiteUrl, setCopiedSiteUrl] = useState(false);

  if (!isOpen) return null;

  const callbackUrl = 'https://igrgmnjtmjmtzhdurbdp.supabase.co/auth/v1/callback';
  const liveSiteUrl = window.location.origin;

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const handleCopySiteUrl = () => {
    navigator.clipboard.writeText(liveSiteUrl);
    setCopiedSiteUrl(true);
    setTimeout(() => setCopiedSiteUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#151821] rounded-3xl border border-gray-100 dark:border-[#252B3A] shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
            <GoogleIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Provider Configuration Required</span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Enable Google Sign-In
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
          Google OAuth is not enabled in your Supabase project yet. The Supabase project admin must activate the Google provider to allow signing in with Google.
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-6 text-xs text-gray-700 dark:text-gray-200">
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1A1F2C] border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-gray-900 dark:text-white">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[11px] font-black">
                1
              </span>
              <span>Open Supabase Auth Providers</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] pl-6.5">
              Navigate to Authentication &rarr; Providers &rarr; Google in your Supabase Dashboard.
            </p>
            <div className="pl-6.5 pt-1">
              <a
                href="https://supabase.com/dashboard/project/igrgmnjtmjmtzhdurbdp/auth/providers"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                <span>Go to Supabase Providers</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1A1F2C] border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-gray-900 dark:text-white">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[11px] font-black">
                2
              </span>
              <span>Toggle Google Provider to "ON"</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] pl-6.5">
              Switch <strong>Enable Sign in with Google</strong> to active.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1A1F2C] border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-gray-900 dark:text-white">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[11px] font-black">
                3
              </span>
              <span>Google Cloud OAuth Credentials</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] pl-6.5 leading-relaxed">
              Create an OAuth 2.0 Client ID in Google Cloud Console, enter the Client ID and Client Secret in Supabase, and set this Authorized Redirect URI:
            </p>
            <div className="pl-6.5 pt-1">
              <div className="flex items-center gap-2 bg-white dark:bg-[#12151D] border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5">
                <code className="text-[10px] text-gray-800 dark:text-gray-200 truncate flex-1 font-mono">
                  {callbackUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCallback}
                  className="p-1 rounded text-gray-500 hover:text-emerald-600 transition-colors shrink-0"
                  title="Copy Callback URL"
                >
                  {copiedCallback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-blue-900 dark:text-blue-300">
              <Globe className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Important: Supabase Site URL</span>
            </div>
            <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
              To prevent confirmation emails and OAuth from redirecting to <code>localhost:3000</code>, update your Supabase Site URL to your live site:
            </p>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-[#12151D] border border-blue-200 dark:border-blue-800 rounded-xl px-2.5 py-1.5 mt-1">
              <code className="text-[10px] text-blue-900 dark:text-blue-200 truncate flex-1 font-mono font-bold">
                {liveSiteUrl}
              </code>
              <button
                type="button"
                onClick={handleCopySiteUrl}
                className="p-1 rounded text-blue-600 hover:text-blue-800 transition-colors shrink-0"
                title="Copy Live Site URL"
              >
                {copiedSiteUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="pt-1">
              <a
                href="https://supabase.com/dashboard/project/igrgmnjtmjmtzhdurbdp/auth/url-configuration"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-400 font-bold hover:underline"
              >
                <span>Open Supabase URL Configuration</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer shadow-md"
        >
          Understood · Continue with Email & Password
        </button>
      </div>
    </div>
  );
};
