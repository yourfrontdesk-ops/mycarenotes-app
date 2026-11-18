import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'signup';

const benefits = [
  'Turn bullet points into full CQC-ready care notes in seconds',
  'Saves care workers 2–3 hours of documentation every shift',
  'Secure, private, and only accessible by you',
  '2 free notes included — no card required',
];

const noteTypes = [
  { label: 'Daily Log', desc: 'routine care activities & observations' },
  { label: 'Incident Report', desc: 'accidents, falls & unexpected events' },
  { label: 'Handover Note', desc: 'shift-end summaries for incoming staff' },
  { label: 'Medication Note', desc: 'administration records & concerns' },
];

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setSuccess('Account created! You are now signed in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Left panel ── */}
      <div className="hidden md:flex md:w-[48%] bg-gray-950 flex-col justify-center gap-8 p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.12)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(14,165,233,0.06)_0%,_transparent_60%)]" />

        {/* Main copy */}
        <div className="relative max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="myCareNotes" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-white font-bold text-lg tracking-tight">myCareNotes</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-3.5 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-300 text-xs font-medium tracking-wide">AI-powered care documentation</span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Professional care notes,<br />
            <span className="text-sky-400">written in seconds.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm">
            Transform your quick bullet points into detailed, CQC-ready care notes — so you can focus on what matters most.
          </p>
          <ul className="space-y-3.5 mb-8">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 size={17} className="text-sky-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">4 note types supported</p>
            <div className="grid grid-cols-2 gap-2">
              {noteTypes.map(({ label, desc }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-3">
                  <p className="text-white text-xs font-semibold mb-0.5">{label}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-300 text-sm leading-relaxed italic mb-3">
              "I used to spend 45 minutes writing notes after every shift. Now it takes me five. This tool has genuinely changed my working life."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sky-500/30 flex items-center justify-center">
                <span className="text-sky-300 text-xs font-bold">JM</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Jessica M.</p>
                <p className="text-gray-500 text-xs">Senior Care Worker, Birmingham</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">

        {/* Subtle background orb */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-50/80 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        {/* Mobile header */}
        <div className="md:hidden relative flex items-center gap-2.5 px-6 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <img src="/logo.png" alt="myCareNotes" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-bold text-gray-900 text-base">myCareNotes</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 py-12 sm:px-12 relative">
          <div className="max-w-sm mx-auto w-full">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Get started for free'}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {mode === 'login'
                  ? 'Sign in to access your care notes.'
                  : 'Create your account and generate your first note in seconds.'}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl bg-white border border-slate-200 p-1 mb-7 shadow-sm">
              {(['signup', 'login'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    mode === m
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sarah Ahmed"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@careagency.co.uk"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-950 hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Please wait...
                    </span>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Free Account'}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Free trial badge */}
            {mode === 'signup' && (
              <div className="mt-4 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-600 text-sm font-bold">2</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-900">No card required.</span> Your account includes 2 free notes. Plans from £1.99.
                </p>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
              AI-generated notes should always be reviewed before use in official care records.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
