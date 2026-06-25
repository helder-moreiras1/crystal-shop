# API Design

## Overview

The API is built with **tRPC** (TypeScript Remote Procedure Call), providing full end-to-end type safety.
All procedures are validated with **Zod** schemas.
The tRPC router is mounted at `/api/trpc/[trpc]`.

---

## Router Tree

```
appRouter
  ├── product
  │   ├── list
  │   ├── bySlug
  │   ├── featured
  │   ├── search
  │   └── related
  │
  ├── category
  │   ├── tree
  │   └── bySlug
  │
  ├── collection
  │   ├── list
  │   └── bySlug
  │
  ├── cart
  │   ├── get
  │   ├── addItem
  │   ├── updateItem
  │   ├── removeItem
  │   └── clear
  │
  ├── order
  │   ├── createIntent    ← creates Stripe PaymentIntent
  │   ├── confirm         ← called after Stripe webhook
  │   ├── list            ← customer's own orders
  │   ├── byId
  │   └── cancel
  │
  ├── user
  │   ├── profile.get
  │   ├── profile.update
  │   ├── addresses.list
  │   ├── addresses.create
  │   ├── addresses.update
  │   ├── addresses.delete
  │   ├── wishlist.get
  │   ├── wishlist.add
  │   └── wishlist.remove
  │
  ├── review
  │   ├── list            ← by productId
  │   ├── create
  │   └── delete          ← own review only
  │
  ├── coupon
  │   └── validate        ← check code + return discount
  │
  └── admin               ← ADMIN ROLE REQUIRED
      ├── product.create
      ├── product.update
      ├── product.delete
      ├── order.list
      ├── order.updateStatus
      ├── order.list
      ├── customer.list
      ├── coupon.create
      ├── coupon.update
      ├── coupon.delete
      ├── inventory.adjust
      └── dashboard.stats
```

---

## Procedure Definitions

### product.list

```ts
input: z.object({
  page:       z.number().min(1).default(1),
  limit:      z.number().min(1).max(100).default(24),
  categoryId: z.string().optional(),
  minPrice:   z.number().optional(),
  maxPrice:   z.number().optional(),
  chakras:    z.array(z.string()).optional(),
  sort:       z.enum(['price_asc', 'price_desc', 'newest', 'popular']).default('newest'),
  inStock:    z.boolean().optional(),
})

output: {
  items: Product[],
  total: number,
  page: number,
  totalPages: number,
}
```

### product.bySlug

```ts
input:  z.object({ slug: z.string() })
output: Product & { images: ProductImage[], category: Category, reviews: Review[] }
```

### cart.addItem

```ts
input: z.object({
  productId: z.string(),
  quantity:  z.number().min(1).max(99),
})
output: Cart & { items: CartItem[] }
```

### order.createIntent

```ts
input: z.object({
  cartId:     z.string(),
  couponCode: z.string().optional(),
  shipping: z.object({
    name:       z.string(),
    line1:      z.string(),
    city:       z.string(),
    postalCode: z.string(),
    country:    z.string(),
  }),
})
output: {
  clientSecret:      string,   // Stripe PaymentIntent client_secret
  orderId:           string,
  total:             number,
  breakdown: {
    subtotal:        number,
    discount:        number,
    shipping:        number,
    tax:             number,
  }
}
```

### admin.dashboard.stats

```ts
input: z.object({
  period: z.enum(['today', '7d', '30d', '90d', 'all']).default('30d'),
})
output: {
  totalRevenue:   number,
  orderCount:     number,
  avgOrderValue:  number,
  newCustomers:   number,
  topProducts:    { name: string, sold: number, revenue: number }[],
  recentOrders:   Order[],
  lowStockItems:  { name: string, stock: number }[],
}
```

---

## Webhook Endpoints

### POST /api/webhooks/stripe

Handles Stripe events. Verifies `stripe-signature` header.

| Event | Action |
|---|---|
| `payment_intent.succeeded` | Mark order as PAID, reduce stock, send confirmation email |
| `payment_intent.payment_failed` | Mark order as CANCELLED, restore cart |
| `charge.refunded` | Mark order as REFUNDED, notify customer |

---

## Authentication & Authorization

### tRPC Context

```ts
// server/trpc.ts
export const createTRPCContext = async ({ req }: CreateNextContextOptions) => {
  const supabase = createServerClient(req)
  const { data: { user } } = await supabase.auth.getUser()
  return { db: prisma, user, supabase }
}
```

### Middleware

```ts
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, user: ctx.user } })
})

const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== 'ADMIN') throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx })
})

export const publicProcedure    = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)
export const adminProcedure     = t.procedure.use(isAdmin)
```

---

## Error Codes

| Code | When |
|---|---|
| `UNAUTHORIZED` | Not logged in, required |
| `FORBIDDEN` | Logged in, but insufficient role |
| `NOT_FOUND` | Resource doesn't exist |
| `BAD_REQUEST` | Invalid input (Zod validation) |
| `CONFLICT` | Duplicate (e.g., duplicate coupon code) |
| `PRECONDITION_FAILED` | Business rule violation (e.g., out of stock) |
| `INTERNAL_SERVER_ERROR` | Unhandled server error |
