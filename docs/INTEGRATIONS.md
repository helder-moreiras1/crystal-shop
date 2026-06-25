# Third-Party Integrations

## Overview

| Service | Purpose | Phase |
|---|---|---|
| Supabase | Database, Auth, Storage | Phase 1 |
| Stripe | Payments, Tax, Refunds | Phase 1 |
| Cloudinary | Image hosting & optimization | Phase 1 |
| Resend + React Email | Transactional emails | Phase 1 |
| Algolia / Typesense | Product search | Phase 2 |
| Google Analytics 4 | Traffic & ecommerce analytics | Phase 3 |
| Meta Pixel | Ad conversion tracking | Phase 3 |
| EasyPost / Shippo | Shipping rates & labels | Phase 3 |

---

## 1. Supabase

**Purpose**: Managed PostgreSQL + Auth + File Storage

### Setup
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-only, never expose to client
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...        # for Prisma migrations
```

### Auth Providers Configured
- Email/password (magic link optional)
- Google OAuth
- Apple OAuth

### RLS Policies
See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for Row-Level Security policy details.

---

## 2. Stripe

**Purpose**: Payment processing, tax calculation, refunds

### Setup
```
STRIPE_SECRET_KEY=sk_live_...       # server-only
STRIPE_PUBLISHABLE_KEY=pk_live_...  # safe for client
STRIPE_WEBHOOK_SECRET=whsec_...     # for webhook signature verification
STRIPE_TAX_RATE_ID=txr_...          # optional, or use Stripe Tax
```

### Flow
1. Server creates `PaymentIntent` with `amount`, `currency`, `metadata`
2. Client renders `<PaymentElement>` using `clientSecret`
3. Stripe processes payment and calls webhook
4. Webhook handler confirms order in DB

### Webhook Events Handled
| Event | Handler |
|---|---|
| `payment_intent.succeeded` | Create order, reduce stock, send email |
| `payment_intent.payment_failed` | Cancel pending order |
| `charge.refunded` | Update order to REFUNDED |

### Test Cards
| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | 3DS required |

---

## 3. Cloudinary

**Purpose**: Product image hosting, optimization, CDN delivery

### Setup
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123...     # server-only
```

### Usage
```ts
// Upload from admin panel
const result = await cloudinary.uploader.upload(file, {
  folder: 'crystal-shop/products',
  transformation: [{ quality: 'auto', fetch_format: 'auto' }],
})

// Responsive image URLs
const thumbUrl = cloudinary.url(publicId, { width: 400, height: 400, crop: 'fill' })
const fullUrl  = cloudinary.url(publicId, { width: 1200, quality: 'auto' })
```

### Transformations
| Variant | Dimensions | Use |
|---|---|---|
| Thumbnail | 200×200 | Cart, wishlist |
| Card | 400×400 | Product grid |
| Detail | 800×800 | Product gallery |
| Hero | 1200×600 | Homepage, collections |

---

## 4. Resend + React Email

**Purpose**: Transactional email delivery with React-based templates

### Setup
```
RESEND_API_KEY=re_...
EMAIL_FROM=orders@crystalshop.com
```

### Email Templates

| Template | Trigger | File |
|---|---|---|
| Order Confirmation | `payment_intent.succeeded` | `src/lib/email/templates/OrderConfirmation.tsx` |
| Shipping Notification | Order status → SHIPPED | `src/lib/email/templates/ShippingNotification.tsx` |
| Password Reset | Supabase Auth | Handled by Supabase |
| Abandoned Cart | Cron job (1hr after last activity) | `src/lib/email/templates/AbandonedCart.tsx` |
| Back In Stock | Inventory restored | `src/lib/email/templates/BackInStock.tsx` |

### Sending Email
```ts
import { Resend } from 'resend'
import { OrderConfirmationEmail } from '@/lib/email/templates/OrderConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: process.env.EMAIL_FROM!,
  to: order.email,
  subject: `Order Confirmed — #${order.id}`,
  react: <OrderConfirmationEmail order={order} />,
})
```

---

## 5. Algolia (Search)

**Purpose**: Fast product search with faceted filtering

### Setup
```
ALGOLIA_APP_ID=XXXXXXXXXX
ALGOLIA_SEARCH_KEY=...          # client-safe (search only)
ALGOLIA_ADMIN_KEY=...           # server-only (indexing)
ALGOLIA_INDEX_NAME=products
```

### Index Schema
```ts
interface ProductRecord {
  objectID:    string   // product.id
  name:        string
  slug:        string
  description: string
  price:       number
  imageUrl:    string
  category:    string
  chakras:     string[]
  properties:  string[]
  origin:      string
  rating:      number
  reviewCount: number
  inStock:     boolean
}
```

### Facets Configured
- `category` (menu)
- `chakras` (checkbox list)
- `price` (range slider)
- `origin` (checkbox list)
- `rating` (star filter)
- `inStock` (toggle)

### Syncing
- Full sync on product create/update/delete (via tRPC admin procedures)
- Webhook to re-index on stock change

---

## 6. Google Analytics 4

**Purpose**: Traffic analytics and ecommerce event tracking

### Setup
```
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

### Ecommerce Events
```ts
// View product
gtag('event', 'view_item', { items: [{ item_id, item_name, price }] })

// Add to cart
gtag('event', 'add_to_cart', { currency: 'GBP', value, items })

// Begin checkout
gtag('event', 'begin_checkout', { currency, value, items })

// Purchase
gtag('event', 'purchase', { transaction_id, value, tax, shipping, items })
```

---

## 7. EasyPost (Shipping)

**Purpose**: Multi-carrier shipping rates and label generation

### Setup
```
EASYPOST_API_KEY=EZTKxxx...
```

### Flow
1. Admin ships order → request rates from EasyPost
2. Select cheapest/fastest carrier rate
3. Purchase label → get `tracking_code`
4. Save `tracking_code` on Order, update status to SHIPPED
5. EasyPost webhook → update Order status as parcel moves

---

## Environment Variables Summary

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=
EMAIL_FROM=

# Algolia
ALGOLIA_APP_ID=
ALGOLIA_SEARCH_KEY=
ALGOLIA_ADMIN_KEY=
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=

# Google Analytics
NEXT_PUBLIC_GA4_ID=

# EasyPost (Phase 3)
EASYPOST_API_KEY=
```
