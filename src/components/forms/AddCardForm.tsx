'use client';

import { useState, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useGiftCards } from '@/context/GiftCardContext';
import { createCard } from '@/lib/storage';

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

function CameraIcon() {
  return (
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function AddCardForm() {
  const router = useRouter();
  const { cards, dispatch } = useGiftCards();

  const [fields, setFields] = useState<FormFields>({
    merchant: '',
    amount: '',
    code: '',
    pin: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPin, setShowPin] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Unique merchant names for datalist autocomplete
  const merchantNames = [...new Set(cards.map((c) => c.merchant))].sort();

  function validate(): boolean {
    const next: FormErrors = {};

    // Merchant
    const trimmedMerchant = fields.merchant.trim();
    if (!trimmedMerchant) {
      next.merchant = 'Merchant name is required';
    } else if (trimmedMerchant.length > 60) {
      next.merchant = 'Merchant name must be 60 characters or less';
    }

    // Amount
    const amt = parseFloat(fields.amount);
    if (!fields.amount || isNaN(amt)) {
      next.amount = 'Enter a valid amount (e.g. 25.00)';
    } else if (amt <= 0) {
      next.amount = 'Amount must be greater than $0.00';
    } else if (amt > 10000) {
      next.amount = 'Amount must be $10,000 or less';
    }

    // Code
    const trimmedCode = fields.code.trim();
    if (!trimmedCode) {
      next.code = 'Card code is required';
    } else if (trimmedCode.length < 4) {
      next.code = 'Code must be at least 4 characters';
    } else if (trimmedCode.length > 100) {
      next.code = 'Code must be 100 characters or less';
    }

    // PIN — optional, but if provided must be 4–10 digits
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

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanError(null);

    const body = new FormData();
    body.append('image', file);

    try {
      const res = await fetch('/api/scan', { method: 'POST', body });

      // Parse JSON safely — a server error page would be HTML, not JSON
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        throw new Error('Scan failed — please try again.');
      }
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Scan failed');

      if (!data.merchant && !data.code && !data.pin) {
        setScanError('No card details found — please enter manually.');
        return;
      }

      setFields((f) => ({
        ...f,
        merchant: data.merchant ?? f.merchant,
        code: data.code ?? f.code,
        pin: data.pin ?? f.pin,
      }));
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : 'Scan failed. Please try again.'
      );
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const cents = Math.round(parseFloat(fields.amount) * 100);
    const card = createCard({
      merchant: fields.merchant.trim(),
      amount: cents,
      code: fields.code.trim(),
      pin: fields.pin.trim() || null,
    });

    await dispatch({ type: 'ADD_CARD', payload: card });
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
        <h1 className="text-2xl font-bold text-gray-100">Add Gift Card</h1>
        <p className="text-sm text-gray-500 mt-1">
          Scan a photo or enter the details manually
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1" noValidate>
        {/* ── Scan section ───────────────────────────────────────────────── */}

        {/* Hidden inputs — camera opens native camera, file opens gallery/picker */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleScan}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleScan}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={scanning}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-accent/30
              bg-accent/5 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50
              disabled:cursor-not-allowed font-medium text-sm"
          >
            {scanning ? (
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <CameraIcon />
            )}
            {scanning ? 'Scanning…' : 'Take Photo'}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10
              bg-white/5 text-gray-400 hover:bg-white/10 transition-colors disabled:opacity-50
              disabled:cursor-not-allowed font-medium text-sm"
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
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            Upload Photo
          </button>
        </div>

        {scanError && (
          <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2.5">
            {scanError}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-gray-600">or enter manually</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* ── Form fields ────────────────────────────────────────────────── */}

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

        {/* Submit */}
        <div className="mt-auto pb-4">
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-dim text-white font-semibold py-4 rounded-xl
              transition-colors active:scale-[0.98]"
          >
            Save Card
          </button>
        </div>
      </form>
    </div>
  );
}
