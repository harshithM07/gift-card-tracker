import type { GiftCard } from '@/types';

// Card factory used by forms before submitting to the cards API.
export function createCard(
  input: Pick<GiftCard, 'merchant' | 'merchantId' | 'amount' | 'code' | 'pin'>
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

// Maps a Supabase snake_case row to the camelCase GiftCard shape.
export function rowToCard(row: Record<string, unknown>): GiftCard {
  const merchantValue =
    typeof row.merchant === 'string' && row.merchant.trim()
      ? row.merchant
      : typeof row.merchant_name === 'string' && row.merchant_name.trim()
        ? row.merchant_name
        : 'Unknown Merchant';

  return {
    id: row.id as string,
    merchant: merchantValue,
    merchantId: (row.merchant_id as string | null) ?? null,
    amount: row.amount as number,
    code: row.code as string,
    pin: (row.pin as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    providerId: (row.provider_id as string | null) ?? null,
    coordinates: null,
  };
}
