'use client';

import { useState } from 'react';
import { useGiftCards } from '@/context/GiftCardContext';
import { useAuth } from '@/context/AuthContext';
import MerchantGroup from './MerchantGroup';
import EmptyState from '@/components/ui/EmptyState';
import AmountBadge from '@/components/ui/AmountBadge';

export default function Dashboard() {
  const { groups, cards, isHydrated } = useGiftCards();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');

  const totalBalance = cards.reduce((sum, c) => sum + c.amount, 0);

  const filteredGroups = query.trim()
    ? groups.filter((g) =>
        g.merchant.toLowerCase().includes(query.trim().toLowerCase())
      )
    : groups;

  // Show nothing until localStorage hydrates to avoid flash
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center flex-1 py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="px-4 pt-12 pb-4">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-5">
          GiftKeep
        </p>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 truncate pr-3">{user?.email}</p>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Log out
          </button>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          Total Balance
        </p>
        <AmountBadge cents={totalBalance} size="lg" />
        {cards.length > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'} across{' '}
            {groups.length} {groups.length === 1 ? 'merchant' : 'merchants'}
          </p>
        )}

        {/* Search — only shown when there are cards */}
        {groups.length > 0 && (
          <div className="relative mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search merchants…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-card border border-white/10 rounded-xl pl-9 pr-4 py-2.5
                text-sm text-gray-100 placeholder-gray-600
                focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pt-2">
        {groups.length === 0 ? (
          <EmptyState />
        ) : filteredGroups.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-12">
            No merchants matching &ldquo;{query}&rdquo;
          </p>
        ) : (
          <div>
            {filteredGroups.map((group, i) => (
              <MerchantGroup
                key={group.merchantKey}
                group={group}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
