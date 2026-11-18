import { Sparkles, ChevronDown, RotateCcw } from 'lucide-react';
import { NOTE_TYPES, NoteType, NoteMetadata } from '../types';

export { NOTE_TYPES };
export type { NoteType, NoteMetadata };

const PLACEHOLDERS: Record<NoteType, string> = {
  'Daily Log': `e.g.
- woke at 7am, well rested
- assisted with morning wash and dressing, chose blue shirt
- ate full breakfast — porridge and toast, good appetite
- walked in garden 20 mins with support
- quiet afternoon, watched TV
- anxious around 4pm, reassured and settled
- dinner eaten well
- settled to bed 9pm`,
  'Incident Report': `e.g.
- fell in corridor near bathroom at 2:15pm
- found on floor after hearing a noise
- no visible injuries, said felt dizzy beforehand
- helped up, sat in armchair
- obs taken — BP 128/82, pulse 76, all normal
- family contacted at 2:45pm
- manager informed, incident form completed`,
  'Handover Note': `e.g.
- overall quiet shift
- morning meds given, no issues
- Mrs Jones had a fall — see incident report
- Mr Smith refused lunch, ate biscuits
- GP called re: medication review tomorrow 10am
- laundry done, rooms cleaned
- night staff to monitor Mrs Jones closely`,
  'Medication Note': `e.g.
- morning meds at 8:30am
- amlodipine 5mg — taken
- metformin 500mg — taken with breakfast
- refused paracetamol, said no pain
- PRN lorazepam 1mg given at 2pm — anxious before appointment
- calm within 30 mins, no side effects noted`,
};

const SHIFT_PRESETS = [
  { label: 'Morning', shift: 'Morning shift (07:00–14:00)' },
  { label: 'Afternoon', shift: 'Afternoon shift (14:00–21:00)' },
  { label: 'Evening', shift: 'Evening shift (21:00–23:00)' },
  { label: 'Night', shift: 'Night shift (23:00–07:00)' },
];

interface NoteFormProps {
  noteType: NoteType;
  metadata: NoteMetadata;
  bulletPoints: string;
  isLoading: boolean;
  onNoteTypeChange: (type: NoteType) => void;
  onMetadataChange: (field: keyof NoteMetadata, value: string) => void;
  onBulletPointsChange: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

const inputClass =
  'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors';

export default function NoteForm({
  noteType,
  metadata,
  bulletPoints,
  isLoading,
  onNoteTypeChange,
  onMetadataChange,
  onBulletPointsChange,
  onSubmit,
  onClear,
}: NoteFormProps) {
  const wordCount = bulletPoints.trim() === '' ? 0 : bulletPoints.trim().split(/\s+/).length;
  const activePreset = SHIFT_PRESETS.find((p) => p.shift === metadata.shiftTime);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Card header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">New Note</h2>
          <p className="text-xs text-gray-400 mt-0.5">Fill in the details below, then generate your note</p>
        </div>
        {/* Note type pill selector */}
        <div className="relative hidden sm:block">
          <select
            value={noteType}
            onChange={(e) => onNoteTypeChange(e.target.value as NoteType)}
            className="appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer hover:bg-white transition-colors"
          >
            <option value="" disabled>Select note type</option>
            {NOTE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* Mobile note type */}
        <div className="sm:hidden">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Note Type</label>
          <div className="relative">
            <select
              value={noteType}
              onChange={(e) => onNoteTypeChange(e.target.value as NoteType)}
              className="w-full appearance-none px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm text-gray-800 font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer"
            >
              <option value="" disabled>Select note type</option>
              {NOTE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Care Worker Name</label>
            <input
              type="text"
              value={metadata.careWorkerName}
              onChange={(e) => onMetadataChange('careWorkerName', e.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resident / Service User</label>
            <input
              type="text"
              value={metadata.residentName}
              onChange={(e) => onMetadataChange('residentName', e.target.value)}
              placeholder="Full name"
              className={inputClass}
            />
          </div>
        </div>

        {/* Date + Shift */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date</label>
            <input
              type="date"
              value={metadata.date}
              onChange={(e) => onMetadataChange('date', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shift / Visit Time</label>
            <div className="flex gap-1 mb-2 flex-wrap">
              {SHIFT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onMetadataChange('shiftTime', preset.shift)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    activePreset?.label === preset.label
                      ? 'bg-gray-950 border-gray-950 text-white'
                      : 'bg-white border-slate-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={metadata.shiftTime}
              onChange={(e) => onMetadataChange('shiftTime', e.target.value)}
              placeholder="or enter custom shift / visit time"
              className={inputClass}
            />
          </div>
        </div>

        {/* Bullet points */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Notes</label>
            <span className={`text-xs tabular-nums font-medium ${
              wordCount === 0 ? 'text-gray-300' : wordCount < 5 ? 'text-amber-500' : 'text-gray-400'
            }`}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
          <textarea
            value={bulletPoints}
            onChange={(e) => onBulletPointsChange(e.target.value)}
            placeholder={PLACEHOLDERS[noteType]}
            rows={11}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none leading-relaxed bg-slate-50 hover:bg-white transition-colors"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">Rough bullet points or keywords — AI writes the full professional note.</p>
            <a
              href="https://www.healthwriterhub.com/write-bullet-points/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors whitespace-nowrap ml-3"
            >
              Tips &rarr;
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClear}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 font-semibold rounded-xl transition-all text-sm"
          >
            <RotateCcw size={14} />
            Clear
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading || !bulletPoints.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-950 hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate Note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
