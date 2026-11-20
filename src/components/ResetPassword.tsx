import { useState } from 'react';
import { LockIcon as Lock, EyeIcon as Eye, EyeSlashIcon as EyeOff, KeyIcon as KeyRound } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

export default function ResetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else onDone();
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-5 py-10">
      <div className="mb-8"><Logo /></div>
      <div className="card w-full max-w-md p-7">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
          <KeyRound size={22} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-1.5 text-slate-600">Choose a new password for your account.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="new-password" className="field-label">New password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="new-password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="field-input pl-11 pr-12"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  );
}
