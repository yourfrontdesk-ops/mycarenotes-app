import { CheckCircleIcon, SparkleIcon as Sparkles, ArrowCounterClockwiseIcon as RotateCcw, ClipboardTextIcon as ClipboardList, WarningIcon as AlertTriangle, ArrowsLeftRightIcon as ArrowLeftRight, PillIcon as Pill } from '@phosphor-icons/react';
import type { Icon as LucideIcon } from '@phosphor-icons/react';
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

// Full class names written out so Tailwind keeps them in the build
const TYPE_META: Record<NoteType, { icon: LucideIcon; hint: string; tile: string; idle: string; active: string; tick: string }> = {
  'Daily Log': {
    icon: ClipboardList, hint: 'Routine care and wellbeing', tile: 'bg-brand-500', tick: 'text-brand-600',
    idle: 'bg-brand-50/60 border-brand-100 hover:border-brand-300', active: 'bg-brand-50 border-brand-500 ring-4 ring-brand-500/15',
  },
  'Incident Report': {
    icon: AlertTriangle, hint: 'Falls, accidents and events', tile: 'bg-amber-500', tick: 'text-amber-600',
    idle: 'bg-amber-50/60 border-amber-100 hover:border-amber-300', active: 'bg-amber-50 border-amber-500 ring-4 ring-amber-500/15',
  },
  'Handover Note': {
    icon: ArrowLeftRight, hint: 'Shift-end summary', tile: 'bg-emerald-500', tick: 'text-emerald-600',
    idle: 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-300', active: 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/15',
  },
  'Medication Note': {
    icon: Pill, hint: 'Administration and refusals', tile: 'bg-rose-500', tick: 'text-rose-600',
    idle: 'bg-rose-50/60 border-rose-100 hover:border-rose-300', active: 'bg-rose-50 border-rose-500 ring-4 ring-rose-500/15',
  },
};

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
    <div className="card overflow-hidden">
      <div className="p-5 sm:p-7 space-y-6">

        {/* Note type */}
        <fieldset>
          <legend className="field-label">Note type</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NOTE_TYPES.map((type) => {
              const { icon: Icon, hint, tile, idle, active: activeCls, tick } = TYPE_META[type];
              const active = noteType === type;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onNoteTypeChange(type)}
                  className={`relative flex flex-col items-start text-left rounded-2xl border-2 p-3.5 transition-all ${
                    active ? activeCls : idle
                  }`}
                >
                  {active && <CheckCircleIcon size={20} weight="fill" className={`absolute top-3 right-3 ${tick}`} />}
                  <span className={`inline-flex w-10 h-10 rounded-xl items-center justify-center text-white shadow-sm ${tile}`}>
                    <Icon size={22} weight="fill" />
                  </span>
                  <span className="block mt-2.5 text-sm font-bold text-slate-900 leading-tight">{type}</span>
                  <span className="block mt-0.5 text-xs text-slate-600 leading-snug">{hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="worker" className="field-label">Care worker</label>
            <input
              id="worker"
              type="text"
              autoComplete="name"
              value={metadata.careWorkerName}
              onChange={(e) => onMetadataChange('careWorkerName', e.target.value)}
              placeholder="Full name"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="resident" className="field-label">Resident / service user</label>
            <input
              id="resident"
              type="text"
              autoComplete="off"
              value={metadata.residentName}
              onChange={(e) => onMetadataChange('residentName', e.target.value)}
              placeholder="Full name"
              className="field-input"
            />
          </div>
        </div>

        {/* Date + Shift */}
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4">
          <div>
            <label htmlFor="date" className="field-label">Date</label>
            <input
              id="date"
              type="date"
              value={metadata.date}
              onChange={(e) => onMetadataChange('date', e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <span className="field-label" id="shift-label">Shift / visit time</span>
            <div className="grid grid-cols-4 gap-1.5 mb-2" role="group" aria-labelledby="shift-label">
              {SHIFT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={activePreset?.label === preset.label}
                  onClick={() => onMetadataChange('shiftTime', preset.shift)}
                  className={`h-10 text-sm font-semibold rounded-lg border transition-colors ${
                    activePreset?.label === preset.label
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              aria-labelledby="shift-label"
              value={metadata.shiftTime}
              onChange={(e) => onMetadataChange('shiftTime', e.target.value)}
              placeholder="Or enter a custom time, e.g. 10:00–10:45"
              className="field-input"
            />
          </div>
        </div>

        {/* Bullet points */}
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="notes" className="field-label">Observations</label>
            <span className={`text-sm tabular-nums ${wordCount > 0 && wordCount < 5 ? 'text-amber-700' : 'text-slate-500'}`}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-2">Enter brief bullet points or keywords. Only the information you provide will be included in the note.</p>
          <textarea
            id="notes"
            value={bulletPoints}
            onChange={(e) => onBulletPointsChange(e.target.value)}
            placeholder={PLACEHOLDERS[noteType]}
            rows={10}
            className="field-input resize-y leading-relaxed min-h-[220px]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClear} disabled={isLoading} className="btn-secondary">
            <RotateCcw size={16} />
            Clear
          </button>
          <button onClick={onSubmit} disabled={isLoading || !bulletPoints.trim()} className="btn-primary flex-1">
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating note
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Generate note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
