'use client';

import { useMemo, useState } from 'react';

interface MerchantComboboxProps {
  id: string;
  value: string;
  options: string[];
  placeholder: string;
  hasError?: boolean;
  onChange: (value: string) => void;
}

export default function MerchantCombobox({
  id,
  value,
  options,
  placeholder,
  hasError = false,
  onChange,
}: MerchantComboboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return options.slice(0, 8);
    return options
      .filter((opt) => opt.toLowerCase().includes(query))
      .slice(0, 8);
  }, [options, value]);

  const exactMatch = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return true;
    return options.some((opt) => opt.toLowerCase() === query);
  }, [options, value]);

  function commitValue(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setOpen(true);
            return;
          }

          if (!open) return;

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[activeIndex]) {
              commitValue(filtered[activeIndex]);
            } else if (value.trim()) {
              commitValue(value.trim());
            }
            return;
          }
          if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        autoComplete="new-password"
        spellCheck={false}
        className={`w-full bg-card border rounded-xl px-4 py-3 pr-11 text-gray-100 placeholder-gray-600
          focus:outline-none focus:border-accent/60 transition-colors
          ${hasError ? 'border-danger' : 'border-white/10'}`}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300"
        aria-label="Toggle merchant options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-white/10 bg-bg shadow-xl">
          <div className="px-3 py-2 text-[11px] uppercase tracking-widest text-gray-500 border-b border-white/5">
            Suggested merchants
          </div>

          {filtered.length > 0 ? (
            <div className="max-h-56 overflow-auto py-1">
              {filtered.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commitValue(option)}
                  className={`block w-full text-left px-3 py-2.5 text-sm transition-colors ${
                    index === activeIndex
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-3 text-sm text-gray-500">No matching merchants</p>
          )}

          {value.trim() && !exactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commitValue(value.trim())}
              className="block w-full text-left px-3 py-2.5 border-t border-white/5 text-sm text-gray-300 hover:bg-white/5"
            >
              Use custom: <span className="text-gray-100">{value.trim()}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
