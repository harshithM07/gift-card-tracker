# GiftKeep Phase 3 — UI Enhancements

## Features

Five additions on top of the Phase 2 app:

1. **App branding** — "GiftKeep" label in the dashboard header so the app name is visible.
2. **Merchant search** — Search input on the dashboard that filters merchant groups in real-time.
3. **Barcode / QR code** — Each card gets a barcode icon button that opens a centered modal with Code128 barcode and QR code (toggle), rendered via `bwip-js`, on a white background ready for scanning at checkout.
4. **Edit card** — Pencil icon on each card opens `/edit/[id]` with a pre-filled form; supports saving changes or deleting the card.
5. **Camera vs upload split** — Add Card page has two buttons: "Take Photo" (`capture="environment"`, opens native camera on mobile) and "Upload Photo" (file picker / gallery).

> **Note on "Take Photo" on desktop:** `capture="environment"` is a mobile browser feature. Desktop browsers ignore the attribute and fall back to the regular file picker — this is expected. On iOS Safari and Android Chrome it correctly opens the rear camera.

---

## Stack Changes

| Addition | Detail |
|---|---|
| `bwip-js` | Client-side barcode/QR renderer (100+ formats incl. Code128 + QR) |
| `@types/bwip-js` | TypeScript type declarations for bwip-js |

`bwip-js` is loaded lazily (dynamic `import()`) so it doesn't bloat the initial JS bundle.

---

## New Files

### `src/app/edit/[id]/page.tsx`
- Client component, uses `use(params)` for Next.js 16 dynamic route
- Looks up card by ID from `useGiftCards()` context
- Redirects to `/` if card not found after hydration
- Renders `EditCardForm`

### `src/components/forms/EditCardForm.tsx`
- Pre-fills all fields from the existing `GiftCard` object
- Amount pre-filled as dollars (`cents / 100`)
- Same validation rules as `AddCardForm`
- On submit: dispatches `UPDATE_CARD` with updated card + new `updatedAt` timestamp
- "Delete Card" button: `window.confirm` → dispatches `DELETE_CARD` → navigates to `/`

---

## Modified Files

### `src/components/dashboard/Dashboard.tsx`

**Branding:**
- Add `GiftKeep` text label at the top of the header (accent colour, small caps)

**Search:**
- Add `query: string` local state
- Add search input below the total balance with a magnifier icon
- Derive `filteredGroups` — filter `groups` where `merchant` includes `query` (case-insensitive)
- Show "No matching merchants" message when filter yields no results

### `src/components/dashboard/GiftCardItem.tsx`

**Edit button:**
- Replace "← swipe to delete" hint with a pencil icon `<Link href="/edit/[id]">`
- `e.stopPropagation()` prevents swipe handler interference

**Barcode / QR modal:**
- Centered modal (not bottom sheet) with `maxHeight: 220px` canvas constraint
- Toggle tabs (Barcode / QR) sit below the canvas
- Dynamic `import('bwip-js')` loads library only on first tap

### `src/components/forms/AddCardForm.tsx`

**Camera / upload split:**
- Second hidden `<input capture="environment">` for native camera
- Two side-by-side buttons: "Take Photo" (accent) and "Upload Photo" (gray)

---

## Verification Checklist

- [x] Dashboard shows "GiftKeep" label at top
- [x] Search input appears below total balance; filters in real-time
- [x] Barcode modal is centered and constrained; QR and barcode toggle works
- [x] Pencil icon on each card navigates to `/edit/[id]`
- [x] Edit form pre-fills all fields correctly
- [x] "Save Changes" updates the card and returns to dashboard
- [x] "Delete Card" confirms then removes card and returns to dashboard
- [x] "Take Photo" opens native camera on mobile; falls back to file picker on desktop
- [x] TypeScript: `npx tsc --noEmit` passes with 0 errors
