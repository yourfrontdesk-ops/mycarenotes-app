import { Clock, FileText, User, Trash2, ChevronRight } from 'lucide-react';
import { Note, NoteType } from '../types';

const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  'Daily Log': 'bg-sky-50 text-sky-700 border-sky-100',
  'Incident Report': 'bg-amber-50 text-amber-700 border-amber-100',
  'Handover Note': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Medication Note': 'bg-rose-50 text-rose-700 border-rose-100',
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
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NoteHistory({ notes, onSelect, onDelete, isOpen }: NoteHistoryProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">Recent Notes</h2>
          <p className="text-xs text-gray-400 mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText size={16} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No notes yet</p>
          <p className="text-xs text-gray-300 mt-1">Generated notes will appear here once saved</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-50">
          {notes.map((note) => (
            <li key={note.id} className="group relative">
              <button
                onClick={() => onSelect(note)}
                className="w-full text-left px-6 py-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 pr-8">
                  <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={13} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${NOTE_TYPE_COLORS[note.note_type as NoteType] ?? 'bg-slate-50 text-gray-600 border-slate-100'}`}>
                        {note.note_type}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate tracking-tight">
                      {note.resident_name || 'Unnamed resident'}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={10} />
                        {formatDate(note.created_at)}
                      </span>
                      {note.shift_time && (
                        <span className="text-xs text-gray-400 truncate">{note.shift_time}</span>
                      )}
                      {note.care_worker_name && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                          <User size={10} />
                          {note.care_worker_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                title="Delete note"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
