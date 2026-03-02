# GiftKeep

A Digital Wallet for physical gift cards. Installable as a PWA on iOS/Android via the browser, hosted on Vercel.

---

## Development Roadmap

### 1. Core Vision

A "Digital Wallet" for physical gift cards. The app must be a **PWA (Progressive Web App)** so it can be installed on iOS/Android via the browser without App Store overhead, while being hosted on **Vercel** for free.

### 2. Global Design Guidelines

- **Aesthetic:** Dark-mode Fintech. Palette: `#050505` (Background), `#121212` (Cards), `#10b981` (Success/Balance Green).
- **Typography:** Sans-serif for UI (Inter/Geist); Monospace for Card Codes (JetBrains Mono/Roboto Mono).
- **Mobile-First:** All interactions (Add, Swipe, Expand) must be optimized for thumb-reach and touch gestures.
- **Grouping:** The UI should never be a flat list of cards. It must be grouped by **Merchant** (e.g., all 3 Starbucks cards live inside one "Starbucks" container).

---

### Phase 1: The Manual Tracker (MVP) ← *Current*

**Goal:** A functional CRUD app using localStorage.

**Key Features:**
- Manual entry form: Merchant Name, Amount, Code, and PIN.
- Dashboard: Merchant-based accordion/folder view.
- **Actions:** Swipe-left to delete a card; Tap to copy code to clipboard.
- **Deployment:** Optimized for Vercel's hobby tier.

**Stack:** Next.js 14+ App Router · Tailwind CSS · TypeScript · localStorage · React Context + useReducer · Framer Motion · react-swipeable

---

### Phase 2: The "Smart Scan" (AI Integration)

**Goal:** Replace typing with OCR.

- Integration: Vercel AI SDK with `gpt-4o-mini`
- User uploads a photo of the card back
- AI extracts `Merchant`, `Code`, and `PIN` as strict JSON (missing fields → `null`)
- Balance entry stays manual; "Last Updated" timestamp added
- AI scanning route uses **Vercel Edge Runtime**

---

### Phase 3: Persistence & Admin Control

**Goal:** Multi-user support and centralized data.

- **Database:** Supabase with Row Level Security (RLS)
- **Authentication:** Social login or Email/Password
- **Admin Interface:** Hidden route `/admin` to manage global Merchant list (Names, Logos, Brand Colors)

---

### Future Expansion Hooks

- **Auto-Pull:** `provider_id` field on card schema for future automated balance-check API integrations
- **Barcode/QR:** UI slot to render a barcode via `bwip-js` from the saved text code
- **Geofencing:** Merchant data schema includes `coordinates` for location-based reminders

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Persistence | localStorage (Phase 1) → Supabase (Phase 3) |
| State | React Context + useReducer |
| Animations | Framer Motion |
| Swipe Gestures | react-swipeable |
| Fonts | Inter (UI) + JetBrains Mono (codes) |
| Deployment | Vercel |
