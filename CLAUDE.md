# CLAUDE.md — NyeVenner Codebase Guide

This file provides context for AI assistants working on the NyeVenner codebase.

---

## Project Overview

**NyeVenner** ("New Friends") is a Norwegian-language Next.js web application for discovering and organizing social activities, primarily targeting seniors and their family members. It is a mobile-first Progressive Web App (PWA) backed by Supabase.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, Tailwind CSS 3 |
| Icons | Lucide React |
| Maps | Leaflet + react-leaflet |
| Database/Auth | Supabase (supabase-js + @supabase/ssr) |
| PWA | @ducanh2912/next-pwa (Webpack, Turbopack disabled) |
| Date parsing | chrono-node |
| Weather | Met.no API |

---

## Directory Structure

```
nyevenner/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout — fonts, metadata, viewport
│   ├── page.tsx                # Home page — activity feed and filtering
│   ├── globals.css             # Tailwind base styles
│   ├── sitemap.ts              # Dynamic sitemap
│   ├── auth/callback/route.ts  # OAuth callback (server-side)
│   ├── aktivitet/[id]/         # Activity detail + edit routes
│   ├── login/                  # Login/signup page
│   ├── minside/                # User dashboard (largest page, ~27 KB)
│   ├── ny-aktivitet/           # Create activity form
│   ├── oppsett/                # Onboarding / profile setup
│   ├── hvordan-virker-det/     # How-it-works page
│   ├── personvern/             # Privacy policy
│   └── vilkar/                 # Terms of service
│
├── components/                 # Shared components
│   ├── Chat.tsx                # Real-time chat (Supabase subscriptions)
│   ├── LoginModal.tsx          # Modal overlay for authentication
│   ├── Map.tsx                 # Leaflet map (dynamically imported)
│   ├── TextToSpeech.tsx        # Accessibility TTS
│   └── Weather.tsx             # Met.no weather display
│
├── utils/supabase/
│   ├── client.ts               # Browser-side Supabase client
│   └── server.ts               # Async server-side Supabase client (cookies)
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── icon-192.png            # PWA maskable icon
│   └── icon-512.png            # PWA maskable icon
│
├── next.config.js              # Next.js config — PWA, image domains
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript — strict, path alias @/*
├── eslint.config.mjs           # ESLint flat config
└── postcss.config.js           # PostCSS with Tailwind + Autoprefixer
```

---

## Development Commands

```bash
npm run dev    # Start development server on http://localhost:3000
npm run build  # Production build
npm start      # Serve production build
npm run lint   # Run ESLint
```

> Turbopack is **disabled** in `next.config.js` so the PWA plugin (Webpack-based) works correctly.

---

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Both are public (`NEXT_PUBLIC_`) because they are used in the browser. Row-Level Security (RLS) in Supabase is the security boundary — not the anon key.

---

## Architecture Decisions

### Supabase as the entire backend
There is no custom API layer. All data access uses Supabase client libraries directly from components:
- `.select()`, `.insert()`, `.update()`, `.delete()` for data operations
- `supabase.channel()` for real-time subscriptions (chat messages)
- Supabase Auth for all authentication (email/password, Google OAuth, Facebook OAuth)

### Client vs Server Supabase clients
- `utils/supabase/client.ts` — browser client, used in all `'use client'` components
- `utils/supabase/server.ts` — async server client with cookie handling, used only in `app/auth/callback/route.ts`

### Nearly all components are Client Components
Pages use `'use client'` and manage state with `useState`/`useEffect`. There is no global state manager (no Context, Redux, Zustand, etc.).

### Dynamic import for the Map
`Map.tsx` is heavy (Leaflet) and is always imported with `next/dynamic` and `ssr: false` to avoid SSR issues.

---

## Data Models (inferred from code)

