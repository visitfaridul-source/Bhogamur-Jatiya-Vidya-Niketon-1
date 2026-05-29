import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmationContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const getIcon = () => {
    if (!options) return null;
    switch (options.variant) {
      case 'danger':
        return <div className="p-3 bg-red-50 text-red-600 rounded-full border border-red-100"><AlertTriangle className="w-6 h-6" /></div>;
      case 'warning':
        return <div className="p-3 bg-amber-50 text-amber-600 rounded-full border border-amber-100"><AlertTriangle className="w-6 h-6" /></div>;
      case 'info':
      default:
        return <div className="p-3 bg-blue-50 text-blue-600 rounded-full border border-blue-100"><Info className="w-6 h-6" /></div>;
    }
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden"
              id="confirm-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex gap-4 items-start">
                {getIcon()}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {options.title || 'Confirm Action'}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                    {options.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                  id="confirm-modal-cancel"
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors border border-slate-200 bg-white cursor-pointer"
                >
                  {options.cancelLabel || 'Cancel'}
                </button>
                <button
                  id="confirm-modal-ok"
                  type="button"
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition-colors cursor-pointer ${
                    options.variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                      : options.variant === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  {options.confirmLabel || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmationContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context;
}
