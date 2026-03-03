# GiftKeep Phase 4 - Auth + Persistent Storage + Account Settings

## Context

Phase 4 moved GiftKeep from local-only data to authenticated, persistent Supabase-backed data.
This document reflects the current implementation in the repository, including merchant catalog support and account/security UI additions.

---

## Outcomes Implemented

1. Supabase Auth integration (email/password)
2. Supabase Postgres persistence for gift cards
3. Session handling via `@supabase/ssr` cookies + middleware refresh
4. Protected app routes with client-side auth gate
5. Password recovery flow (forgot/reset)
6. Account pages:
   - `/profile` (email, placeholder name, delete account)
   - `/security` (change password)
7. Merchant catalog model:
   - canonical `merchants` table
   - nullable `merchant_id` on `gift_cards`
   - fallback free-text merchant name for unknown merchants
8. Native in-app confirmation modal for card delete actions (no browser `confirm()` UI)

---

## Stack Additions

| Concern | Technology |
|---|---|
| Auth + DB | Supabase (`@supabase/supabase-js`) |
| SSR auth session | `@supabase/ssr` |
| App middleware refresh | Next.js `middleware.ts` + `supabase.auth.getUser()` |

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (used only for account deletion admin call)
- `GOOGLE_AI_API_KEY` (existing AI scan feature)

---

## Auth Architecture

### Server/client Supabase clients
- `src/lib/supabase/server.ts`: server client using cookie adapter from `next/headers`
- `src/lib/supabase/client.ts`: browser client for client-side auth operations

### Middleware
- `middleware.ts` refreshes auth session on requests by calling `supabase.auth.getUser()`
- Route access rules are enforced in UI via `AuthGate`:
  - public: `/login`, `/forgot-password`, `/reset-password`
  - all others require authenticated user

### Auth API routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `DELETE /api/auth/account` (admin delete user using service role key)

### Auth callback + recovery
- `GET /auth/callback`: exchanges auth code for session
- Recovery links route users to `/reset-password` after exchange
- Pages:
  - `/forgot-password`
  - `/reset-password`

---

## Gift Card Persistence (Supabase)

### Card API routes
- `GET /api/cards`: list signed-in user's cards
- `POST /api/cards`: create card
- `PATCH /api/cards/[id]`: update card
- `DELETE /api/cards/[id]`: delete card

Validation currently enforced in API:
- merchant required, max 60 chars
- amount must be positive integer cents
- code required, length 4-100
- pin optional, digits 4-10
- merchantId optional, must be UUID when present

### App state flow
- `GiftCardContext` hydrates from `GET /api/cards`
- Create/edit/delete dispatch functions call API routes and update local state on success

---

## Merchant Catalog Model (Implemented)

### Why
- Allow canonical merchant selection while preserving free-text fallback for unknown merchants.

### Data model
- `GiftCard` includes:
  - `merchant` (always-present display/fallback text)
  - `merchantId` (nullable canonical FK)

### API behavior
- Card create/update accepts:
  - `merchant` (required text)
  - `merchantId` (optional nullable UUID)
- Unknown merchant path remains valid with `merchantId = null`

### Merchant API
- `GET /api/merchants`: returns canonical merchant list (`id`, `name`) for authenticated users

### Form UX
- Add/Edit use a single in-app combobox field for merchant:
  - searchable dropdown suggestions
  - keyboard navigation
  - explicit "Use custom" behavior

---

## SQL / Migration Files

### Merchant migration
- `docs/phase4-merchants.sql`
- Creates/updates:
  - `public.merchants`
  - nullable `gift_cards.merchant_id`
  - indexes
  - seed canonical merchants
  - best-effort backfill from `gift_cards.merchant`

### Important RLS note
If `merchants` has RLS enabled, add a select policy for authenticated users, otherwise `/api/merchants` may return empty.

Example:
```sql
alter table public.merchants enable row level security;

create policy merchants_select_authenticated
on public.merchants
for select
to authenticated
using (true);
```

---

## Account UI Changes

### Drawer
- Account drawer includes:
  - Profile link (`/profile`)
  - Security link (`/security`)
  - Log out action

### Profile page
- Shows signed-in email
- Placeholder name form (UI scaffold)
- Danger zone for account deletion with typed confirmation (`DELETE`)

### Security page
- Change password form
- Validates min/max length and confirm-match
- Uses `supabase.auth.updateUser({ password })`

---

## Native Confirmation Dialogs

Browser `confirm()` for card deletion was replaced with styled app-native modal:
- `src/components/ui/ConfirmDialog.tsx`
- Used by:
  - `GiftCardItem` swipe delete flow
  - `EditCardForm` delete action

---

## Verification Checklist

- [ ] User can register/login/logout using Supabase Auth
- [ ] Session persists across refresh and protected pages redirect when signed out
- [ ] Forgot-password sends email and reset flow updates password
- [ ] Cards CRUD works and persists in Supabase
- [ ] Profile page loads and account delete works
- [ ] Security page updates password successfully
- [ ] Merchant combobox shows canonical merchants and allows custom merchant text
- [ ] Creating/editing card sets `merchantId` when canonical match exists, else null
- [ ] `/api/merchants` returns rows for authenticated users (RLS configured)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
