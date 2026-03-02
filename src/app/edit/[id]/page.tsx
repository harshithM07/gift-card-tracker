'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGiftCards } from '@/context/GiftCardContext';
import EditCardForm from '@/components/forms/EditCardForm';

export default function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { cards, isHydrated } = useGiftCards();
  const router = useRouter();

  const card = cards.find((c) => c.id === id);

  useEffect(() => {
    if (isHydrated && !card) router.replace('/');
  }, [isHydrated, card, router]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center flex-1 py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) return null;

  return <EditCardForm card={card} />;
}
