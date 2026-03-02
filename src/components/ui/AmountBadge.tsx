interface AmountBadgeProps {
  cents: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function AmountBadge({ cents, size = 'md' }: AmountBadgeProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);

  const sizeClass =
    size === 'sm'
      ? 'text-sm font-medium'
      : size === 'lg'
        ? 'text-2xl font-bold'
        : 'text-lg font-semibold';

  return <span className={`text-accent tabular-nums ${sizeClass}`}>{formatted}</span>;
}
