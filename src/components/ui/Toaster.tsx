'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, type ToastType } from '@/store/toastStore';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-emerald-400" />,
  error: <XCircle size={16} className="text-red-400" />,
  info: <Info size={16} className="text-blue-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
};

const bars: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.88 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex w-80 items-start gap-3 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3.5 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
          >
            {/* colour accent bar */}
            <span className={`absolute inset-y-0 left-0 w-0.5 ${bars[t.type]} rounded-l-2xl`} />

            <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
            <p className="flex-1 text-xs font-medium leading-relaxed text-[var(--color-text)]">
              {t.message}
            </p>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-1 shrink-0 rounded-md p-0.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--color-text)]"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
