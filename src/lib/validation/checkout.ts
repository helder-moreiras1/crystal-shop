import { z } from "zod";

// Shared Zod schema for the checkout shipping form. Used both client-side
// (CheckoutForm) and server-side (order.createFromCart) so validation rules
// never drift between the two.
export const shippingAddressSchema = z.object({
  name: z.string().min(1, "Indica o nome completo."),
  line1: z.string().min(1, "Indica a morada."),
  line2: z.string().optional(),
  city: z.string().min(1, "Indica a cidade."),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Indica o código postal."),
  country: z.string().length(2, "Indica o país."),
});

export const checkoutInputSchema = z.object({
  email: z.string().email("Indica um email válido."),
  phone: z.string().optional(),
  shipping: shippingAddressSchema,
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
