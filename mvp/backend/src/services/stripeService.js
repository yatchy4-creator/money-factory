import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function createCheckoutSession({ customerEmail, priceId, successUrl, cancelUrl }) {
  if (!stripe) throw new Error('Stripe is not configured');
  if (!priceId) throw new Error('Stripe price id is required');
  if (!successUrl || !cancelUrl) throw new Error('Checkout redirect URLs are required');

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl
  });
}
