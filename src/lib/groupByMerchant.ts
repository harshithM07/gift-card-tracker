import type { GiftCard, MerchantGroup } from '@/types';

export function groupByMerchant(cards: GiftCard[]): MerchantGroup[] {
  const map = new Map<string, GiftCard[]>();

  for (const card of cards) {
    const key = card.merchant.trim().toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(card);
  }

  return Array.from(map.entries())
    .map(([key, groupCards]) => ({
      merchant: groupCards[0].merchant, // preserve original casing from first entry
      merchantKey: key,
      cards: [...groupCards].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      totalAmount: groupCards.reduce((sum, c) => sum + c.amount, 0),
    }))
    .sort((a, b) => a.merchant.localeCompare(b.merchant)); // alphabetical
}
