# Stripe Integration Plan

## Goal
Charge subscription plans, enforce usage limits, and support upgrades/downgrades with minimal billing friction.

## Billing Architecture
1. Customer signs up in app.
2. Backend creates Stripe Customer.
3. Checkout Session starts for selected price ID.
4. Webhook confirms `checkout.session.completed`.
5. Store subscription status in DB.
6. Enforce plan limits in middleware.

## Required Stripe Objects
- Product: LeadRescue AI
- Prices: starter_monthly, growth_monthly, pro_monthly
- Optional: setup_fee_one_time

## Required Env Vars
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_GROWTH`
- `STRIPE_PRICE_PRO`
- `STRIPE_SETUP_FEE_PRICE` (optional)

## Placeholder Code Paths
- `mvp/backend/src/routes/billing.js`
- `mvp/backend/src/middleware/planGate.js`
- `mvp/backend/src/services/stripeService.js`

## Webhook Events to Handle
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## Failure/Recovery
- Verify signatures for all webhooks.
- On webhook processing failure, return non-2xx to trigger Stripe retry.
- Log idempotency key and event IDs to prevent duplicate processing.

## Start Charging Checklist
- [ ] Create Stripe products/prices
- [ ] Add keys to production env
- [ ] Verify webhook endpoint in live mode
- [ ] Run test checkout + cancellation + failed payment scenario
- [ ] Enable tax/VAT collection if required
- [ ] Add Terms + Refund policy pages