```typescript
type Aktivitet = {
  id: string
  tittel: string          // Title
  beskrivelse: string     // Description
  dato: string            // Date/time string
  sted: string            // Location name
  adresse: string         // Street address
  postnummer: string      // Postal code
  pris: number            // Price
  maks_deltakere: number  // Max participants
  opprettet_av: string    // Created by (user id)
  bilde_url?: string      // Optional custom image URL
}

type Profil = {
  id: string              // Matches auth.users.id
  navn: string            // Full name
  adresse: string
  postnummer: string
  telefon: string
  fodselsdato: string
  rolle: 'senior' | 'familie'
}

type Message = {
  id: string
  activity_id: string
  user_id: string
  content: string
  created_at: string
}
```

Supabase tables: `activities`, `participants`, `profiles`, `family_links`, `messages`

---

## Key Conventions

### Language
The entire codebase (UI text, variable names, comments, route paths) is in **Norwegian**. Maintain this consistently:
- Routes: `/aktivitet`, `/minside`, `/ny-aktivitet`, `/oppsett`
- Variables: `aktiviteter`, `deltakere`, `bruker`, `profil`

### Naming
- PascalCase for React components and TypeScript types
- camelCase for variables, functions, and object properties
- File names match component names (e.g., `Chat.tsx` exports `Chat`)

### Styling
- Tailwind CSS classes are preferred
- Some components use inline `style={}` objects — this is acceptable but Tailwind classes are preferred for new code
- Utility merge: use `clsx` + `tailwind-merge` (imported as `cn`) when combining conditional classes

### TypeScript
- Strict mode is on — no implicit `any`
- Type definitions are inline (no separate `.d.ts` files)
- Path alias `@/` maps to the project root

### Component structure
Pages are self-contained with their own data-fetching logic via `useEffect`. Extract to `components/` only when a component is reused across two or more pages.

---

## Authentication Flow

1. User clicks login (email/password or OAuth provider)
2. On OAuth: redirect to `/auth/callback?code=...`
3. `app/auth/callback/route.ts` exchanges the code for a session via `supabase.auth.exchangeCodeForSession()`
4. Session is stored in cookies by `@supabase/ssr`
5. Protected pages call `supabase.auth.getUser()` to check session
6. New users are redirected to `/oppsett` for profile setup

---

## Real-time Chat

`components/Chat.tsx` subscribes to the `messages` table filtered by `activity_id`:

```typescript
supabase
  .channel(`messages:activity_id=eq.${activityId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handler)
  .subscribe()
```

Always unsubscribe in the `useEffect` cleanup function.

---

## PWA Configuration

Configured in `next.config.js` via `@ducanh2912/next-pwa`:
- **Turbopack must remain disabled** for PWA to work
- Service worker is auto-generated in `public/`
- Manifest is at `public/manifest.json`
- Icons must be maskable (safe-zone design)

---

## Image Handling

- Remote images from `images.unsplash.com` are allowed in `next.config.js`
- Activity cards use a smart keyword-based Unsplash URL selection (based on title keywords and a hash of the activity ID)
- Use `next/image` with the `Image` component for all images

---

## No Tests or CI/CD

There are currently no automated tests and no CI/CD pipeline. When adding tests, use **Vitest** + **@testing-library/react** (compatible with Next.js App Router). Place test files alongside the components they test as `*.test.tsx`.

---

## Common Pitfalls

1. **Do not enable Turbopack** — it breaks the PWA plugin.
2. **Map component must use `ssr: false`** — Leaflet requires `window` and will crash on the server.
3. **Server Supabase client is async** — `createClient()` in `utils/supabase/server.ts` is `async` and must be awaited.
4. **RLS policies govern data access** — adding new tables requires configuring RLS in Supabase, not just in code.
5. **All user-visible text is Norwegian** — do not introduce English strings in the UI.
6. **`NEXT_PUBLIC_` env vars are bundled into the client** — never put secrets (service role key, etc.) in `NEXT_PUBLIC_` variables.
