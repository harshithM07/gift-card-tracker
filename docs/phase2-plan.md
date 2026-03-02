# GiftKeep Phase 2 — AI Card Scan + Form Validation

## Context

Two additions on top of the Phase 1 app:

1. **AI card scan** — User taps "Scan Card Photo" on the Add Card page, picks an image or uses the native mobile camera, and the AI extracts merchant/code/PIN, pre-filling the form fields. User reviews and saves.
2. **Improved form validation** — Tightened validate() function: positive-only amounts, length limits, digit-only PIN.

---

## Stack Changes

| Addition | Detail |
|---|---|
| `@anthropic-ai/sdk` | Anthropic SDK for Claude vision API |
| `claude-haiku-4-5-20251001` | Fast, cost-efficient model with vision |
| Edge Runtime | `export const runtime = 'edge'` on the API route |

---

## Setup Required

1. Create `.env.local` in project root (already gitignored):
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
2. Get your key at **https://console.anthropic.com/**

---

## New Files

### `src/app/api/scan/route.ts`
- Edge Runtime API route
- Accepts `POST multipart/form-data` with an `image` field
- Converts image to base64 (Web API, no Buffer — Edge-safe)
- Calls `claude-haiku-4-5-20251001` with vision
- Returns `{ merchant: string|null, code: string|null, pin: string|null }`
- Returns 400 if no image, 422 if JSON parse fails
- Handles model wrapping response in markdown code fences via regex extraction

---

## Modified Files

### `src/components/forms/AddCardForm.tsx`

**Scan UI (above form fields):**
- Hidden `<input type="file" accept="image/*">` triggered by ref
- "Scan Card Photo" button → shows spinner + "Scanning..." while in-flight
- Scan error display (red pill)
- "or enter manually" divider

**Scan logic:**
- POSTs image to `/api/scan`
- Merges non-null extracted fields into form (never overwrites user-typed data with null)
- Graceful error handling

**Improved validation:**
- Merchant: required + max 60 chars
- Amount: required + `> 0` (no zero-balance) + `≤ $10,000`
- Code: required + min 4 chars + max 100 chars
- PIN: optional — if provided, must be `/^\d{4,10}$/`

---

## Verification Checklist

- [ ] `.env.local` has a valid `ANTHROPIC_API_KEY`
- [ ] `npm run dev` starts without errors
- [ ] `/add` shows "Scan Card Photo" button above the form
- [ ] Scan button disabled during in-flight request (shows spinner)
- [ ] Upload card photo → fields pre-fill with extracted data
- [ ] Unrecognizable photo → error message, form still usable
- [ ] Validation: amount=0 → error; amount=15000 → error; PIN="abc" → error
- [ ] Valid form submits, card appears on dashboard
