# Catch

Catch is a mobile-first MVP for creating dinner invitations that unlock with a
mini-game.

## Tech

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Framer Motion
- Supabase (Postgres + RLS)
- Netlify

## Setup

1. Create a Supabase project and apply the SQL + RLS in `docs/supabase.md`.
2. Copy `env.example` to `.env.local` and set values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Install dependencies and run the app:

```
npm install
npm run dev
```

## Deployment (Netlify)

- The repo includes `netlify.toml` with the Next.js plugin.
- Set the same environment variables in Netlify.

## Notes

- No authentication or payments for MVP.
- Service role key is used only in server routes.
