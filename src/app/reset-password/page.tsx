'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (err) {
      setError(err.message);
    } else {
      router.replace('/');
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-svh px-4 flex items-center">
      <div className="w-full bg-card border border-white/10 rounded-2xl p-6">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">
          GiftKeep
        </p>
        <h1 className="text-2xl font-bold text-gray-100 mb-1">New password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-gray-100
                placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
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
            {submitting ? 'Saving…' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
