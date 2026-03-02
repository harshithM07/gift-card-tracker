'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { GiftCard, MerchantGroup, AppState, AppAction } from '@/types';
import { loadCards } from '@/lib/storage';
import { groupByMerchant } from '@/lib/groupByMerchant';

const STORAGE_KEY = 'giftkeep_cards_v1';

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
  dispatch: React.Dispatch<AppAction>;
}

const GiftCardContext = createContext<GiftCardContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GiftCardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    cards: [],
    isHydrated: false,
  });

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const stored = loadCards();
    if (stored.length === 0 && process.env.NODE_ENV === 'development') {
      import('@/lib/seedData').then(({ SEED_CARDS }) => {
        dispatch({ type: 'HYDRATE', payload: SEED_CARDS });
      });
    } else {
      dispatch({ type: 'HYDRATE', payload: stored });
    }
  }, []);

  // Persist to localStorage whenever cards change (after hydration)
  useEffect(() => {
    if (state.isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cards));
    }
  }, [state.cards, state.isHydrated]);

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
