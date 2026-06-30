import { stripe } from "./client";

export function formatAmountForStripe(amount: number, currency: string): number {
  const zeroDecimalCurrencies = ["jpy", "krw", "vnd"];
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number, currency: string): number {
  const zeroDecimalCurrencies = ["jpy", "krw", "vnd"];
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }
  return amount / 100;
}

export async function createPaymentIntent({
  amount,
  currency = "eur",
  metadata = {},
}: {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}) {
  return stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount, currency),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });
}
