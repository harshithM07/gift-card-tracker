'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface FormErrors {
  password?: string;
  confirm?: string;
}

export default function SecurityPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!password) {
      next.password = 'New password is required';
    } else if (password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    } else if (password.length > 72) {
      next.password = 'Password must be 72 characters or less';
    }

    if (confirmPassword !== password) {
      next.confirm = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setMessage('Password updated successfully.');
  }

  return (
    <div className="flex flex-col flex-1 px-4">
      <header className="pt-12 pb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <line x1="19" x2="5" y1="12" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-100">Security</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your account password
        </p>
      </header>

      <main className="flex-1 pb-6">
        <section className="bg-card border border-white/10 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-gray-100 mb-4">
            Change Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={`w-full bg-bg border rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600
                  focus:outline-none focus:border-accent/60 transition-colors
                  ${errors.password ? 'border-danger' : 'border-white/10'}`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-danger">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Repeat your new password"
                className={`w-full bg-bg border rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600
                  focus:outline-none focus:border-accent/60 transition-colors
                  ${errors.confirm ? 'border-danger' : 'border-white/10'}`}
              />
              {errors.confirm && (
                <p className="mt-1.5 text-xs text-danger">{errors.confirm}</p>
              )}
            </div>

            {message && (
              <p
                className={`text-sm rounded-lg px-3 py-2.5 ${
                  message.toLowerCase().includes('success')
                    ? 'text-accent bg-accent/10'
                    : 'text-danger bg-danger/10'
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-accent hover:bg-accent-dim text-white font-semibold py-3.5 rounded-xl
                transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Password'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
