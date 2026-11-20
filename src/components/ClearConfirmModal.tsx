import { WarningIcon as AlertTriangle } from '@phosphor-icons/react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ClearConfirmModal({ isOpen, onConfirm, onCancel }: ClearConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" role="dialog" aria-modal="true">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Clear this note?</h2>
            <p className="text-sm text-slate-600">Your observations and the generated note will be removed.</p>
          </div>
        </div>

        <p className="text-[15px] text-slate-600 mb-5">
          Your name will be retained. Saved notes are not affected.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-[15px] font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 rounded-xl text-[15px] font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Clear note
          </button>
        </div>
      </div>
    </div>
  );
}
