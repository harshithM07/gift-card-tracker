'use client';

import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { GiftCard } from '@/types';
import CopyButton from '@/components/ui/CopyButton';
import AmountBadge from '@/components/ui/AmountBadge';

const SWIPE_THRESHOLD = 80; // px — minimum swipe to trigger delete

interface GiftCardItemProps {
  card: GiftCard;
  onDelete: (id: string) => void;
}

export default function GiftCardItem({ card, onDelete }: GiftCardItemProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handlers = useSwipeable({
    onSwiping: ({ deltaX }) => {
      if (deleting) return;
      if (deltaX < 0) {
        setOffsetX(Math.max(deltaX, -160)); // cap at -160px
      }
    },
    onSwipedLeft: ({ deltaX }) => {
      if (deleting) return;
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        setDeleting(true);
        setOffsetX(-400); // animate off screen
        setTimeout(() => onDelete(card.id), 260);
      } else {
        setOffsetX(0); // snap back
      }
    },
    onSwipedRight: () => {
      if (!deleting) setOffsetX(0);
    },
    trackMouse: true,          // enables desktop drag testing
    preventScrollOnSwipe: true, // critical for iOS Safari vertical scroll
    delta: 10,
  });

  // Format code with spaces for readability (every 4 chars if all digits)
  function formatCode(code: string): string {
    const isNumeric = /^\d+$/.test(code.replace(/[\s-]/g, ''));
    if (isNumeric) {
      const clean = code.replace(/\s/g, '');
      return clean.match(/.{1,4}/g)?.join(' ') ?? code;
    }
    return code;
  }

  return (
    <div className="relative overflow-hidden rounded-xl mb-2">
      {/* Delete background — revealed as card slides left */}
      <div
        className="absolute inset-0 bg-danger flex items-center justify-end pr-5 rounded-xl"
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      </div>

      {/* Card body */}
      <div
        {...handlers}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition:
            offsetX === 0 || deleting ? 'transform 0.25s ease' : 'none',
        }}
        className="relative bg-card border border-white/5 rounded-xl p-4 no-select cursor-grab active:cursor-grabbing"
      >
        {/* Top row: amount */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 rounded-full bg-accent opacity-60" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider leading-none mb-1">
                Balance
              </p>
              <AmountBadge cents={card.amount} size="lg" />
            </div>
          </div>

          {/* Swipe hint */}
          <p className="text-[10px] text-gray-600 mt-1 select-none">
            ← swipe to delete
          </p>
        </div>

        {/* Code row */}
        <div className="flex items-center justify-between bg-bg rounded-lg px-3 py-2 mb-2">
          <span className="font-mono text-sm text-gray-300 tracking-widest truncate mr-2">
            {formatCode(card.code)}
          </span>
          <CopyButton value={card.code} />
        </div>

        {/* PIN row */}
        {card.pin && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 uppercase tracking-wider">
                PIN
              </span>
              <span className="font-mono text-sm text-gray-400">
                {showPin ? card.pin : '••••'}
              </span>
            </div>
            <button
              onClick={() => setShowPin((p) => !p)}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-2 py-1"
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? (
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
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" x2="23" y1="1" y2="23" />
                </svg>
              ) : (
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
