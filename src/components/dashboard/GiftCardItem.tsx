'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSwipeable } from 'react-swipeable';
import type { GiftCard } from '@/types';
import CopyButton from '@/components/ui/CopyButton';
import AmountBadge from '@/components/ui/AmountBadge';

const SWIPE_THRESHOLD = 80; // px — minimum swipe to trigger delete

type CodeType = 'barcode' | 'qr';

interface GiftCardItemProps {
  card: GiftCard;
  onDelete: (id: string) => void;
}

export default function GiftCardItem({ card, onDelete }: GiftCardItemProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeType, setCodeType] = useState<CodeType>('barcode');
  const [barcodeError, setBarcodeError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Render barcode/QR to canvas whenever overlay is open or type changes
  useEffect(() => {
    if (!showCode || !canvasRef.current) return;

    setBarcodeError(false);
    const canvas = canvasRef.current;
    const rawCode = card.code.replace(/\s/g, '');

    import('bwip-js').then((mod) => {
      const bwipjs = mod.default ?? mod;
      try {
        if (codeType === 'qr') {
          bwipjs.toCanvas(canvas, {
            bcid: 'qrcode',
            text: rawCode,
            scale: 3,
          });
        } else {
          bwipjs.toCanvas(canvas, {
            bcid: 'code128',
            text: rawCode,
            scale: 3,
            height: 12,
            includetext: true,
            textxalign: 'center',
          });
        }
      } catch {
        setBarcodeError(true);
      }
    });
  }, [showCode, codeType, card.code]);

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
    <>
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

            {/* Edit button */}
            <Link
              href={`/edit/${card.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors"
              aria-label="Edit card"
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
          </div>

          {/* Code row */}
          <div className="flex items-center justify-between bg-bg rounded-lg px-3 py-2 mb-2">
            <span className="font-mono text-sm text-gray-300 tracking-widest truncate mr-2">
              {formatCode(card.code)}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Barcode button */}
              <button
                onClick={() => setShowCode(true)}
                className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors"
                aria-label="Show barcode"
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
                  <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14" />
                  <path d="M3 4h2M9 4h2M15 4h2M3 20h2M9 20h2M15 20h2" />
                </svg>
              </button>
              <CopyButton value={card.code} />
            </div>
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

      {/* Barcode / QR modal — centered on screen */}
      {showCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
          onClick={() => setShowCode(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="font-semibold text-gray-900 text-base leading-tight">
                  {card.merchant}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-1 break-all">
                  {card.code}
                </p>
              </div>
              <button
                onClick={() => setShowCode(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-3 flex-shrink-0"
                aria-label="Close"
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

            {/* Canvas — constrained so it never overflows */}
            <div className="flex items-center justify-center bg-white rounded-xl p-4 mb-5 border border-gray-100">
              {barcodeError ? (
                <p className="text-sm text-red-500 text-center py-8">
                  Could not render {codeType === 'qr' ? 'QR code' : 'barcode'}
                  {' '}for this code.
                  <br />
                  <span className="text-gray-400">
                    Try switching to{' '}
                    {codeType === 'qr' ? 'Barcode' : 'QR Code'}.
                  </span>
                </p>
              ) : (
                <canvas
                  ref={canvasRef}
                  style={{ maxWidth: '100%', maxHeight: '220px' }}
                />
              )}
            </div>

            {/* Format toggle */}
            <div className="flex gap-2">
              {(['barcode', 'qr'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setCodeType(type)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    codeType === type
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {type === 'barcode' ? 'Barcode' : 'QR Code'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
