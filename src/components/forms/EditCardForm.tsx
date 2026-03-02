'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useGiftCards } from '@/context/GiftCardContext';
import type { GiftCard } from '@/types';

interface FormFields {
  merchant: string;
  amount: string;
  code: string;
  pin: string;
}

interface FormErrors {
  merchant?: string;
  amount?: string;
  code?: string;
  pin?: string;
}

interface EditCardFormProps {
  card: GiftCard;
}

export default function EditCardForm({ card }: EditCardFormProps) {
  const router = useRouter();
  const { cards, dispatch } = useGiftCards();

  const [fields, setFields] = useState<FormFields>({
    merchant: card.merchant,
    amount: (card.amount / 100).toFixed(2),
    code: card.code,
    pin: card.pin ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPin, setShowPin] = useState(false);

  // Unique merchant names for datalist autocomplete (excluding current card's merchant)
  const merchantNames = [...new Set(cards.map((c) => c.merchant))].sort();

  function validate(): boolean {
    const next: FormErrors = {};

    const trimmedMerchant = fields.merchant.trim();
    if (!trimmedMerchant) {
      next.merchant = 'Merchant name is required';
    } else if (trimmedMerchant.length > 60) {
      next.merchant = 'Merchant name must be 60 characters or less';
    }

    const amt = parseFloat(fields.amount);
    if (!fields.amount || isNaN(amt)) {
      next.amount = 'Enter a valid amount (e.g. 25.00)';
    } else if (amt <= 0) {
      next.amount = 'Amount must be greater than $0.00';
    } else if (amt > 10000) {
      next.amount = 'Amount must be $10,000 or less';
    }

    const trimmedCode = fields.code.trim();
    if (!trimmedCode) {
      next.code = 'Card code is required';
    } else if (trimmedCode.length < 4) {
      next.code = 'Code must be at least 4 characters';
    } else if (trimmedCode.length > 100) {
      next.code = 'Code must be 100 characters or less';
    }

    const trimmedPin = fields.pin.trim();
    if (trimmedPin && !/^\d{4,10}$/.test(trimmedPin)) {
      next.pin = 'PIN must be 4–10 digits';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(field: keyof FormFields, value: string) {
    setFields((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const updated: GiftCard = {
      ...card,
      merchant: fields.merchant.trim(),
      amount: Math.round(parseFloat(fields.amount) * 100),
      code: fields.code.trim(),
      pin: fields.pin.trim() || null,
      updatedAt: new Date().toISOString(),
    };

    await dispatch({ type: 'UPDATE_CARD', payload: updated });
    router.push('/');
  }

  async function handleDelete() {
    if (!confirm(`Delete this ${card.merchant} card? This cannot be undone.`)) return;
    await dispatch({ type: 'DELETE_CARD', payload: card.id });
    router.push('/');
  }

  return (
    <div className="flex flex-col flex-1 px-4">
      {/* Header */}
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
        <h1 className="text-2xl font-bold text-gray-100">Edit Card</h1>
        <p className="text-sm text-gray-500 mt-1">Update the card details below</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1" noValidate>
        {/* Merchant */}
        <div>
          <label
            htmlFor="merchant"
            className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
          >
            Merchant
          </label>
          <input
            id="merchant"
            type="text"
            list="merchant-list"
            value={fields.merchant}
            onChange={(e) => handleChange('merchant', e.target.value)}
            placeholder="e.g. Starbucks"
            autoComplete="off"
            className={`w-full bg-card border rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600
              focus:outline-none focus:border-accent/60 transition-colors
              ${errors.merchant ? 'border-danger' : 'border-white/10'}`}
          />
          <datalist id="merchant-list">
            {merchantNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {errors.merchant && (
            <p className="mt-1.5 text-xs text-danger">{errors.merchant}</p>
          )}
        </div>

        {/* Balance */}
        <div>
          <label
            htmlFor="amount"
            className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
          >
            Balance
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              id="amount"
              type="number"
              min="0.01"
              max="10000"
              step="0.01"
              value={fields.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="0.00"
              className={`w-full bg-card border rounded-xl pl-8 pr-4 py-3 text-gray-100 placeholder-gray-600
                focus:outline-none focus:border-accent/60 transition-colors tabular-nums
                ${errors.amount ? 'border-danger' : 'border-white/10'}`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1.5 text-xs text-danger">{errors.amount}</p>
          )}
        </div>

        {/* Card Code */}
        <div>
          <label
            htmlFor="code"
            className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
          >
            Card Code
          </label>
          <input
            id="code"
            type="text"
            value={fields.code}
            onChange={(e) => handleChange('code', e.target.value)}
            placeholder="e.g. 6038 4910 2384 7562"
            autoComplete="off"
            spellCheck={false}
            className={`w-full bg-card border rounded-xl px-4 py-3 font-mono text-gray-100 placeholder-gray-600
              tracking-wider focus:outline-none focus:border-accent/60 transition-colors
              ${errors.code ? 'border-danger' : 'border-white/10'}`}
          />
          {errors.code && (
            <p className="mt-1.5 text-xs text-danger">{errors.code}</p>
          )}
        </div>

        {/* PIN */}
        <div>
          <label
            htmlFor="pin"
            className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
          >
            PIN{' '}
            <span className="normal-case text-gray-600 tracking-normal font-normal">
              (optional)
            </span>
          </label>
          <div className="relative">
            <input
              id="pin"
              type={showPin ? 'text' : 'password'}
              value={fields.pin}
              onChange={(e) => handleChange('pin', e.target.value)}
              placeholder="e.g. 1234"
              autoComplete="off"
              inputMode="numeric"
              className={`w-full bg-card border rounded-xl px-4 py-3 pr-12 font-mono text-gray-100
                placeholder-gray-600 tracking-widest focus:outline-none focus:border-accent/60
                transition-colors ${errors.pin ? 'border-danger' : 'border-white/10'}`}
            />
            <button
              type="button"
              onClick={() => setShowPin((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors p-1"
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" x2="23" y1="1" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.pin && (
            <p className="mt-1.5 text-xs text-danger">{errors.pin}</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pb-4 flex flex-col gap-3">
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-dim text-white font-semibold py-4 rounded-xl
              transition-colors active:scale-[0.98]"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full border border-danger/40 text-danger hover:bg-danger/10 font-medium py-3.5
              rounded-xl transition-colors active:scale-[0.98]"
          >
            Delete Card
          </button>
        </div>
      </form>
    </div>
  );
}
