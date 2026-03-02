import type { GiftCard } from '@/types';

const STORAGE_KEY = 'giftkeep_cards_v1';

// ─── Read ─────────────────────────────────────────────────────────────────────

export function loadCards(): GiftCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as GiftCard[];
  } catch {
    // Corrupted data — reset silently, never crash
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

function saveCards(cards: GiftCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function addCard(card: GiftCard): GiftCard[] {
  const cards = loadCards();
  const updated = [card, ...cards]; // prepend — newest first
  saveCards(updated);
  return updated;
}

export function deleteCard(id: string): GiftCard[] {
  const cards = loadCards();
  const updated = cards.filter((c) => c.id !== id);
  saveCards(updated);
  return updated;
}

export function updateCard(updated: GiftCard): GiftCard[] {
  const cards = loadCards();
  const next = cards.map((c) => (c.id === updated.id ? updated : c));
  saveCards(next);
  return next;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

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
