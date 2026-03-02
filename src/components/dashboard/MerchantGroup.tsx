'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MerchantGroup as MerchantGroupType } from '@/types';
import { useGiftCards } from '@/context/GiftCardContext';
import GiftCardItem from './GiftCardItem';
import AmountBadge from '@/components/ui/AmountBadge';

interface MerchantGroupProps {
  group: MerchantGroupType;
  defaultOpen?: boolean;
}

export default function MerchantGroup({
  group,
  defaultOpen = false,
}: MerchantGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { dispatch } = useGiftCards();

  function handleDelete(id: string) {
    void dispatch({ type: 'DELETE_CARD', payload: id });
  }

  const cardCount = group.cards.length;

  return (
    <div className="mb-3">
      {/* Accordion header */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-white/5
          hover:bg-card-hover transition-colors no-select"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {/* Merchant initial avatar */}
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-bold text-sm">
              {group.merchant.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-gray-100">
              {group.merchant}
            </p>
            <p className="text-xs text-gray-500">
              {cardCount} {cardCount === 1 ? 'card' : 'cards'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AmountBadge cents={group.totalAmount} size="sm" />

          {/* Chevron */}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-gray-500 flex-shrink-0"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </div>
      </button>

      {/* Cards */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              {group.cards.map((card) => (
                <GiftCardItem
                  key={card.id}
                  card={card}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
