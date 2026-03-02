# GiftKeep Phase 1 — Implementation Plan

## Context

Building Phase 1 of GiftKeep: a PWA gift card tracker using Next.js App Router + Tailwind CSS. This phase delivers the full CRUD dashboard with localStorage persistence, merchant-grouped accordion UI, swipe-to-delete, and tap-to-copy — all in a dark fintech aesthetic optimized for mobile.

---

## Stack

| Concern | Decision |
|---|---|
| Framework | Next.js 14+ App Router |
| Styling | Tailwind CSS v3 |
| Language | TypeScript |
| Persistence | localStorage (`giftkeep_cards_v1`) |
| State | React Context + useReducer |
| Swipe gestures | `react-swipeable` (3kb, iOS-safe) |
| Accordion animation | Framer Motion |
| Fonts | `next/font/google`: Inter (UI) + JetBrains Mono (codes) |
| PWA | manifest.json + meta tags (no service worker in Phase 1) |

**Color palette:** `#050505` bg · `#121212` cards · `#10b981` accent green

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root: fonts, PWA meta, GiftCardProvider, dark bg
│   ├── page.tsx            # Dashboard route "/"
│   ├── add/page.tsx        # Add card route "/add"
│   └── globals.css         # Tailwind + pb-safe / h-screen-safe utilities
├── components/
│   ├── dashboard/
│   │   ├── Dashboard.tsx       # Maps groups → MerchantGroup[]
│   │   ├── MerchantGroup.tsx   # Accordion (Framer Motion AnimatePresence)
│   │   └── GiftCardItem.tsx    # Swipeable row with copy + delete
│   ├── forms/
│   │   └── AddCardForm.tsx     # Controlled form with datalist autocomplete
│   └── ui/
│       ├── BottomNav.tsx       # Fixed tab bar (Dashboard | Add)
│       ├── EmptyState.tsx      # Zero-state with CTA
│       ├── AmountBadge.tsx     # "$X.XX" pill in accent green
│       └── CopyButton.tsx      # Tap-to-copy with 1.5s checkmark feedback
├── context/
│   └── GiftCardContext.tsx     # useReducer + storage + groupByMerchant
├── lib/
│   ├── storage.ts              # localStorage CRUD helpers
│   ├── groupByMerchant.ts      # Pure grouping utility
│   └── seedData.ts             # 6 dummy cards across 4 merchants (dev only)
├── types/
│   └── index.ts                # GiftCard, MerchantGroup, AppState, AppAction
public/
├── manifest.json
└── icons/                      # 192×192, 512×512, apple-touch-icon
```

---

## TypeScript Interfaces

```typescript
// src/types/index.ts

export interface GiftCard {
  id: string;
  merchant: string;
  amount: number;                  // cents — avoids float errors
  code: string;
  pin: string | null;
  createdAt: string;               // ISO 8601
  updatedAt: string;
  providerId: string | null;       // Phase 3 hook: API provider
  coordinates: { lat: number; lng: number } | null;  // Phase 3 hook: geofencing
}

export interface MerchantGroup {
  merchant: string;        // original casing for display
  merchantKey: string;     // lowercase trimmed for grouping
  cards: GiftCard[];       // sorted newest-first
  totalAmount: number;     // sum in cents
}

export type AppState = { cards: GiftCard[]; isHydrated: boolean };

export type AppAction =
  | { type: 'HYDRATE'; payload: GiftCard[] }
  | { type: 'ADD_CARD'; payload: GiftCard }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'UPDATE_CARD'; payload: GiftCard };
```

**Key decisions:**
- `amount` in cents (integer) — no floating-point currency bugs
- `providerId` and `coordinates` explicitly `null` (not `undefined`) — clean JSON round-trips
- `isHydrated` prevents SSR/localStorage flash on first render

---

## localStorage Layer

**Key:** `giftkeep_cards_v1` (versioned — bump to `_v2` for schema migrations)

Functions in `src/lib/storage.ts`:
- `loadCards()` — SSR guard (`typeof window`), catches corrupted JSON silently
- `addCard(card)` → prepends, saves, returns new array
- `deleteCard(id)` → filters, saves, returns new array
- `updateCard(card)` → maps, saves, returns new array
- `createCard(input)` → stamps `id` (crypto.randomUUID), timestamps, null future fields

---

## State Management

`GiftCardProvider` in `src/context/GiftCardContext.tsx`:
- Wraps entire app via `layout.tsx`
- `useEffect` on mount: `loadCards()` → `HYDRATE`
- Dev-only: if storage empty, auto-loads seedData
- Reducer calls storage helpers directly (single update path)
- `groups` via `useMemo(() => groupByMerchant(state.cards))`
- Hook: `useGiftCards()` → `{ groups, cards, isHydrated, dispatch }`

---

## Swipe-to-Delete

`react-swipeable` with:
- `preventScrollOnSwipe: true` — critical for iOS Safari
- `trackMouse: true` — enables desktop testing
- 80px threshold: complete → delete; below → snap back
- Red trash background revealed as card slides
- CSS `translateX(-100%)` exit animation → `onDelete(id)` after 250ms

---

## Accordion

Framer Motion `AnimatePresence` + `motion.div`:
- Header: merchant name + card count badge + total
- First group open by default
- Smooth height animation on expand/collapse

---

## Add Card Form

- `<datalist>` autocomplete from existing merchants (no library)
- Amount: `type="number" step="0.01"` → stored as `Math.round(value * 100)` cents
- Code: JetBrains Mono font
- PIN: `type="password"` with show/hide toggle
- Submit → `dispatch ADD_CARD` → `router.push('/')`

---

## PWA

- `public/manifest.json`: `display: standalone`, `theme_color: #050505`
- `layout.tsx`: `appleWebApp`, manifest link, `theme-color` meta
- `viewport`: `viewport-fit=cover` for iPhone notch support
- No service worker needed — all data is localStorage (offline works automatically)

---

## Dummy Data

6 cards across 4 merchants (all amounts in cents):
- **Apple** ×1 — $100.00
- **Amazon** ×1 — $50.00
- **Target** ×2 — $35.00 total
- **Starbucks** ×2 — $23.75 total

Loaded automatically in `NODE_ENV === 'development'` when localStorage is empty.

---

## Verification Checklist

- [ ] `npm run dev` → dark bg + 4 merchant groups (alphabetical)
- [ ] Tap merchant header → accordion animates open/close
- [ ] Tap code → clipboard copy + 1.5s checkmark
- [ ] Swipe left (>80px) → card deleted from list and localStorage
- [ ] Swipe left (<80px) → snaps back
- [ ] `/add` form → submit → new card appears on dashboard
- [ ] Hard refresh → card data persists
- [ ] Mobile: bottom nav thumb-reachable, no horizontal overflow
- [ ] Chrome Android / iOS Safari → "Add to Home Screen" works
