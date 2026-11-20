import { X, Zap, Package, Infinity, Mail, Building2, Clock } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PAYMENTS_ENABLED, SUPPORT_EMAIL } from '../lib/config';

interface Props {
  onClose: () => void;
}

const CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;

type Plan = 'credits_10' | 'credits_50' | 'monthly';

const features: Record<Plan, string[]> = {
  credits_10: [
    'Simple, secure & accessible anytime',
    'All note types included',
    'Credits never expire',
  ],
  credits_50: [
    'Simple, secure & accessible anytime',
    'All note types included',
    'Credits never expire',
  ],
  monthly: [
    'Unlimited notes — no credits needed',
    'Access anytime, from anywhere',
    'Cancel anytime',
  ],
};

export default function PricingModal({ onClose }: Props) {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState('');

  const handlePurchase = async (plan: Plan) => {
    setLoading(plan);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in.');

      const res = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
        }),
      });

      const rawText = await res.text();
      let data: { error?: string; url?: string } = {};
      try { data = JSON.parse(rawText); } catch { /* not JSON */ }
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}: ${rawText.slice(0, 300)}`);
      window.location.href = data.url!;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setLoading(null);
    }
  };

  if (!PAYMENTS_ENABLED) {
    const plans = [
      { icon: Zap, name: '10 notes', price: '£1.99', note: 'one-off' },
      { icon: Package, name: '50 notes', price: '£4.99', note: 'one-off' },
      { icon: Infinity, name: 'Unlimited', price: '£9.99', note: 'per month' },
    ];
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm sm:px-4" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="plans-title"
          className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full px-2.5 py-1 mb-3">
                <Clock size={12} /> Coming soon
              </span>
              <h2 id="plans-title" className="text-xl font-bold tracking-tight">Paid plans are on the way</h2>
              <p className="text-slate-600 mt-1">We're putting the finishing touches to payments. Here's what's planned:</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-10 h-10 -mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>

          <div className="px-6 grid grid-cols-3 gap-2.5">
            {plans.map(({ icon: Icon, name, price, note }) => (
              <div key={name} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <Icon size={18} className="mx-auto text-brand-600" />
                <p className="mt-2 text-sm font-semibold text-slate-900">{name}</p>
                <p className="text-lg font-bold text-slate-900">{price}</p>
                <p className="text-xs text-slate-500">{note}</p>
              </div>
            ))}
          </div>

          <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=More%20myCareNotes%20credits`} className="btn-primary w-full">
              <Mail size={17} /> Need more notes now? Email us
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=myCareNotes%20for%20our%20care%20service`} className="btn-secondary w-full">
              <Building2 size={17} /> Care provider? Ask about team access
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Choose a plan</h2>
            <p className="text-sm text-gray-500 mt-0.5">Generate professional care notes instantly</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* 10-credit pack */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Zap size={18} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Credit Pack – 10 Notes</h3>
                  <p className="text-xs text-gray-500">Pay-as-you-go, no expiry</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">£1.99</p>
                <p className="text-xs text-gray-400">one-time</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {features.credits_10.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePurchase('credits_10')}
              disabled={loading !== null}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {loading === 'credits_10' ? 'Redirecting...' : 'Buy 10 Credits — £1.99'}
            </button>
          </div>

          {/* 50-credit pack */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Package size={18} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Credit Pack – 50 Notes</h3>
                  <p className="text-xs text-gray-500">Cost-effective bulk pack, no expiry</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">£4.99</p>
                <p className="text-xs text-gray-400">one-time</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {features.credits_50.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePurchase('credits_50')}
              disabled={loading !== null}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {loading === 'credits_50' ? 'Redirecting...' : 'Buy 50 Credits — £4.99'}
            </button>
          </div>

          {/* Monthly unlimited */}
          <div className="border-2 border-brand-500 rounded-xl p-5 relative shadow-sm">
            <div className="absolute -top-3 left-5">
              <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</span>
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                  <Infinity size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Monthly Unlimited</h3>
                  <p className="text-xs text-gray-500">Unlimited notes per month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">£9.99</p>
                <p className="text-xs text-gray-400">per month</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {features.monthly.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePurchase('monthly')}
              disabled={loading !== null}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {loading === 'monthly' ? 'Redirecting...' : 'Subscribe — £9.99/mo'}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <p className="text-xs text-center text-gray-400">
            Secure payment via Stripe. Cancel subscription any time.
          </p>
        </div>
      </div>
    </div>
  );
}
