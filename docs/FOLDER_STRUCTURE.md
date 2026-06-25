# Folder Structure

## Full Project Layout

```
Crystal_Shop/
│
├── prisma/
│   ├── schema.prisma          # Full database schema (see DATABASE_SCHEMA.md)
│   ├── migrations/            # Auto-generated migration files
│   └── seed.ts                # Seed script for dev/staging data
│
├── public/
│   └── images/                # Static images (logos, placeholders, icons)
│
├── src/
│   │
│   ├── app/                   # Next.js App Router
│   │   │
│   │   ├── (store)/           # Public storefront layout group
│   │   │   ├── layout.tsx     # Header + Footer + Cart drawer
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx           # Product listing
│   │   │   │   └── [slug]/page.tsx    # Product detail
│   │   │   ├── collections/
│   │   │   │   └── [slug]/page.tsx    # Curated collection
│   │   │   ├── cart/
│   │   │   │   └── page.tsx           # Cart page
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx           # Checkout form
│   │   │   │   └── success/page.tsx   # Order confirmed
│   │   │   └── blog/
│   │   │       ├── page.tsx           # Blog listing
│   │   │       └── [slug]/page.tsx    # Blog post
│   │   │
│   │   ├── (auth)/            # Auth layout group (minimal chrome)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── account/           # Protected customer area
│   │   │   ├── layout.tsx     # Account sidebar layout
│   │   │   ├── page.tsx       # Account overview
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Order history
│   │   │   │   └── [id]/page.tsx     # Order detail
│   │   │   ├── addresses/page.tsx
│   │   │   └── wishlist/page.tsx
│   │   │
│   │   ├── admin/             # Protected admin panel
│   │   │   ├── layout.tsx     # Admin sidebar layout
│   │   │   ├── page.tsx       # Dashboard / stats
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product list
│   │   │   │   ├── new/page.tsx      # Create product
│   │   │   │   └── [id]/page.tsx     # Edit product
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   └── coupons/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── trpc/
│   │   │   │   └── [trpc]/route.ts   # tRPC handler
│   │   │   └── webhooks/
│   │   │       └── stripe/route.ts   # Stripe webhook
│   │   │
│   │   ├── layout.tsx         # Root layout (providers, fonts, analytics)
│   │   ├── not-found.tsx
│   │   └── sitemap.ts         # Auto-generated sitemap
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (Button, Input, Dialog...)
│   │   ├── product/
│   │   │   ├── ProductCard.tsx        # Grid card with hover effects
│   │   │   ├── ProductGallery.tsx     # Image gallery with zoom
│   │   │   ├── ProductGrid.tsx        # Responsive product grid
│   │   │   ├── ProductFilters.tsx     # Sidebar filters
│   │   │   ├── ProductSort.tsx        # Sort dropdown
│   │   │   ├── AddToCartButton.tsx
│   │   │   ├── WishlistButton.tsx
│   │   │   └── ReviewList.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx         # Slide-in cart
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx       # Multi-step wrapper
│   │   │   ├── AddressForm.tsx
│   │   │   ├── ShippingForm.tsx
│   │   │   └── PaymentForm.tsx        # Stripe Elements
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── SearchModal.tsx
│   │   ├── blog/
│   │   │   ├── BlogCard.tsx
│   │   │   └── BlogContent.tsx
│   │   ├── account/
│   │   │   ├── OrderCard.tsx
│   │   │   └── AddressCard.tsx
│   │   └── admin/
│   │       ├── StatsCard.tsx
│   │       ├── ProductForm.tsx
│   │       └── OrderTable.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   └── index.ts              # Prisma client singleton
│   │   ├── stripe/
│   │   │   ├── client.ts             # Stripe server client
│   │   │   └── helpers.ts            # formatAmount, createIntent...
│   │   ├── supabase/
│   │   │   ├── server.ts             # Server-side Supabase client
│   │   │   └── client.ts             # Browser Supabase client
│   │   ├── email/
│   │   │   ├── index.ts              # Resend client + send helpers
│   │   │   └── templates/
│   │   │       ├── OrderConfirmation.tsx
│   │   │       ├── ShippingNotification.tsx
│   │   │       ├── AbandonedCart.tsx
│   │   │       └── BackInStock.tsx
│   │   ├── search/
│   │   │   ├── algolia.ts            # Algolia client
│   │   │   └── sync.ts               # Index sync helpers
│   │   └── cloudinary/
│   │       └── index.ts              # Upload + transform helpers
│   │
│   ├── server/
│   │   ├── trpc.ts                   # tRPC init, context, middleware
│   │   ├── root.ts                   # appRouter (merges all routers)
│   │   └── routers/
│   │       ├── product.ts
│   │       ├── category.ts
│   │       ├── collection.ts
│   │       ├── cart.ts
│   │       ├── order.ts
│   │       ├── user.ts
│   │       ├── review.ts
│   │       ├── coupon.ts
│   │       └── admin.ts
│   │
│   ├── hooks/
│   │   ├── useCart.ts               # Cart state + mutations
│   │   ├── useWishlist.ts
│   │   └── useSearch.ts
│   │
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   ├── slugify.ts
│   │   └── cn.ts                    # Tailwind class merge helper
│   │
│   └── types/
│       ├── index.ts                 # Re-exports all types
│       ├── product.ts
│       ├── order.ts
│       └── cart.ts
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MVP_FEATURES.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   ├── INTEGRATIONS.md
│   └── FOLDER_STRUCTURE.md          # This file
│
├── .env.example
├── .env.local                       # Not committed (gitignored)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Key Conventions

| Convention | Rule |
|---|---|
| File naming | `PascalCase` for components, `camelCase` for utils/hooks/lib |
| Server Components | Default in `app/` — use `'use client'` only when needed |
| Data fetching | Server Components call tRPC directly; Client Components use React Query |
| Env vars | `NEXT_PUBLIC_` prefix only for client-safe vars |
| Route groups | `(store)`, `(auth)` — group related routes without affecting URL |
| Error handling | Every tRPC router throws typed `TRPCError`; UI uses error boundaries |
| Validation | Zod schemas defined in `server/routers/*.ts`, reused on client via `@trpc/client` |
