import { useState, useEffect, useCallback } from 'react';
import { ClockCounterClockwiseIcon as History, SignOutIcon as LogOut, PlusIcon as Plus, XIcon as X, InfinityIcon, FileTextIcon } from '@phosphor-icons/react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, GENERATE_NOTE_URL } from './lib/supabase';
import { NoteType, NoteMetadata, Note } from './types';
import NoteForm from './components/NoteForm';
import NoteResult from './components/NoteResult';
import ClearConfirmModal from './components/ClearConfirmModal';
import AuthPage from './components/AuthPage';
import NoteHistory from './components/NoteHistory';
import PricingModal from './components/PricingModal';
import ResetPassword from './components/ResetPassword';
import Logo from './components/Logo';
import { FREE_NOTES, SUPPORT_EMAIL } from './lib/config';

const CARE_WORKER_NAME_KEY = 'carenote_care_worker_name';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function nowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function emptyMetadata(name = ''): NoteMetadata {
  return { residentName: '', date: todayISO(), time: nowTime(), shiftTime: '', careWorkerName: name };
}

interface UserEntitlement {
  credits: number;
  hasActiveSub: boolean;
  isUnlimited: boolean;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recoveringPassword, setRecoveringPassword] = useState(false);

  const [showClearModal, setShowClearModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>('Daily Log');
  const [metadata, setMetadata] = useState<NoteMetadata>(emptyMetadata());
  const [bulletPoints, setBulletPoints] = useState('');
  const [generatedNote, setGeneratedNote] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [entitlement, setEntitlement] = useState<UserEntitlement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Arriving from a "reset password" email link
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const storedName = localStorage.getItem(CARE_WORKER_NAME_KEY);
      const userName = session.user.user_metadata?.full_name || storedName || '';
      setMetadata(emptyMetadata(userName));
      fetchNotes();
      fetchEntitlement();
    }
  }, [session]);

  const fetchEntitlement = useCallback(async () => {
    const [{ data: creditRow }, { data: subRow }] = await Promise.all([
      supabase.from('user_credits').select('credits, is_unlimited').maybeSingle(),
      supabase.from('user_subscriptions').select('status, current_period_end').maybeSingle(),
    ]);

    const hasActiveSub =
      subRow?.status === 'active' &&
      subRow?.current_period_end &&
      new Date(subRow.current_period_end) > new Date();

    setEntitlement({
      credits: creditRow?.credits ?? 0,
      hasActiveSub: !!hasActiveSub,
      isUnlimited: creditRow?.is_unlimited === true,
    });
  }, []);

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setNotes(data as Note[]);
    setNotesLoading(false);
  }, []);

  const handleMetadataChange = (field: keyof NoteMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
    if (field === 'careWorkerName') {
      localStorage.setItem(CARE_WORKER_NAME_KEY, value);
    }
  };

  const handleClearConfirmed = () => {
    const name = metadata.careWorkerName;
    setMetadata(emptyMetadata(name));
    setBulletPoints('');
    setGeneratedNote('');
    setError('');
    setIsSaved(false);
    setShowClearModal(false);
  };

  const handleClearRequest = () => {
    const hasContent = metadata.residentName || metadata.shiftTime || bulletPoints || generatedNote;
    if (hasContent) {
      setShowClearModal(true);
    } else {
      handleClearConfirmed();
    }
  };

  const handleGenerate = async () => {
    if (!bulletPoints.trim()) return;
    setIsLoading(true);
    setGeneratedNote('');
    setError('');
    setIsSaved(false);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const response = await fetch(GENERATE_NOTE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ noteType, bulletPoints, metadata }),
      });

      const data = await response.json();

      if (response.status === 402 || data.error === 'NO_CREDITS') {
        setShowPricing(true);
        setError('');
      } else if (!response.ok || data.error) {
        setError(data.message || data.error || 'Failed to generate note. Please try again.');
      } else {
        setGeneratedNote(data.note);
        fetchEntitlement();
        setTimeout(() => document.getElementById('note-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedNote || !session) return;
    setIsSaving(true);

    const { error } = await supabase.from('notes').insert({
      user_id: session.user.id,
      note_type: noteType,
      resident_name: metadata.residentName,
      care_worker_name: metadata.careWorkerName,
      shift_time: metadata.shiftTime,
      date: metadata.date,
      time: metadata.time,
      bullet_points: bulletPoints,
      generated_note: generatedNote,
    });

    if (!error) {
      setIsSaved(true);
      fetchNotes();
    }
    setIsSaving(false);
  };

  const handleSelectNote = (note: Note) => {
    setNoteType(note.note_type as NoteType);
    setMetadata({
      residentName: note.resident_name,
      careWorkerName: note.care_worker_name,
      date: note.date,
      time: note.time,
      shiftTime: note.shift_time,
    });
    setBulletPoints(note.bullet_points);
    setGeneratedNote(note.generated_note);
    setIsSaved(true);
    setError('');
    setShowHistory(false);
  };

  const handleDeleteNote = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setNotes([]);
    setGeneratedNote('');
    setBulletPoints('');
    setError('');
    setEntitlement(null);
  };

  const handleNewNote = () => {
    const name = metadata.careWorkerName;
    setMetadata(emptyMetadata(name));
    setBulletPoints('');
    setGeneratedNote('');
    setError('');
    setIsSaved(false);
    setShowHistory(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (recoveringPassword) {
    return <ResetPassword onDone={() => setRecoveringPassword(false)} />;
  }

  if (!session) {
    return <AuthPage />;
  }

  const user = session.user as User;
  const initials = (user.user_metadata?.full_name || user.email || 'U')
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const unlimited = !!entitlement && (entitlement.isUnlimited || entitlement.hasActiveSub);
  const outOfCredits = !!entitlement && !unlimited && entitlement.credits === 0;

  return (
    <div className="min-h-screen bg-canvas">

      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Logo size="sm" />

          <div className="flex items-center gap-1 sm:gap-1.5">
            {entitlement && (
              <button
                onClick={() => setShowPricing(true)}
                title={unlimited ? 'Unlimited notes' : `Free plan: ${entitlement.credits} of ${FREE_NOTES} notes remaining`}
                className={`flex items-center gap-1.5 h-10 px-3 text-sm font-semibold rounded-xl border transition-colors ${
                  unlimited
                    ? 'border-brand-200 bg-brand-50 text-brand-700'
                    : outOfCredits
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {unlimited ? <InfinityIcon size={17} /> : <FileTextIcon size={17} className={outOfCredits ? '' : 'text-brand-600'} />}
                {unlimited ? (
                  <span>Unlimited</span>
                ) : (
                  <>
                    <span className="hidden sm:inline font-medium text-slate-500">Free plan ·</span>
                    <span>{entitlement.credits} <span className="font-medium">remaining</span></span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowHistory(!showHistory)}
              aria-label={showHistory ? 'Close history' : 'History'}
              className={`flex items-center gap-1.5 h-10 px-3 text-sm font-semibold rounded-xl transition-colors ${
                showHistory ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {showHistory ? <X size={17} /> : <History size={17} />}
              <span className="hidden sm:inline">{showHistory ? 'Close' : 'History'}</span>
              {!showHistory && notes.length > 0 && (
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {notes.length}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center pl-2 ml-1 border-l border-slate-200 h-8">
              <div
                className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center"
                title={user.user_metadata?.full_name || user.email}
              >
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 sm:py-8">
        {showHistory ? (
          <div className="space-y-4">
            <NoteHistory
              notes={notes}
              onSelect={handleSelectNote}
              onDelete={handleDeleteNote}
              isOpen={true}
            />
            {notesLoading && (
              <p className="text-sm text-center text-slate-500">Loading notes…</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {outOfCredits && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3">
                <p className="text-[15px] text-amber-900 font-medium">You've used the {FREE_NOTES} notes included in the free plan. Contact us to continue.</p>
                <button
                  onClick={() => setShowPricing(true)}
                  className="flex-shrink-0 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl transition-colors"
                >
                  Contact us
                </button>
              </div>
            )}

            {!generatedNote && !error && notes.length === 0 && (
              <div className="px-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Hi{user.user_metadata?.full_name ? ` ${String(user.user_metadata.full_name).split(' ')[0]}` : ''} 👋
                </h1>
                <p className="mt-1 text-slate-600">Add your observations from the shift and we'll draft the note for you to review.</p>
              </div>
            )}

            <NoteForm
              noteType={noteType}
              metadata={metadata}
              bulletPoints={bulletPoints}
              isLoading={isLoading}
              onNoteTypeChange={(type) => {
                setNoteType(type);
                setGeneratedNote('');
                setError('');
                setIsSaved(false);
              }}
              onMetadataChange={handleMetadataChange}
              onBulletPointsChange={setBulletPoints}
              onSubmit={handleGenerate}
              onClear={handleClearRequest}
            />

            {(generatedNote || error) && (
              <div id="note-result" className="scroll-mt-20">
              <NoteResult
                note={generatedNote}
                error={error}
                noteType={noteType}
                metadata={metadata}
                onSave={handleSave}
                isSaving={isSaving}
                isSaved={isSaved}
                onNoteChange={(edited) => {
                  setGeneratedNote(edited);
                  setIsSaved(false);
                }}
              />
              </div>
            )}

            {generatedNote && (
              <button onClick={handleNewNote} className="btn-secondary w-full">
                <Plus size={17} />
                Start a new note
              </button>
            )}

            <div className="text-center pt-2 pb-4 space-y-1.5">
              <p className="text-sm text-slate-500">
                Always review AI-written notes before adding them to official care records.
              </p>
              <p className="text-sm text-slate-500">
                Need help?{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 hover:text-brand-700 font-semibold">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        )}
      </main>

      <ClearConfirmModal
        isOpen={showClearModal}
        onConfirm={handleClearConfirmed}
        onCancel={() => setShowClearModal(false)}
      />

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  );
}
