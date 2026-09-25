import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-[#16171a] border border-white/10 rounded-lg shadow-2xl p-5 z-10 animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-rose-950/50 text-rose-400 border border-rose-900/40' : 'bg-amber-950/50 text-amber-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              isDanger
                ? 'bg-[#E52D27] hover:bg-[#c92520] text-white shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
