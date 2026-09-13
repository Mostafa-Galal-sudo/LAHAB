import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#132238] border border-[#D8A065]/40 p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 shrink-0 flex items-center justify-center border ${
              danger ? 'border-red-500/50 bg-red-950/40 text-red-400' : 'border-[#D8A065]/50 bg-[#D8A065]/10 text-[#D8A065]'
            }`}
          >
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1.5">
            <h3 id="confirm-dialog-title" className="font-heading text-sm text-[#E2E6E8] uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-xs text-[#E2E6E8]/70 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs border border-[#E2E6E8]/25 text-[#E2E6E8]/70 hover:text-[#E2E6E8] hover:border-[#E2E6E8]/50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              danger ? 'bg-red-600 hover:bg-red-500 text-white' : 'btn-lahab-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
