export type NoteType = 'Daily Log' | 'Incident Report' | 'Handover Note' | 'Medication Note';

export const NOTE_TYPES: NoteType[] = ['Daily Log', 'Incident Report', 'Handover Note', 'Medication Note'];

export interface NoteMetadata {
  residentName: string;
  date: string;
  time: string;
  shiftTime: string;
  careWorkerName: string;
}

export interface Note {
  id: string;
  user_id: string;
  note_type: NoteType;
  resident_name: string;
  care_worker_name: string;
  shift_time: string;
  date: string;
  time: string;
  bullet_points: string;
  generated_note: string;
  created_at: string;
}
