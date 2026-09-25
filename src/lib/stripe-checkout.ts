import { createServerFn } from '@tanstack/react-start';
import Stripe from 'stripe';

const prices = {
  monthly: { amount: 5000, name: 'JOKER MOVIES Premium — Monthly' },
  yearly: { amount: 50000, name: 'JOKER MOVIES Premium — Yearly' },
} as const;

export const createPremiumCheckout = createServerFn({ method: 'POST' })
  .validator((input: { plan: keyof typeof prices; phone: string }) => {
    if (!input || !(input.plan in prices) || !/^\+?[0-9]{9,15}$/.test(input.phone.replace(/\s/g, ''))) {
      throw new Error('Enter a valid phone number and choose a plan.');
    }
    return { plan: input.plan, phone: input.phone.replace(/\s/g, '') };
  })
  .handler(async ({ data }) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error('Stripe is not configured.');

    const stripe = new Stripe(secretKey);
    const selected = prices[data.plan];
    const origin = process.env.VITE_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      phone_number_collection: { enabled: true },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'tzs',
          unit_amount: selected.amount,
          product_data: { name: selected.name },
        },
      }],
      metadata: { plan: data.plan, phone: data.phone, membership: 'premium' },
      success_url: `${origin}/?premium=success`,
      cancel_url: `${origin}/?premium=cancelled`,
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL.');
    return { url: session.url };
  });

export { prices };
  
