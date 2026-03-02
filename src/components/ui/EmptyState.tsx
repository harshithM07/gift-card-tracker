import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-6 py-20">
      <div className="w-24 h-24 rounded-3xl bg-card border border-white/5 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-12 h-12 text-gray-600"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-200">No gift cards yet</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Add your first card and start tracking your balances in one place.
        </p>
      </div>

      <Link
        href="/add"
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dim text-white font-medium px-6 py-3 rounded-xl transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <line x1="12" x2="12" y1="5" y2="19" />
          <line x1="5" x2="19" y1="12" y2="12" />
        </svg>
        Add your first card
      </Link>
    </div>
  );
}
