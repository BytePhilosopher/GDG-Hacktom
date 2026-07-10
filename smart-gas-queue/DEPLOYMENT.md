# 🚀 Deploying FuelQ to Production

FuelQ is a **Next.js 16** app backed by **Supabase** (Postgres + Auth + Realtime), **Chapa** (payments), and **Google Maps**. The recommended production stack is **Vercel** (hosting) + **Supabase** (managed database). This guide takes you from zero to a live URL.

---

## 0. Prerequisites

Create free accounts for:

- [GitHub](https://github.com) — to host the repo Vercel deploys from
- [Vercel](https://vercel.com) — hosting
- [Supabase](https://supabase.com) — database, auth, realtime
- [Chapa](https://chapa.co) — Ethiopian payment gateway (get a merchant account)
- [Google Cloud](https://console.cloud.google.com) — for a Maps JavaScript API key

Install locally: **Node.js 20+** and **git**.

---

## 1. Set up Supabase (database + auth)

1. In the Supabase dashboard, click **New project**. Pick a region close to your users (e.g. `eu-central` or `us-east`). Save the database password.
2. **Create the schema.** The full table definitions (`profiles`, `vehicles`, `stations`, `station_fuels`, `queues`, `payments`) are documented in [SYSTEM_WORKFLOW.md](SYSTEM_WORKFLOW.md). Paste them into **SQL Editor → New query** and run.
3. **Seed demo data + the nearby-search function.** Open [supabase/seed_mock_data.sql](supabase/seed_mock_data.sql), paste into the SQL Editor, and run. This creates the `get_nearby_stations` RPC and inserts demo stations around Addis Ababa.
4. **Enable Row Level Security (RLS)** on every table, then add policies:
   - `stations`, `station_fuels`: allow `SELECT` to `anon` + `authenticated` (public discovery).
   - `profiles`, `vehicles`, `queues`, `payments`: users may read/write **only their own rows** (`auth.uid() = user_id` / `driver_id`). The server uses the service-role key for privileged writes, which bypasses RLS — so keep that key server-only.
5. **Grab your keys** from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` **(never expose to the browser)**

> The app now guards every API route: if these three aren't set, routes return a clean `503`.

---

## 2. Set up Chapa (payments)

1. In the Chapa dashboard, go to **Settings → API keys**. Copy the **Secret Key** → `CHAPA_SECRET_KEY`.
2. Create a **webhook secret** (any strong random string you also paste into Chapa's webhook settings) → `CHAPA_WEBHOOK_SECRET`.
   - ⚠️ **This is now mandatory.** The webhook route rejects any unsigned or mis-signed request. If the secret is unset the webhook returns `500` by design (fail-closed). Set it before going live.
3. You'll set the **webhook/callback URL** in Chapa **after** you have a production domain — see [Step 7](#7-post-deploy-configuration).

---

## 3. Get a Google Maps key

1. In Google Cloud Console, enable **Maps JavaScript API**.
2. **APIs & Services → Credentials → Create credentials → API key.** → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
3. **Restrict the key** (important — it's public): under _Application restrictions_ choose **HTTP referrers** and add your domains (`http://localhost:3000/*` and `https://your-domain.vercel.app/*`). Under _API restrictions_, limit it to Maps JavaScript API.

---

## 4. Environment variables

The app uses exactly these variables. Create a local `.env.local` (already git-ignored) for development:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # anon public key
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # service_role secret (server only)

# Chapa
CHAPA_SECRET_KEY=CHASECK-...
CHAPA_WEBHOOK_SECRET=your-strong-random-string

# Google Maps (public, restrict by referrer)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# App URL — http://localhost:3000 in dev, your real domain in prod
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** earlier `JWT_*`, `NEXT_PUBLIC_SOCKET_URL`, and `NEXT_PUBLIC_CHAPA_PUBLIC_KEY` variables are **no longer used** (that code was removed) — you can delete them from any old `.env.local`.

---

## 5. Run locally to verify

```bash
npm install
npm run dev          # http://localhost:3000
```

Before deploying, confirm the pipeline is green:

```bash
npm run format:check   # Prettier
npm run lint           # ESLint (0 warnings)
npm run typecheck      # tsc --noEmit
npm run build          # production build
```

---

## 6. Deploy to Vercel

1. Push the project to a GitHub repo:
   ```bash
   git add .
   git commit -m "Production-ready FuelQ"
   git push origin main
   ```
2. In Vercel, **Add New → Project → Import** your GitHub repo. Vercel auto-detects Next.js — leave build settings default (`next build`).
3. Under **Environment Variables**, add **all** the variables from Step 4.
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g. `https://fuelq.vercel.app`). You can add it now and correct it after the first deploy if the domain differs.
4. Click **Deploy**. Vercel builds and gives you a live URL.

---

## 7. Post-deploy configuration

Once you have the production domain:

1. **`NEXT_PUBLIC_APP_URL`** — make sure it matches the real domain in Vercel env, then **redeploy** (payment callback/return URLs are built from it).
2. **Chapa webhook** — in Chapa's dashboard set the webhook URL to:
   ```
   https://YOUR-DOMAIN/api/payments/webhook
   ```
   and set the webhook secret to the same value as `CHAPA_WEBHOOK_SECRET`.
3. **Supabase Auth URLs** — in **Authentication → URL Configuration**, set **Site URL** to your domain and add it to **Redirect URLs** (needed for password reset / email links).
4. **Google Maps** — add your production domain to the API key's HTTP-referrer allowlist.
5. **Custom domain (optional)** — Vercel → **Settings → Domains**, add your domain and follow the DNS instructions. Update `NEXT_PUBLIC_APP_URL`, the Chapa webhook, and the Maps referrers to the new domain, then redeploy.

---

## 8. Verify production

- [ ] Home map loads and shows nearby stations (Maps key + seed data working).
- [ ] Register + log in works (Supabase Auth).
- [ ] Join a queue → redirected to Chapa checkout (payment initialize working).
- [ ] Complete a test payment → returned to the queue page and marked **paid/active** (verify + webhook working).
- [ ] Admin login → dashboard shows live queue and updates in real time (Realtime working).

---

## 9. Security checklist before launch

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set **only** as a server env var, never `NEXT_PUBLIC_*`.
- [ ] `CHAPA_WEBHOOK_SECRET` is set (webhook is signature-verified and fails closed without it).
- [ ] RLS is **enabled** on all tables with owner-scoped policies.
- [ ] Google Maps key is referrer-restricted.
- [ ] Use **Chapa live keys** (not test keys) only when you're ready to accept real money.
- [ ] `.env.local` is not committed (it's git-ignored).

---

## CI (optional but recommended)

Add a GitHub Action that runs `npm run lint && npm run typecheck && npm run build` on every PR so a broken build never reaches `main`. (Not included yet — ask and I'll add `.github/workflows/ci.yml`.)
