# Money Factory: Missed-Lead Follow-Up Micro-SaaS

Launch-ready asset pack for a monetizable SMB SaaS that automatically follows up with missed leads, books callbacks, and recovers lost revenue.

## What’s Included

- `PRODUCT_BRIEF.md` — ICP, offer, pricing, positioning
- `LANDING_COPY.md` — full website copy
- `website/` — simple static landing page scaffold
- `mvp/` — backend + frontend scaffold with OpenAI-driven follow-up generation
- `STRIPE_PLAN.md` — monetization and integration plan + code path map
- `OUTBOUND_PLAYBOOK.md` — cold outreach scripts + KPI tracker
- `AUTOMATION_EXPANSION.md` — additional money methods + safe semi-automation
- `PROMPT.md` — master operator prompt for future agents
- `RUNBOOK.md` — deploy, ops, error recovery, and auto-fix scripts
- `DEPLOYMENT.md` — production deployment guide (Vercel + Railway + Resend + Cloudflare)
- `EMAIL_OUTREACH_SETUP.md` — sending limits + domain warm-up schedule
- `LAUNCH_CHECKLIST.md` — go-live and week-1 checklist

## Local Quickstart

### 1) Backend
```bash
cd mvp/backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend (new terminal)
```bash
cd mvp/frontend
cp .env.example .env
npm install
npm run dev
```

### 3) Open app
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8080/health`

## Production Path (recommended)

- Frontend: **Vercel**
- Backend: **Railway**
- DNS + SSL: **Cloudflare**
- Email: **Resend**
- Billing: **Stripe**

Follow these docs in order:
1. `DEPLOYMENT.md`
2. `EMAIL_OUTREACH_SETUP.md`
3. `LAUNCH_CHECKLIST.md`

## Stack

- Backend: Node.js + Express
- Frontend: Vite + React
- AI: OpenAI Responses API
- Billing: Stripe (checkout + webhook)
- Email: Resend provider abstraction with fallback logging mode
- Reliability: retry wrappers, dead-letter fallback, health checks, webhook dedupe guard
