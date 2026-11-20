import { useState } from 'react';
import { EnvelopeSimpleIcon as Mail, LockIcon as Lock, UserIcon as User, EyeIcon as Eye, EyeSlashIcon as EyeOff, ArrowRightIcon as ArrowRight, ArrowLeftIcon as ArrowLeft, EnvelopeSimpleOpenIcon as MailCheck, CheckCircleIcon as CheckCircle2, ClipboardTextIcon as ClipboardList, WarningIcon as AlertTriangle, ArrowsLeftRightIcon as ArrowLeftRight, PillIcon as Pill, BuildingsIcon as Building2 } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { FREE_NOTES, PAYMENTS_ENABLED, SUPPORT_EMAIL } from '../lib/config';
import Logo from './Logo';

type Mode = 'signup' | 'login' | 'forgot';

// Wording kept from the original page. Three lines were softened so they can be backed up:
// no unverified testimonial and no specific time-saving figure.
const benefits = [
  'Turn brief bullet points into complete, professional care notes in seconds',
  'Reduce the time spent on documentation every shift',
  'Secure and private: your notes are accessible only to you',
  `${FREE_NOTES} free notes included. No payment details required`,
];

const noteTypes = [
  { icon: ClipboardList, label: 'Daily Log', desc: 'routine care activities & observations' },
  { icon: AlertTriangle, label: 'Incident Report', desc: 'accidents, falls & unexpected events' },
  { icon: ArrowLeftRight, label: 'Handover Note', desc: 'shift-end summaries for incoming staff' },
  { icon: Pill, label: 'Medication Note', desc: 'administration records & concerns' },
];

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'The email address or password is incorrect. Please try again or reset your password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email address using the link sent to your inbox.';
  if (m.includes('already registered')) return 'An account with this email address already exists. Please sign in.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a few minutes before trying again.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Unable to connect. Please check your internet connection and try again.';
  return message;
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState<{ kind: 'confirm' | 'reset'; email: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // With email confirmation on, there is no session until the link is clicked.
        if (!data.session) setSentTo({ kind: 'confirm', email });
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setSentTo({ kind: 'reset', email });
      }
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setSentTo(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-canvas">

      {/* ── Story panel ── */}
      <aside className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white lg:w-[48%] lg:min-h-screen">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />

        <div className="relative px-6 py-6 sm:px-10 lg:px-14 lg:py-14 lg:h-full flex flex-col w-full max-w-2xl mx-auto">
          <div className="lg:mb-10"><Logo tone="light" /></div>

          <div className="mt-8 lg:mt-auto lg:mb-auto">
            <span className="inline-flex items-center gap-2 text-sm font-semibold bg-white/15 border border-white/20 rounded-full px-3.5 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              AI-powered care documentation
            </span>
            <h1 className="text-[1.75rem] leading-tight sm:text-4xl xl:text-[2.75rem] xl:leading-[1.12] font-extrabold tracking-tight">
              Professional care notes,<br />
              <span className="text-brand-100">written in seconds.</span>
            </h1>
            <p className="mt-4 text-brand-50/90 text-base sm:text-lg leading-relaxed text-pretty">
              Transform brief bullet points into detailed, professional care notes written to CQC
              standards, so you can focus on what matters most: the people you support.
            </p>

            <ul className="mt-7 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 size={22} weight="fill" className="text-emerald-300 flex-shrink-0 mt-px" />
                  <span className="text-[15px] sm:text-base text-white/95 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>

            {/* Note types — hidden on small phones to keep the form close to the top */}
            <div className="mt-8 hidden sm:block">
              <p className="text-xs font-bold text-brand-100 uppercase tracking-wider mb-3">4 note types supported</p>
              <div className="grid grid-cols-2 gap-2.5">
                {noteTypes.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-2xl px-3.5 py-3">
                    <Icon size={22} className="text-brand-100 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-brand-50/80 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=myCareNotes%20for%20our%20care%20service`}
            className="mt-8 hidden lg:flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl px-5 py-4 transition-colors"
          >
            <Building2 size={20} className="text-brand-100 flex-shrink-0" />
            <span className="text-sm leading-relaxed">
              <span className="font-semibold">Run a care service?</span>{' '}
              <span className="text-brand-50/85">Contact us about organisation accounts.</span>
            </span>
            <ArrowRight size={16} className="ml-auto flex-shrink-0" />
          </a>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <main className="flex-1 flex flex-col justify-center px-5 py-8 sm:px-10 lg:py-12">
        <div className="max-w-md mx-auto w-full">

          {sentTo ? (
            <div className="card p-7 sm:p-8 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                <MailCheck size={26} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {sentTo.kind === 'confirm'
                  ? <>A confirmation link has been sent to <strong className="text-slate-900">{sentTo.email}</strong>. Please select the link to activate your account. You will then be signed in automatically.</>
                  : <>If an account exists for <strong className="text-slate-900">{sentTo.email}</strong>, a link to reset your password has been sent.</>}
              </p>
              <p className="mt-3 text-sm text-slate-500">If the email does not arrive within a few minutes, please check your junk or spam folder.</p>
              <button onClick={() => switchMode('login')} className="btn-secondary w-full mt-7">
                <ArrowLeft size={16} />
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">
                  {mode === 'login' ? 'Welcome back' : mode === 'forgot' ? 'Reset your password' : 'Get started for free'}
                </h2>
                <p className="mt-1.5 text-slate-600">
                  {mode === 'login'
                    ? 'Sign in to access your care notes.'
                    : mode === 'forgot'
                    ? 'Enter your email address and we will send you a link to reset your password.'
                    : 'Create your account and generate your first note in seconds.'}
                </p>
              </div>

              {mode !== 'forgot' && (
                <div className="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1 mb-6" role="tablist">
                  {(['signup', 'login'] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => switchMode(m)}
                      className={`py-2.5 text-[15px] font-semibold rounded-lg transition-all ${
                        mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m === 'login' ? 'Sign in' : 'Sign up'}
                    </button>
                  ))}
                </div>
              )}

              <div className="card p-6 sm:p-7">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'signup' && (
                    <div>
                      <label htmlFor="name" className="field-label">Full name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                          required
                          className="field-input pl-11"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="field-label">Email address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@organisation.co.uk"
                        required
                        className="field-input pl-11"
                      />
                    </div>
                  </div>

                  {mode !== 'forgot' && (
                    <div>
                      <div className="flex items-baseline justify-between">
                        <label htmlFor="password" className="field-label">Password</label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
                          required
                          minLength={6}
                          className="field-input pl-11 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl leading-relaxed">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Please wait
                      </>
                    ) : (
                      <>
                        {mode === 'login' ? 'Sign in' : mode === 'forgot' ? 'Send reset link' : 'Create account'}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  {mode === 'forgot' && (
                    <button type="button" onClick={() => switchMode('login')} className="btn-secondary w-full">
                      <ArrowLeft size={16} />
                      Back to sign in
                    </button>
                  )}
                </form>
              </div>

              {mode === 'signup' && PAYMENTS_ENABLED && (
                <p className="mt-4 text-sm text-slate-600 text-center">
                  Paid plans from £1.99.
                </p>
              )}
            </>
          )}

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=myCareNotes%20for%20our%20care%20service`}
            className="lg:hidden mt-6 flex items-center gap-3 card px-4 py-3.5 hover:border-brand-300 transition-colors"
          >
            <Building2 size={20} className="text-brand-600 flex-shrink-0" />
            <span className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Run a care service?</span> Contact us about organisation accounts.
            </span>
          </a>

          <p className="text-center text-sm text-slate-500 mt-6 leading-relaxed">
            All AI-generated notes must be reviewed by the care worker before being added to official care records.
          </p>
        </div>
      </main>
    </div>
  );
}
