# Production Deployment Guide

Stack: **Vercel (frontend) + Railway (backend) + Resend (email) + Cloudflare (DNS)**

> Never commit real secrets. Use the `*.env.production.example` files as templates only.

## 0) Prerequisites

- GitHub repo with this project
- Accounts: Vercel, Railway, Resend, Cloudflare, Stripe, OpenAI
- Domain in Cloudflare (example: `yourdomain.com`)

## 1) Prepare production env files

1. Backend template: `mvp/backend/.env.production.example`
2. Frontend template: `mvp/frontend/.env.production.example`
3. Fill real values in platform dashboards (not in git).

## 2) Deploy backend to Railway

### Dashboard actions
1. Railway → **New Project** → **Deploy from GitHub Repo**.
2. Select service root: `mvp/backend`.
3. Add environment variables from `.env.production.example`.
4. Set start command: `npm start` (if not auto-detected).
5. Generate domain: Railway service settings → **Networking** → **Generate Domain**.

### Optional CLI commands
```bash
npm i -g @railway/cli
railway login
cd mvp/backend
railway link
railway up
```

## 3) Deploy frontend to Vercel

### Dashboard actions
1. Vercel → **Add New Project** → import repo.
2. Set **Root Directory** to `mvp/frontend`.
3. Framework preset: Vite.
4. Add frontend env vars (from `.env.production.example`):
   - `VITE_API_BASE_URL=https://api.yourdomain.com`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
5. Deploy.

### Optional CLI commands
```bash
npm i -g vercel
cd mvp/frontend
vercel
vercel --prod
```

## 4) Configure Cloudflare DNS

Assume:
- Frontend URL from Vercel: `money-factory.vercel.app`
- Backend URL from Railway: `money-factory-production.up.railway.app`

### Dashboard actions (Cloudflare → DNS)
1. Add `CNAME` record:
   - Name: `app`
   - Target: `cname.vercel-dns.com`
   - Proxy: DNS only (or proxied if TLS validated)
2. Add `CNAME` record:
   - Name: `api`
   - Target: `money-factory-production.up.railway.app`
   - Proxy: DNS only initially (reduce webhook/debug complexity)
3. Wait for DNS propagation.

## 5) Configure custom domains

1. Vercel project → **Domains**: add `app.yourdomain.com`.
2. Railway service → **Custom Domain**: add `api.yourdomain.com`.
3. Confirm HTTPS certificates are issued on both.

## 6) Configure Resend

### Dashboard actions
1. Resend → **Domains** → add your sending domain/subdomain (recommended: `mail.yourdomain.com`).
2. Copy DNS records into Cloudflare (SPF/DKIM/verification).
3. Wait until Resend domain status is verified.
4. Create API key in Resend.
5. Add backend env vars in Railway:
   - `EMAIL_PROVIDER=RESEND`
   - `RESEND_API_KEY=re_...`
   - `RESEND_FROM_EMAIL=Money Factory <noreply@yourdomain.com>`

### Fallback behavior in code
- If `RESEND_API_KEY` or `RESEND_FROM_EMAIL` missing, backend switches to logging mode (no outbound send).

## 7) Configure Stripe

### Dashboard actions
1. Create products/prices in Stripe (Starter/Growth/Pro).
2. Put live values in Railway env:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_PRO`
3. Stripe → Developers → Webhooks → **Add endpoint**:
   - Endpoint URL: `https://api.yourdomain.com/api/billing/webhook`
   - Events: at least `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook signing secret (`whsec_...`) to Railway as `STRIPE_WEBHOOK_SECRET`.

### Webhook verification + idempotency guidance
- Verification must use:
  - raw request body (`express.raw`)
  - `stripe-signature` header
  - `STRIPE_WEBHOOK_SECRET`
- Already implemented in `mvp/backend/src/routes/billing.js`.
- Stripe retries events; duplicates must be safe.
- Current MVP dedupe: in-memory `processedStripeEvents` set.
- Production recommendation: persist `event.id` in Postgres with UNIQUE constraint + transactional state update.

## 8) Smoke test (post-deploy)

```bash
curl https://api.yourdomain.com/health
```

Expected: JSON with `ok: true`.

Then test lead ingest:

```bash
curl -X POST https://api.yourdomain.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{"leadName":"Alex","businessName":"Peak Plumbing","leadSource":"missed_call","serviceType":"water heater","leadEmail":"alex@example.com"}'
```

## 9) Promote and lock

- Rotate any temporary keys used during setup.
- Enable Railway/Vercel production branch protection.
- Restrict dashboard access to minimum required team members.
- Keep a rollback note: previous Vercel deployment + Railway deploy history.
