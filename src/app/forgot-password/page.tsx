'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const origin = window.location.origin;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/auth/callback?type=recovery`,
    });

    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-svh px-4 flex items-center">
      <div className="w-full bg-card border border-white/10 rounded-2xl p-6">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">
          GiftKeep
        </p>
        <h1 className="text-2xl font-bold text-gray-100 mb-1">Reset password</h1>
        <p className="text-sm text-gray-500 mb-6">
          {sent
            ? "If an account exists for that email, you'll receive a reset link shortly."
            : "We'll send a reset link to your email address."}
        </p>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-gray-100
                  placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent hover:bg-accent-dim text-white font-semibold py-3.5 rounded-xl
                transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="block w-full mt-4 text-sm text-center text-gray-500 hover:text-gray-300 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
