'use client';

import { useGiftCards } from '@/context/GiftCardContext';
import MerchantGroup from './MerchantGroup';
import EmptyState from '@/components/ui/EmptyState';
import AmountBadge from '@/components/ui/AmountBadge';

export default function Dashboard() {
  const { groups, cards, isHydrated } = useGiftCards();

  const totalBalance = cards.reduce((sum, c) => sum + c.amount, 0);

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
      <header className="px-4 pt-12 pb-6">
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
      </header>

      {/* Content */}
      <main className="flex-1 px-4">
        {groups.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {groups.map((group, i) => (
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
