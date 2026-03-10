import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function createCheckoutSession({ customerEmail, priceId, successUrl, cancelUrl }) {
  if (!stripe) throw new Error('Stripe is not configured');

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl
  });
}
