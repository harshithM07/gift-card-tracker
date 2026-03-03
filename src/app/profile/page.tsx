'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ProfilePage() {
  const router = useRouter();
  const { user, deleteAccount } = useAuth();

  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(currentPassword);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      setDeleteError(message);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleRequestDeleteConfirm() {
    setDeleteError(null);
    setCheckingPassword(true);

    try {
      const res = await fetch('/api/auth/reauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: currentPassword }),
      });

      const contentType = res.headers.get('content-type') ?? '';
      const data =
        contentType.includes('application/json')
          ? ((await res.json()) as { error?: string })
          : {};

      if (!res.ok) {
        setDeleteError(data.error ?? 'Could not verify password');
        return;
      }

      setShowDeleteConfirm(true);
    } catch {
      setDeleteError('Could not verify password');
    } finally {
      setCheckingPassword(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-100">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account details and preferences
        </p>
      </header>

      <main className="flex-1 pb-6 space-y-5">
        <section className="bg-card border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Email</p>
          <p className="text-sm text-gray-200 break-all">{user?.email ?? ''}</p>
        </section>

        <section className="bg-card border border-white/10 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-gray-100 mb-1">Display Name</h2>
          <p className="text-xs text-gray-500 mb-4">
            Placeholder for upcoming profile metadata.
          </p>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya"
              className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-gray-100
                placeholder-gray-600 focus:outline-none focus:border-accent/60 transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dim text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {saved ? 'Saved' : 'Save Name'}
            </button>
          </form>
        </section>

        <section className="border border-danger/30 rounded-2xl p-4 bg-danger/5">
          <h2 className="text-sm font-semibold text-danger mb-1">Danger Zone</h2>
          <p className="text-xs text-gray-400 mb-3">
            Permanently deletes your account and all gift cards.
          </p>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            autoComplete="current-password"
            disabled={deleting}
            className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-100
              placeholder-gray-700 focus:outline-none focus:border-danger/60 transition-colors mb-3
              disabled:opacity-50"
          />
          {deleteError && (
            <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2 mb-3">
              {deleteError}
            </p>
          )}
          <button
            onClick={handleRequestDeleteConfirm}
            disabled={!currentPassword || deleting || checkingPassword}
            className="w-full py-3 rounded-xl bg-danger text-white text-sm font-semibold
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-danger/80"
          >
            {checkingPassword ? 'Checking password...' : deleting ? 'Deleting...' : 'Delete account'}
          </button>
        </section>
      </main>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete account"
        message="This permanently deletes your account and all gift cards. This cannot be undone."
        confirmLabel="Delete account"
        busy={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
