# Money Buddy

Money Buddy is a production-ready personal income and expense tracker built with React, TypeScript, Vite, Tailwind CSS, Supabase Auth/PostgreSQL/Storage, an Express API, and DeepSeek AI.

## Architecture

- `frontend`: React SPA deployed to Vercel. It uses only `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.
- `backend`: Express API deployed to Render, Railway, or Vercel serverless. It verifies Supabase auth tokens and keeps `SUPABASE_SERVICE_ROLE_KEY` and `DEEPSEEK_API_KEY` server-side.
- `supabase`: SQL migration with tables, RLS, signup profile trigger, default categories, and private receipt storage policies.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project, then run:

```bash
supabase/migrations/001_initial_schema.sql
```

Use the Supabase SQL editor if you are not using the Supabase CLI.

3. Copy env files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

4. Fill in:

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:4000
```

Backend:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_API_URL=https://api.deepseek.com
FRONTEND_URL=http://localhost:5173
PORT=4000
```

5. Run locally:

```bash
npm run dev:backend
npm run dev:frontend
```

## Supabase Setup Guide

1. Create a new Supabase project.
2. Open SQL Editor.
3. Run `supabase/migrations/001_initial_schema.sql`.
4. Confirm these tables exist: `profiles`, `transactions`, `categories`, `budgets`, `recurring_transactions`, `receipts`, `ai_chat_history`, `user_settings`.
5. Confirm Row Level Security is enabled on every public user table.
6. Confirm Storage has a private `receipts` bucket.
7. Confirm new signups create a profile, user settings row, and default categories.

The migration includes policies so authenticated users can only access rows where `auth.uid() = user_id`. Receipt files must be uploaded under `${user.id}/filename`, and storage policies enforce that folder ownership.

## Google OAuth Setup Guide

1. In Google Cloud Console, create an OAuth Client ID.
2. Add authorized redirect URI from Supabase:

```text
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

3. In Supabase Dashboard, open Authentication > Providers > Google.
4. Enable Google and paste the Google client ID and client secret.
5. In Authentication > URL Configuration, add site URL and redirect URLs:

```text
http://localhost:5173
https://YOUR_FRONTEND_DOMAIN.vercel.app
```

6. Test Google login and confirm the `profiles` row includes email/avatar metadata.

## DeepSeek Setup Guide

1. Create a DeepSeek API key.
2. Put it only in `backend/.env` or backend hosting environment variables.
3. Never add it to frontend env vars.
4. Frontend calls `POST /api/ai/chat` with the Supabase access token.
5. Backend verifies the token, fetches the user’s real finance summary, calls DeepSeek, and saves both user and assistant messages to `ai_chat_history`.

## Deployment Guide

### Frontend to Vercel

1. Import the repository into Vercel.
2. Set project root to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=https://YOUR_BACKEND_DOMAIN
```

6. Deploy and add the Vercel domain to Supabase Auth redirect URLs.

### Backend to Render or Railway

1. Create a Node service with root `backend`.
2. Build command: `npm install && npm run build`.
3. Start command: `npm start`.
4. Add environment variables from `backend/.env.example`.
5. Set `FRONTEND_URL` to the deployed frontend URL.
6. Confirm `GET /health` returns `{ "ok": true }`.

### Backend to Vercel Serverless

1. Create a separate Vercel project with root `backend`.
2. Keep `backend/vercel.json`.
3. Add backend environment variables.
4. Deploy and use the deployment URL as `VITE_API_URL`.

## Recurring Transactions in Production

The backend exposes:

```text
POST /api/recurring/run-due
```

For per-user manual runs, the frontend calls it with the user session token. For automatic production processing, create a scheduled job on Render/Railway/Vercel Cron that calls a protected admin variant or Supabase Edge Function using the same logic in `backend/src/services/recurring.ts`.

Recommended schedule: daily at 01:00 in your business timezone.

## Production Test Checklist

- Sign up with email/password.
- Log in with Google OAuth.
- Refresh the page and confirm the session persists.
- Add income and expense transactions.
- Log out, log back in, and confirm data remains.
- Create a second user and confirm the first user’s rows are invisible.
- Upload a receipt and confirm the file path starts with the current user id.
- Set total and category budgets.
- Confirm dashboard and reports update from real Supabase data.
- Ask AI Money Buddy a question and confirm chat history is saved.
- Test mobile layout and desktop sidebar.

## Security Notes

- The frontend uses only the Supabase anon key.
- The backend derives the user from the Supabase access token and never trusts a client-sent `user_id`.
- Supabase service role and DeepSeek keys live only in backend env vars.
- RLS is enabled on all user-owned tables.
- Storage policies isolate receipt files by user id folder.
