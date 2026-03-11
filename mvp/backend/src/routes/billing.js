import express from 'express';
import { createCheckoutSession, stripe } from '../services/stripeService.js';
import { logger } from '../lib/logger.js';
import { db } from '../data/store.js';

export const billingRouter = express.Router();

const PLAN_TO_PRICE_ENV = {
  starter: 'STRIPE_PRICE_STARTER',
  growth: 'STRIPE_PRICE_GROWTH',
  pro: 'STRIPE_PRICE_PRO'
};

const PLAN_ALIASES = {
  starter: 'starter',
  basic: 'starter',
  growth: 'growth',
  grow: 'growth',
  pro: 'pro',
  professional: 'pro',
  premium: 'pro'
};

function normalizePlan(plan) {
  if (typeof plan !== 'string') return null;
  const value = plan.trim().toLowerCase();
  return PLAN_ALIASES[value] || null;
}

function resolveCheckoutPriceId(body) {
  if (typeof body?.priceId === 'string' && body.priceId.trim()) {
    return { priceId: body.priceId.trim(), source: 'priceId' };
  }

  const normalizedPlan = normalizePlan(body?.plan ?? body?.tier);
  if (!normalizedPlan) {
    return { priceId: null, source: null };
  }

  const envKey = PLAN_TO_PRICE_ENV[normalizedPlan];
  const envPrice = process.env[envKey];
  return {
    priceId: typeof envPrice === 'string' && envPrice.trim() ? envPrice.trim() : null,
    source: `plan:${normalizedPlan}`,
    plan: normalizedPlan,
    envKey
  };
}

function getAppBaseUrl(req) {
  if (typeof process.env.APP_BASE_URL === 'string' && process.env.APP_BASE_URL.trim()) {
    return process.env.APP_BASE_URL.trim();
  }

  if (typeof req.headers.origin === 'string' && req.headers.origin.trim()) {
    return req.headers.origin.trim();
  }

  return null;
}

billingRouter.post('/checkout', async (req, res) => {
  try {
    const appBaseUrl = getAppBaseUrl(req);
    if (!appBaseUrl) {
      logger.error('checkout_failed', { reason: 'missing_app_base_url' });
      return res.status(503).json({ error: 'Checkout is temporarily unavailable' });
    }

    const { priceId, source, plan, envKey } = resolveCheckoutPriceId(req.body);
    if (!priceId) {
      logger.warn('checkout_validation_failed', {
        reason: 'missing_price_id',
        source,
        plan,
        envKey
      });
      return res.status(400).json({
        error: 'Missing Stripe price configuration',
        details: 'Provide priceId or plan (starter, growth, pro)'
      });
    }

    const email =
      typeof req.body?.email === 'string' && req.body.email.trim() ? req.body.email.trim() : undefined;

    const session = await createCheckoutSession({
      customerEmail: email,
      priceId,
      successUrl: `${appBaseUrl}/billing/success`,
      cancelUrl: `${appBaseUrl}/billing/cancel`
    });

    logger.info('checkout_created', { source, plan, hasEmail: Boolean(email) });
    res.json({ url: session.url });
  } catch (error) {
    logger.error('checkout_failed', { error: error.message });
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
});

billingRouter.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    if (!stripe) return res.status(503).send('Stripe not configured');

    const sig = req.headers['stripe-signature'];
    if (!sig) return res.status(400).send('Missing stripe-signature header');
    if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Webhook secret not configured');

    // Verification: must use RAW request body, signature header, and endpoint secret.
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Idempotency: Stripe may retry the same event; skip if we already processed this event.id.
    if (db.processedStripeEvents.has(event.id)) {
      logger.warn('stripe_webhook_duplicate_ignored', { id: event.id, type: event.type });
      return res.json({ received: true, duplicate: true });
    }

    db.processedStripeEvents.add(event.id);

    // TODO: persist subscription status by customer id in durable database.
    // For production, store event.id in Postgres with unique constraint and transactional updates.
    logger.info('stripe_webhook_received', { type: event.type, id: event.id });
    return res.json({ received: true });
  } catch (error) {
    logger.error('stripe_webhook_error', { error: error.message });
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
