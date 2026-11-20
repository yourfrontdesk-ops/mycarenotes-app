import { Sparkles, RotateCcw, ClipboardList, AlertTriangle, ArrowLeftRight, Pill, LucideIcon } from 'lucide-react';
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

const TYPE_META: Record<NoteType, { icon: LucideIcon; hint: string; colour: string }> = {
  'Daily Log': { icon: ClipboardList, hint: 'Care and wellbeing', colour: 'text-brand-600 bg-brand-50' },
  'Incident Report': { icon: AlertTriangle, hint: 'Falls, accidents, events', colour: 'text-amber-700 bg-amber-50' },
  'Handover Note': { icon: ArrowLeftRight, hint: 'For the next shift', colour: 'text-emerald-700 bg-emerald-50' },
  'Medication Note': { icon: Pill, hint: 'Given, refused, PRN', colour: 'text-rose-700 bg-rose-50' },
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
          <legend className="field-label">What kind of note?</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NOTE_TYPES.map((type) => {
              const { icon: Icon, hint, colour } = TYPE_META[type];
              const active = noteType === type;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onNoteTypeChange(type)}
                  className={`flex flex-col items-start text-left rounded-xl border-2 p-3 transition-all ${
                    active
                      ? 'border-brand-500 bg-brand-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`inline-flex w-8 h-8 rounded-lg items-center justify-center ${colour}`}>
                    <Icon size={17} />
                  </span>
                  <span className="block mt-2 text-sm font-semibold text-slate-900 leading-tight">{type}</span>
                  <span className="block mt-0.5 text-xs text-slate-500 leading-snug">{hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="worker" className="field-label">Your name</label>
            <input
              id="worker"
              type="text"
              autoComplete="name"
              value={metadata.careWorkerName}
              onChange={(e) => onMetadataChange('careWorkerName', e.target.value)}
              placeholder="Care worker name"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="resident" className="field-label">Person you supported</label>
            <input
              id="resident"
              type="text"
              autoComplete="off"
              value={metadata.residentName}
              onChange={(e) => onMetadataChange('residentName', e.target.value)}
              placeholder="Resident / service user name"
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
            <span className="field-label" id="shift-label">Shift or visit</span>
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
              placeholder="or type a visit time, e.g. 10:00–10:45"
              className="field-input"
            />
          </div>
        </div>

        {/* Bullet points */}
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="notes" className="field-label">What happened?</label>
            <span className={`text-sm tabular-nums ${wordCount > 0 && wordCount < 5 ? 'text-amber-700' : 'text-slate-500'}`}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-2">Quick bullet points are fine. Only what you write goes in the note.</p>
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
                Writing your note…
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Write my note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
