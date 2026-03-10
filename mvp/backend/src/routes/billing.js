import express from 'express';
import { createCheckoutSession, stripe } from '../services/stripeService.js';
import { logger } from '../lib/logger.js';
import { db } from '../data/store.js';

export const billingRouter = express.Router();

billingRouter.post('/checkout', async (req, res) => {
  try {
    const { email, priceId } = req.body;
    const session = await createCheckoutSession({
      customerEmail: email,
      priceId,
      successUrl: `${process.env.APP_BASE_URL}/billing/success`,
      cancelUrl: `${process.env.APP_BASE_URL}/billing/cancel`
    });
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
