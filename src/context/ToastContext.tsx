import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  isExiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global dispatcher reference so non-React helpers can trigger clean toasts if needed
let globalShowToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const showGlobalToast = (message: string, type: ToastType = 'info', duration: number = 4500) => {
  if (globalShowToast) {
    globalShowToast(message, type, duration);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    // Trigger slow fade away animation first
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // Remove from state after animation finishes (700ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 700);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration,
        isExiting: false,
      };

      setToasts((prev) => [...prev.slice(-2), newToast]); // Keep up to 3 visible

      // Auto start slow fade-out after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, [showToast]);

  const toast = {
    success: (msg: string, duration?: number) => showToast(msg, 'success', duration),
    error: (msg: string, duration?: number) => showToast(msg, 'error', duration),
    warning: (msg: string, duration?: number) => showToast(msg, 'warning', duration),
    info: (msg: string, duration?: number) => showToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}

      {/* Floating Bottom Toast Container */}
      <div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 pointer-events-none max-w-[92vw] sm:max-w-md w-full px-4"
        aria-live="polite"
      >
        {toasts.map((t) => {
          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 rounded-2xl bg-gray-900/95 dark:bg-[#181D26]/95 backdrop-blur-md text-white shadow-2xl shadow-black/30 border border-white/10 dark:border-[#2A3545] transition-all duration-700 ease-out transform ${
                t.isExiting
                  ? 'opacity-0 translate-y-4 scale-95'
                  : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-3 duration-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {t.type === 'success' && (
                  <div className="w-7 h-7 rounded-xl bg-[#00C269]/20 text-[#00C269] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#00C269]" />
                  </div>
                )}
                {t.type === 'error' && (
                  <div className="w-7 h-7 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                )}
                {t.type === 'warning' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                )}
                {t.type === 'info' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-blue-400" />
                  </div>
                )}

                <p className="text-xs sm:text-sm font-semibold tracking-tight text-gray-100 dark:text-gray-100 leading-snug break-words">
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
