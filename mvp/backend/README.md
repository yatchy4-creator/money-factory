# Backend (MVP)

## Endpoints
- `GET /health`
- `GET /api/leads`
- `POST /api/leads`
- `POST /api/billing/checkout`
- `POST /api/billing/webhook`

## Checkout payloads
Use either a direct Stripe price ID or a plan key that maps to environment variables.

```json
{
  "email": "owner@example.com",
  "priceId": "price_123"
}
```

```json
{
  "email": "owner@example.com",
  "plan": "starter"
}
```

Plan keys supported: `starter`, `growth`, `pro`.
Required env vars for plan mapping: `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_PRO`.

## Example lead payload
```json
{
  "leadName": "Jordan",
  "businessName": "Peak Plumbing",
  "leadSource": "missed_call",
  "serviceType": "water heater repair",
  "leadEmail": "jordan@example.com"
}
```

## Email provider behavior
- `EMAIL_PROVIDER=RESEND` uses Resend API.
- If `RESEND_API_KEY` or `RESEND_FROM_EMAIL` is missing, service falls back to log mode (no send).

## Stripe webhook notes
- Uses raw request body + signature verification.
- Includes basic idempotency guard (`event.id` dedupe in-memory for MVP).
- For production durability, persist processed event IDs in Postgres with unique constraint.

## Run
```bash
npm install
cp .env.example .env
npm run dev
```
