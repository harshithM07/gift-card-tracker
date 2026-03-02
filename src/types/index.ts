// ─── Core entity ─────────────────────────────────────────────────────────────

export interface GiftCard {
  id: string;
  merchant: string;
  amount: number;          // stored in cents to avoid float errors ($18.75 = 1875)
  code: string;
  pin: string | null;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601

  // Future-proofing hooks — null in Phase 1
  providerId: string | null;   // Phase 3: API provider for balance checks
  coordinates: { lat: number; lng: number } | null;  // Phase 3: geofencing
}

// ─── Derived view model ───────────────────────────────────────────────────────

export interface MerchantGroup {
  merchant: string;    // original casing for display
  merchantKey: string; // lowercase trimmed — used as grouping key
  cards: GiftCard[];   // sorted newest-first
  totalAmount: number; // sum in cents
}

// ─── State ────────────────────────────────────────────────────────────────────

export type AppState = {
  cards: GiftCard[];
  isHydrated: boolean; // prevents SSR/localStorage flash
};

export type AppAction =
  | { type: 'HYDRATE'; payload: GiftCard[] }
  | { type: 'ADD_CARD'; payload: GiftCard }
  | { type: 'DELETE_CARD'; payload: string }   // id
  | { type: 'UPDATE_CARD'; payload: GiftCard }; // full replacement
