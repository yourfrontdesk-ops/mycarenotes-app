import { useState } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, MailCheck,
  PenLine, Sparkles, ShieldCheck, ClipboardList, AlertTriangle, ArrowLeftRight, Pill, Building2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FREE_ACCESS, PAYMENTS_ENABLED, SUPPORT_EMAIL } from '../lib/config';
import Logo from './Logo';

type Mode = 'signup' | 'login' | 'forgot';

const steps = [
  { icon: PenLine, title: 'Add your observations', desc: 'Short bullet points or keywords, in your own words.' },
  { icon: Sparkles, title: 'Receive a draft', desc: 'A structured note in clear, professional language.' },
  { icon: ShieldCheck, title: 'Review and approve', desc: 'Nothing is final until you have checked it.' },
];

const noteTypes = [
  { icon: ClipboardList, label: 'Daily logs' },
  { icon: AlertTriangle, label: 'Incident reports' },
  { icon: ArrowLeftRight, label: 'Handover notes' },
  { icon: Pill, label: 'Medication notes' },
];

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return "That email and password don't match. Try again, or reset your password.";
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link we sent you.';
  if (m.includes('already registered')) return 'There is already an account with this email. Try signing in instead.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a few minutes and try again.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'We could not connect. Please check your internet connection.';
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

        <div className="relative px-6 py-6 sm:px-10 lg:px-14 lg:py-14 lg:h-full flex flex-col">
          <Logo tone="light" />

          <div className="mt-8 lg:mt-auto lg:mb-auto max-w-lg">
            {FREE_ACCESS && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold bg-white/15 border border-white/20 rounded-full px-3.5 py-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
                Free to use for a limited time
              </span>
            )}
            <h1 className="text-[1.75rem] leading-tight sm:text-4xl font-extrabold tracking-tight">
              Professional care notes,<br />
              <span className="text-brand-100">written with you.</span>
            </h1>
            <p className="mt-4 text-brand-50/90 text-base sm:text-lg leading-relaxed">
              Add your observations from the shift and myCareNotes drafts a clear, person-centred
              record in UK English. You review it, make any changes and approve it before it is used.
            </p>

            {/* How it works — hidden on small phones to keep the form close to the top */}
            <ol className="mt-8 space-y-4 hidden sm:block">
              {steps.map(({ icon: Icon, title, desc }, i) => (
                <li key={title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">
                      <span className="text-brand-200 mr-1.5">{i + 1}.</span>{title}
                    </p>
                    <p className="text-sm text-brand-50/80 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 hidden sm:flex flex-wrap gap-2">
              {noteTypes.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-sm font-medium bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                  <Icon size={14} className="text-brand-100" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=myCareNotes%20for%20our%20care%20service`}
            className="mt-8 hidden lg:flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl px-5 py-4 transition-colors max-w-lg"
          >
            <Building2 size={20} className="text-brand-100 flex-shrink-0" />
            <span className="text-sm leading-relaxed">
              <span className="font-semibold">Run a care service?</span>{' '}
              <span className="text-brand-50/85">Get in touch to set up myCareNotes for your team.</span>
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
                  ? <>We've sent a link to <strong className="text-slate-900">{sentTo.email}</strong>. Click it to confirm your account and you'll be signed straight in.</>
                  : <>If there's an account for <strong className="text-slate-900">{sentTo.email}</strong>, we've sent a link to set a new password.</>}
              </p>
              <p className="mt-3 text-sm text-slate-500">Can't see it? Check your junk or spam folder.</p>
              <button onClick={() => switchMode('login')} className="btn-secondary w-full mt-7">
                <ArrowLeft size={16} />
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">
                  {mode === 'login' ? 'Welcome back' : mode === 'forgot' ? 'Reset your password' : 'Create your free account'}
                </h2>
                <p className="mt-1.5 text-slate-600">
                  {mode === 'login'
                    ? 'Sign in to write and find your care notes.'
                    : mode === 'forgot'
                    ? "Enter your email and we'll send you a link to set a new password."
                    : FREE_ACCESS
                    ? 'Free for a limited time. No card needed.'
                    : 'Your first 2 notes are free. No card needed.'}
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
                      <label htmlFor="name" className="field-label">Your name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sarah Ahmed"
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
                        placeholder="you@example.co.uk"
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
                        Please wait…
                      </>
                    ) : (
                      <>
                        {mode === 'login' ? 'Sign in' : mode === 'forgot' ? 'Send reset link' : 'Create free account'}
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

              {mode === 'signup' && !FREE_ACCESS && (
                <p className="mt-4 text-sm text-slate-600 text-center">
                  2 free notes included.{' '}
                  {PAYMENTS_ENABLED ? 'Paid plans from £1.99.' : 'Paid plans coming soon.'}
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
              <span className="font-semibold text-slate-900">Run a care service?</span> Get in touch about team access.
            </span>
          </a>

          <p className="text-center text-sm text-slate-500 mt-6 leading-relaxed">
            Always review AI-written notes before adding them to official care records.
          </p>
        </div>
      </main>
    </div>
  );
}
