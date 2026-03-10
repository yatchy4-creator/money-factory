# RUNBOOK — LeadRescue AI

## 1) Local Setup
1. Install Node 20+
2. Backend:
   - `cd mvp/backend`
   - `npm install`
   - `copy .env.example .env`
   - fill env vars
   - `npm run dev`
3. Frontend:
   - `cd mvp/frontend`
   - `npm install`
   - `npm run dev`

## 2) Production Deployment

### Backend (Render/Railway/Fly)
- Set root to `mvp/backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check: `GET /health`
- Add all env vars from `.env.example`

### Frontend (Vercel/Netlify)
- Set root to `mvp/frontend`
- Build: `npm run build`
- Output: `dist`
- Configure `VITE_API_BASE_URL` to backend URL

### Database + Queue (recommended)
- Postgres for leads/events
- Redis queue for retries and delayed jobs

## 3) Start Charging (Exact Steps)
1. Create Stripe product + 3 recurring prices
2. Add keys + price IDs to backend env
3. Expose webhook endpoint `/api/billing/webhook`
4. Register endpoint in Stripe dashboard and copy signing secret
5. Test in Stripe test mode:
   - successful checkout
   - failed payment
   - cancellation
6. Flip to live keys
7. Add in-app billing page and enforce plan limits middleware

## 4) Error Recovery Checklist

### App won’t start
- Check `.env` exists and required vars are present
- Run `npm install`
- Check port collision (`PORT`)

### OpenAI errors/timeouts
- Verify `OPENAI_API_KEY`
- Check model availability
- Retry with exponential backoff (already implemented)
- Fallback to template-based message if AI unreachable

### Stripe webhooks failing
- Verify webhook secret
- Ensure raw body middleware is used for signature check
- Confirm endpoint is publicly reachable

### Repeated send failures
- Inspect dead-letter queue in logs
- Replay failed jobs after fixing integration credentials

## 5) Auto-Fix Scripts

Scripts are in `scripts/`:
- `diagnose.ps1` — checks node, npm, env, and key files
- `autofix.ps1` — reinstall deps, rebuild, and verify health endpoint

Usage:
- `powershell -ExecutionPolicy Bypass -File scripts\diagnose.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts\autofix.ps1`

## 6) Operational Guardrails
- Set max retry attempts (default 4)
- Use idempotency keys for outbound actions
- Alert on dead-letter queue growth
- Keep manual override for high-risk messages

## 7) Known Gaps (MVP)
- In-memory storage only (replace with Postgres)
- Stub outbound channels (replace with Twilio/SendGrid)
- Basic auth placeholder (replace with secure auth)
