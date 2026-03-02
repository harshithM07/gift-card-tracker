import 'server-only';
import type { GiftCard } from '@/types';

const cardsByUserId = new Map<string, GiftCard[]>();

export function listCards(userId: string): GiftCard[] {
  return cardsByUserId.get(userId) ?? [];
}

export function createCardForUser(userId: string, input: {
  merchant: string;
  amount: number;
  code: string;
  pin: string | null;
}): GiftCard {
  const now = new Date().toISOString();
  const card: GiftCard = {
    id: crypto.randomUUID(),
    merchant: input.merchant,
    amount: input.amount,
    code: input.code,
    pin: input.pin,
    createdAt: now,
    updatedAt: now,
    providerId: null,
    coordinates: null,
  };

  const existing = cardsByUserId.get(userId) ?? [];
  cardsByUserId.set(userId, [card, ...existing]);
  return card;
}

export function updateCardForUser(userId: string, cardId: string, input: {
  merchant: string;
  amount: number;
  code: string;
  pin: string | null;
}): GiftCard | null {
  const existing = cardsByUserId.get(userId) ?? [];
  const target = existing.find((card) => card.id === cardId);
  if (!target) return null;

  const updated: GiftCard = {
    ...target,
    merchant: input.merchant,
    amount: input.amount,
    code: input.code,
    pin: input.pin,
    updatedAt: new Date().toISOString(),
  };

  cardsByUserId.set(
    userId,
    existing.map((card) => (card.id === cardId ? updated : card))
  );

  return updated;
}

export function deleteCardForUser(userId: string, cardId: string): boolean {
  const existing = cardsByUserId.get(userId) ?? [];
  const next = existing.filter((card) => card.id !== cardId);
  if (next.length === existing.length) return false;
  cardsByUserId.set(userId, next);
  return true;
}
