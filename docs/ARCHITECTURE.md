# Architecture Overview

## System Design

Ametta Crystals is a monorepo Next.js application combining frontend and backend in a single codebase,
deployed on Vercel with Supabase as the managed data platform.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                         │
│   Next.js App (React)  ·  Tailwind CSS  ·  shadcn/ui           │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────────────┐
│                         VERCEL EDGE / CDN                       │
│  Next.js SSR/SSG  ·  API Routes  ·  Edge Middleware (auth)      │
└──────────┬────────────────────────┬────────────────────────────┘
           │ tRPC                   │ Direct (auth, storage)
┌──────────▼──────────┐   ┌────────▼────────────────────────────┐
│   Next.js API       │   │           SUPABASE                  │
│   /api/trpc/[trpc]  │   │  PostgreSQL · Auth · Storage · RLS  │
│                     │   └─────────────────────────────────────┘
│   Business Logic    │
│   Prisma ORM        │   ┌─────────────────────────────────────┐
│   Validation (Zod)  │   │            STRIPE                   │
└─────────────────────┘   │  Payment Intents · Tax · Webhooks   │
                           └─────────────────────────────────────┘
                           ┌─────────────────────────────────────┐
                           │          THIRD-PARTY SERVICES       │
                           │  Cloudinary · Resend · Algolia      │
                           └─────────────────────────────────────┘
```

---

## Architectural Decisions

### 1. Next.js App Router (Monorepo)
**Decision**: Use Next.js with App Router as the single application.
**Rationale**:
- Co-located frontend + API routes reduce infrastructure complexity
- App Router enables per-route streaming, layouts, and Server Components
- Server Components fetch data directly (no client-side waterfall for initial loads)
- API routes handle webhooks, tRPC, and server actions

### 2. tRPC for API Layer
**Decision**: tRPC instead of REST or GraphQL.
**Rationale**:
- End-to-end TypeScript type safety between client and server
- No code generation step (unlike GraphQL)
- Lightweight and co-located with Next.js
- React Query integration for caching and optimistic updates

### 3. Supabase as Data Platform
**Decision**: Supabase (managed PostgreSQL) over plain Postgres or another DB.
**Rationale**:
- Managed DB with automated backups, connection pooling (pgBouncer), and monitoring
- Auth (social login, magic links, JWT) built-in — no separate auth service
- Row-Level Security (RLS) for data isolation at the DB level
- File storage for product images (fallback to Cloudinary)
- Realtime subscriptions available if needed (e.g., live inventory)

### 4. Prisma ORM
**Decision**: Prisma over raw SQL or Drizzle.
**Rationale**:
- Type-safe query builder with auto-generated types from schema
- Migration tooling with version history
- Introspection-friendly for schema evolution
- Works seamlessly with Supabase PostgreSQL

### 5. Stripe for Payments
**Decision**: Stripe Payment Intents + Stripe Tax.
**Rationale**:
- Industry-standard, PCI-compliant
- Stripe Tax handles VAT/GST automatically by country
- Webhook-driven order fulfillment (reliable, retryable)
- Easy path to subscriptions (crystal subscription boxes) in future

---

## Request Flow — Product Page Load

```
1. User navigates to /shop/amethyst-cluster
2. Next.js Server Component calls product.bySlug (server-side tRPC)
3. tRPC router queries Prisma → PostgreSQL (Supabase)
4. HTML streamed to browser with product data embedded
5. Client-side React hydrates interactive elements (gallery, add-to-cart)
6. Product images served via Cloudinary CDN (optimized, responsive)
```

## Request Flow — Checkout

```
1. User clicks "Checkout" → POST /api/trpc/order.createIntent
2. Server creates Stripe PaymentIntent, returns client_secret
3. Client renders Stripe Elements with client_secret
4. User enters card → Stripe processes payment
5. Stripe sends webhook to /api/webhooks/stripe
6. Webhook handler: verifies signature → creates Order in DB → sends confirmation email
7. User redirected to /checkout/success?order_id=xxx
```

---

## Security

| Concern | Approach |
|---|---|
| Authentication | Supabase JWT verified on every tRPC request |
| Authorization | tRPC middleware checks roles; RLS at DB level |
| Payment data | Never touches our server — Stripe Elements (PCI scope) |
| Webhooks | Stripe signature verification (`stripe.webhooks.constructEvent`) |
| Input validation | Zod schemas on every tRPC input |
| CSRF | SameSite cookies + Next.js CSRF protection |
| Rate limiting | Upstash Redis rate limiter on auth and checkout routes |
| Secrets | Environment variables only — never committed |

---

## Caching Strategy

| Data | Cache | TTL |
|---|---|---|
| Product listing | ISR (Incremental Static Regeneration) | 60s |
| Product detail | ISR | 60s |
| Blog posts | ISR | 5min |
| Cart | Client (React Query) | Session |
| User session | Supabase JWT cookie | 1hr |
| Search results | Algolia client cache | 5min |

---

## Scalability Considerations

- **Stateless API**: All state in DB or client — horizontal scaling ready
- **Edge middleware**: Auth token verification at Vercel Edge (low latency)
- **CDN**: Static assets and ISR pages served from Vercel's global CDN
- **DB connection pooling**: Supabase pgBouncer handles high concurrency
- **Search offloaded**: Algolia handles search load, not the DB
- **Image delivery**: Cloudinary CDN — zero load on app server for images
