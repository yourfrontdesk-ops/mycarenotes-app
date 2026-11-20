import { useState, useEffect } from 'react';
import { CopyIcon as Copy, CheckIcon as Check, FileTextIcon as FileText, WarningCircleIcon as AlertCircle, PrinterIcon as Printer, FloppyDiskIcon as Save, PencilSimpleIcon as Pencil, ShieldCheckIcon as ShieldCheck, XIcon as X } from '@phosphor-icons/react';
import { NoteType, NoteMetadata } from '../types';

interface NoteResultProps {
  note: string;
  error: string;
  noteType?: NoteType;
  metadata?: NoteMetadata;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
  onNoteChange?: (note: string) => void;
}

export default function NoteResult({
  note,
  error,
  noteType,
  metadata,
  onSave,
  isSaving,
  isSaved,
  onNoteChange,
}: NoteResultProps) {
  const [approved, setApproved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(note);
  const [copied, setCopied] = useState(false);

  // Reset approval state whenever a new note arrives
  useEffect(() => {
    setApproved(false);
    setEditing(false);
    setEditValue(note);
  }, [note]);

  const handleApproveAsWritten = () => {
    setApproved(true);
  };

  const handleStartEdit = () => {
    setEditValue(note);
    setEditing(true);
  };

  const handleSaveEdit = () => {
    onNoteChange?.(editValue);
    setEditing(false);
    setApproved(true);
  };

  const handleCancelEdit = () => {
    setEditValue(note);
    setEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const title = esc(`${noteType ?? 'Care Report'} — ${metadata?.residentName ?? ''}`.trim().replace(/—\s*$/, ''));
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; line-height: 1.7; color: #1a1a1a; max-width: 700px; margin: 40px auto; padding: 0 20px; }
    .header { border-bottom: 2px solid #2A5BE0; padding-bottom: 12px; margin-bottom: 24px; }
    .header h1 { font-size: 18px; color: #2A5BE0; margin: 0 0 4px 0; }
    .header p { margin: 0; color: #555; font-size: 12px; }
    .note-body { white-space: pre-wrap; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #888; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${esc(noteType ?? 'Care Report')}</h1>
    <p>Care record &bull; Written with myCareNotes &bull; Reviewed and approved by the care worker</p>
  </div>
  <div class="note-body">${esc(note)}</div>
  <div class="footer">
    This report was generated using myCareNotes and reviewed by the care worker prior to use.
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  if (error) {
    return (
      <div role="alert" className="card border-red-200 p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle size={15} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-800 mb-1">We couldn't write that note</h3>
            <p className="text-[15px] text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="card overflow-hidden">

      {/* Card header */}
      <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center ${approved ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            <FileText size={14} className={approved ? 'text-emerald-600' : 'text-amber-600'} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your note</h3>
            <p className="text-sm text-slate-500">
              {approved ? 'Approved and ready to copy' : 'Check it before you use it'}
            </p>
          </div>
        </div>
        {approved ? (
          <span className="flex-shrink-0 whitespace-nowrap text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
            <ShieldCheck size={11} />
            Approved
          </span>
        ) : (
          <span className="flex-shrink-0 whitespace-nowrap text-xs bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-200">
            Not yet approved
          </span>
        )}
      </div>

      {/* Review prompt — only shown before approval */}
      {!approved && !editing && (
        <div className="px-5 sm:px-7 pt-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 leading-relaxed">
              <span className="font-semibold">Please read it through.</span>{' '}
              Edit anything that doesn't match what actually happened, then approve it.
            </p>
          </div>
        </div>
      )}

      {/* Note body */}
      <div className="px-5 sm:px-7 py-5">
        {editing ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-slate-50 rounded-xl px-5 py-4 border border-brand-300 text-base text-slate-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
            rows={Math.max(12, editValue.split('\n').length + 2)}
            autoFocus
          />
        ) : (
          <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100">
            <p className="text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">{note}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 sm:px-7 pb-6 flex gap-2 flex-wrap">
        {editing ? (
          <>
            <button
              onClick={handleCancelEdit}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl font-semibold text-[15px] text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-[15px] transition-all"
            >
              <ShieldCheck size={14} />
              Save changes & approve
            </button>
          </>
        ) : approved ? (
          <>
            <button
              onClick={handleStartEdit}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl font-semibold text-[15px] text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Pencil size={14} />
              Edit
            </button>
            {onSave && (
              <button
                onClick={onSave}
                disabled={isSaving || isSaved}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[15px] transition-all border ${
                  isSaved
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSaved ? <><Check size={14} /> Saved</> : <><Save size={14} /> {isSaving ? 'Saving...' : 'Save'}</>}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl font-semibold text-[15px] text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-[15px] transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Note</>}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleStartEdit}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl font-semibold text-[15px] text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={handleApproveAsWritten}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-[15px] transition-all"
            >
              <ShieldCheck size={14} />
              Looks right — approve
            </button>
          </>
        )}
      </div>
    </div>
  );
}
