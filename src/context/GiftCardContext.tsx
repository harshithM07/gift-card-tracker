'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type { GiftCard, MerchantGroup, AppState, AppAction } from '@/types';
import { groupByMerchant } from '@/lib/groupByMerchant';
import { useAuth } from '@/context/AuthContext';

// ─── Reducer (pure — no side effects) ────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { cards: action.payload, isHydrated: true };
    case 'ADD_CARD':
      return { ...state, cards: [action.payload, ...state.cards] };
    case 'DELETE_CARD':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.payload) };
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface GiftCardContextValue {
  groups: MerchantGroup[];
  cards: GiftCard[];
  isHydrated: boolean;
  dispatch: (action: AppAction) => Promise<void>;
}

const GiftCardContext = createContext<GiftCardContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GiftCardProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [state, localDispatch] = useReducer(reducer, {
    cards: [],
    isHydrated: false,
  });

  // Hydrate card data from the authenticated cards API whenever user changes.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      localDispatch({ type: 'HYDRATE', payload: [] });
      return;
    }

    let cancelled = false;
    fetch('/api/cards', { method: 'GET' })
      .then(async (res) => {
        if (!res.ok) return [];
        const data = (await res.json()) as { cards?: GiftCard[] };
        return Array.isArray(data.cards) ? data.cards : [];
      })
      .then((cards) => {
        if (!cancelled) {
          localDispatch({ type: 'HYDRATE', payload: cards });
        }
      })
      .catch(() => {
        if (!cancelled) {
          localDispatch({ type: 'HYDRATE', payload: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const dispatch = useCallback(
    async (action: AppAction) => {
      if (!user) return;

      if (action.type === 'HYDRATE') {
        localDispatch(action);
        return;
      }

      if (action.type === 'ADD_CARD') {
        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchant: action.payload.merchant,
            merchantId: action.payload.merchantId,
            amount: action.payload.amount,
            code: action.payload.code,
            pin: action.payload.pin,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { card?: GiftCard };
        if (data.card) {
          localDispatch({ type: 'ADD_CARD', payload: data.card });
        }
        return;
      }

      if (action.type === 'UPDATE_CARD') {
        const res = await fetch(`/api/cards/${action.payload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchant: action.payload.merchant,
            merchantId: action.payload.merchantId,
            amount: action.payload.amount,
            code: action.payload.code,
            pin: action.payload.pin,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { card?: GiftCard };
        if (data.card) {
          localDispatch({ type: 'UPDATE_CARD', payload: data.card });
        }
        return;
      }

      if (action.type === 'DELETE_CARD') {
        const res = await fetch(`/api/cards/${action.payload}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          localDispatch(action);
        }
      }
    },
    [user]
  );

  const groups = useMemo(() => groupByMerchant(state.cards), [state.cards]);

  return (
    <GiftCardContext.Provider
      value={{ groups, cards: state.cards, isHydrated: state.isHydrated, dispatch }}
    >
      {children}
    </GiftCardContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGiftCards() {
  const ctx = useContext(GiftCardContext);
  if (!ctx) throw new Error('useGiftCards must be used within GiftCardProvider');
  return ctx;
}
