import type { GiftCard } from '@/types';

// Card factory used by forms before submitting to the cards API.
export function createCard(
  input: Pick<GiftCard, 'merchant' | 'amount' | 'code' | 'pin'>
): GiftCard {
  const now = new Date().toISOString();
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    providerId: null,
    coordinates: null,
  };
}
