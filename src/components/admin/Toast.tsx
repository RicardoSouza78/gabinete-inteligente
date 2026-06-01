'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export function ToastProvider() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setToast({
          message: customEvent.detail.message,
          type: customEvent.detail.type || 'success'
        });
      }
    };

    window.addEventListener('gi_toast', handleToast);
    return () => window.removeEventListener('gi_toast', handleToast);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const Icon = toast.type === 'success' 
    ? CheckCircle2 
    : toast.type === 'error' 
    ? AlertCircle 
    : Info;

  const typeStyles = toast.type === 'success'
    ? 'border-emerald-500/35 bg-emerald-950/95 text-emerald-300'
    : toast.type === 'error'
    ? 'border-red-500/35 bg-red-950/95 text-red-200'
    : 'border-primary/35 bg-zinc-950/95 text-primary-foreground';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-toast-in">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-md shadow-2xl ${typeStyles}`}>
        <Icon className="w-4.5 h-4.5 shrink-0" />
        <span className="text-xs font-semibold leading-normal">{toast.message}</span>
        <button 
          type="button"
          onClick={() => setToast(null)}
          className="ml-auto p-1 rounded-lg hover:bg-white/10 text-current transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gi_toast', { detail: { message, type } }));
  }
};
