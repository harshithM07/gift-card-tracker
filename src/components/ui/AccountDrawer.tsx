'use client';

import Link from 'next/link';
import { useCallback, useEffect } from 'react';

interface AccountDrawerProps {
  open: boolean;
  email: string | null | undefined;
  onClose: () => void;
  onLogout: () => Promise<void>;
}

export default function AccountDrawer({
  open,
  email,
  onClose,
  onLogout,
}: AccountDrawerProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
      />
      <aside
        className={`absolute top-0 right-0 h-full w-[88%] max-w-sm bg-card border-l border-white/10
          transition-transform duration-200 ease-out p-5 pt-10 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Account menu"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-1">
              Account
            </p>
            <p className="text-sm text-gray-400 break-all">{email ?? ''}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            aria-label="Close account menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 mb-8">
          <Link
            href="/profile"
            onClick={handleClose}
            className="block w-full text-left px-4 py-3 rounded-xl border border-white/10 text-sm
              text-gray-300 hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/security"
            onClick={handleClose}
            className="block w-full text-left px-4 py-3 rounded-xl border border-white/10 text-sm
              text-gray-300 hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            Security
          </Link>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 rounded-xl border border-white/10 text-sm
              text-gray-300 hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>
    </div>
  );
}
