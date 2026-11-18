import { useState, useEffect, useCallback } from 'react';
import { History, LogOut, Plus, X, CreditCard, Zap } from 'lucide-react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, GENERATE_NOTE_URL } from './lib/supabase';
import { NoteType, NoteMetadata, Note } from './types';
import NoteForm from './components/NoteForm';
import NoteResult from './components/NoteResult';
import ClearConfirmModal from './components/ClearConfirmModal';
import AuthPage from './components/AuthPage';
import NoteHistory from './components/NoteHistory';
import PricingModal from './components/PricingModal';

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
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      supabase.from('user_credits').select('credits').maybeSingle(),
      supabase.from('user_subscriptions').select('status, current_period_end').maybeSingle(),
    ]);

    const hasActiveSub =
      subRow?.status === 'active' &&
      subRow?.current_period_end &&
      new Date(subRow.current_period_end) > new Date();

    setEntitlement({
      credits: creditRow?.credits ?? 0,
      hasActiveSub: !!hasActiveSub,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
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

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/logo.png" alt="myCareNotes" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-bold text-gray-900 tracking-tight hidden sm:block">myCareNotes</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewNote}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">New Note</span>
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                showHistory ? 'bg-gray-950 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
              }`}
            >
              {showHistory ? <X size={13} /> : <History size={13} />}
              <span className="hidden sm:inline">{showHistory ? 'Close' : 'History'}</span>
              {!showHistory && notes.length > 0 && (
                <span className="bg-sky-100 text-sky-700 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {notes.length}
                </span>
              )}
            </button>

            {entitlement && (
              <button
                onClick={() => setShowPricing(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                {entitlement.hasActiveSub ? (
                  <>
                    <CreditCard size={12} className="text-sky-600" />
                    <span className="text-sky-700">Unlimited</span>
                  </>
                ) : (
                  <>
                    <Zap size={12} className="text-amber-500" />
                    <span className={entitlement.credits === 0 ? 'text-red-600' : 'text-gray-700'}>
                      {entitlement.credits} {entitlement.credits === 1 ? 'credit' : 'credits'}
                    </span>
                  </>
                )}
              </button>
            )}

            <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 pl-1">
              <div className="w-6 h-6 bg-gray-950 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <span className="text-xs text-gray-500 max-w-[110px] truncate">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-slate-100 rounded-lg transition-all"
              title="Sign out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {showHistory ? (
          <div className="space-y-4">
            <NoteHistory
              notes={notes}
              onSelect={handleSelectNote}
              onDelete={handleDeleteNote}
              isOpen={true}
            />
            {notesLoading && (
              <p className="text-xs text-center text-gray-400">Loading notes...</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {entitlement && !entitlement.hasActiveSub && entitlement.credits === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-sm text-amber-800 font-medium">You have no credits remaining.</p>
                <button
                  onClick={() => setShowPricing(true)}
                  className="flex-shrink-0 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-all"
                >
                  Get credits
                </button>
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
            )}

            <div className="text-center pb-2 space-y-1.5">
              <p className="text-xs text-gray-400">
                Always review AI-generated notes before adding to official care records.
              </p>
              <p className="text-xs text-gray-400">
                Need help?{' '}
                <a
                  href="mailto:help@mycarenotes.co.uk"
                  className="text-sky-600 hover:text-sky-700 hover:underline font-medium transition-colors"
                >
                  help@mycarenotes.co.uk
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
