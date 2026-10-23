import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useToast } from './ToastContext';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  implicationText?: string;
  cancelImplicationText?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    const currentOpts = options;
    setIsOpen(false);
    setOptions(null);

    // If an implication message is specified, display it near the bottom of the page
    if (currentOpts?.implicationText) {
      if (currentOpts.variant === 'danger') {
        toast.info(currentOpts.implicationText, 5000);
      } else {
        toast.success(currentOpts.implicationText, 5000);
      }
    }

    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    const currentOpts = options;
    setIsOpen(false);
    setOptions(null);

    // Show cancel implication message near the bottom
    const cancelMsg = currentOpts?.cancelImplicationText || 'Action cancelled. No changes were made.';
    toast.info(cancelMsg, 3500);

    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Centered Modal with Fullscreen Backdrop Blur */}
      {isOpen && options && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-[#252B3A] text-left transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Icon based on variant */}
            <div className="mb-4">
              {options.variant === 'danger' && (
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900 shadow-xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              {options.variant === 'warning' && (
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900 shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              {(!options.variant || options.variant === 'info') && (
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#00C269] flex items-center justify-center border border-emerald-200 dark:border-emerald-900 shadow-xs">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Title & Message */}
            <h3 
              id="confirm-modal-title"
              className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug mb-2"
            >
              {options.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-6">
              {options.message}
            </p>

            {/* Two Action Buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1E2330] dark:hover:bg-[#252B3A] text-gray-700 dark:text-gray-200 font-bold text-xs sm:text-sm transition-all cursor-pointer text-center"
              >
                {options.cancelText || 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                autoFocus
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer text-center ${
                  options.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                    : options.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                    : 'bg-[#00C269] hover:bg-[#00AB5D] shadow-emerald-500/20'
                }`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
