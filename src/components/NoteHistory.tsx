import { useMemo, useState } from 'react';
import { Clock, FileText, User, Trash2, ChevronRight, Search, X } from 'lucide-react';
import { Note, NoteType, NOTE_TYPES } from '../types';

const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  'Daily Log': 'bg-brand-50 text-brand-700 border-brand-100',
  'Incident Report': 'bg-amber-50 text-amber-800 border-amber-100',
  'Handover Note': 'bg-emerald-50 text-emerald-800 border-emerald-100',
  'Medication Note': 'bg-rose-50 text-rose-800 border-rose-100',
};

interface NoteHistoryProps {
  notes: Note[];
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
}

export default function NoteHistory({ notes, onSelect, onDelete, isOpen }: NoteHistoryProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<NoteType | 'All'>('All');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (typeFilter !== 'All' && n.note_type !== typeFilter) return false;
      if (!q) return true;
      return [n.resident_name, n.care_worker_name, n.generated_note, n.shift_time]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [notes, query, typeFilter]);

  if (!isOpen) return null;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100 space-y-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Saved notes</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {notes.length} note{notes.length !== 1 ? 's' : ''} saved
            {filtered.length !== notes.length && ` · showing ${filtered.length}`}
          </p>
        </div>

        {notes.length > 0 && (
          <>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes"
                aria-label="Search saved notes"
                className="field-input pl-11 pr-10"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-0.5">
              {(['All', ...NOTE_TYPES] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  aria-pressed={typeFilter === t}
                  className={`flex-shrink-0 h-9 px-3.5 text-sm font-semibold rounded-full border transition-colors ${
                    typeFilter === t
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700">No saved notes yet</p>
          <p className="text-sm text-slate-500 mt-1">After you approve a note, tap <strong>Save</strong> and it will appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-6 py-12 text-center text-slate-500">No notes match your search.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtered.map((note) => (
            <li key={note.id} className="group relative flex items-stretch">
              <button
                onClick={() => onSelect(note)}
                className="flex-1 min-w-0 text-left pl-5 sm:pl-7 pr-2 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${NOTE_TYPE_COLORS[note.note_type as NoteType] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {note.note_type}
                    </span>
                    <p className="mt-1.5 text-base font-semibold text-slate-900 truncate">
                      {note.resident_name || 'No name given'}
                    </p>
                    <div className="flex items-center gap-x-3 gap-y-0.5 mt-0.5 flex-wrap text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {formatDate(note.created_at)}
                      </span>
                      {note.shift_time && <span className="truncate max-w-[12rem]">{note.shift_time.replace(/\s*\(.*\)/, '')}</span>}
                      {note.care_worker_name && (
                        <span className="flex items-center gap-1 truncate">
                          <User size={13} />
                          {note.care_worker_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                </div>
              </button>

              <div className="flex items-center pr-3 sm:pr-5">
                {confirmingId === note.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { onDelete(note.id); setConfirmingId(null); }}
                      className="h-9 px-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      aria-label="Keep note"
                      className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  // Always visible on touch screens; appears on hover with a mouse
                  <button
                    onClick={() => setConfirmingId(note.id)}
                    aria-label="Delete note"
                    title="Delete note"
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
