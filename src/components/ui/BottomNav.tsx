'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-white/5 pb-safe">
      <div className="max-w-md mx-auto flex">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
            pathname === '/'
              ? 'text-accent'
              : 'text-gray-500 hover:text-gray-300'
          }`}
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
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
          Wallet
        </Link>

        <Link
          href="/add"
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
            pathname === '/add'
              ? 'text-accent'
              : 'text-gray-500 hover:text-gray-300'
          }`}
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="16" />
            <line x1="8" x2="16" y1="12" y2="12" />
          </svg>
          Add Card
        </Link>
      </div>
    </nav>
  );
}
