# MVP Features

## Definition of MVP
The Minimum Viable Product enables a crystal shop owner to:
- List and manage products with images and descriptions
- Accept online payments from customers
- Manage and fulfil orders
- Send automated order emails

---

## Phase 1 — MVP (Weeks 1–6)

### 🛍️ Storefront

| Feature | Description | Priority |
|---|---|---|
| Homepage | Hero banner, featured products, category grid, trust signals | P0 |
| Product listing page | Grid layout, filter by category, sort by price/name | P0 |
| Product detail page | Image gallery, description, properties, price, add to cart | P0 |
| Shopping cart | Add/remove/update quantities, subtotal, persist on refresh | P0 |
| Guest checkout | No account required to purchase | P0 |
| Stripe payment | Credit/debit card via Stripe Elements | P0 |
| Order confirmation page | Summary after successful payment | P0 |
| Mobile responsive design | All pages work on mobile and tablet | P0 |

### 👤 Authentication

| Feature | Description | Priority |
|---|---|---|
| Email/password registration | Customer account creation | P0 |
| Email/password login | Secure login with JWT | P0 |
| Password reset | Via email link | P0 |
| Session persistence | Stay logged in across tabs | P1 |

### 📦 Order Management (Customer)

| Feature | Description | Priority |
|---|---|---|
| Order history | List of past orders with status | P0 |
| Order detail view | Items, totals, shipping info, status | P0 |

### 📧 Emails

| Feature | Description | Priority |
|---|---|---|
| Order confirmation email | Sent immediately after payment | P0 |
| Password reset email | Triggered by forgot-password flow | P0 |

### 🔧 Admin Panel

| Feature | Description | Priority |
|---|---|---|
| Product create/edit/delete | Full product CRUD with image upload | P0 |
| Product stock management | Set and update inventory levels | P0 |
| Order list | View all orders with status | P0 |
| Order status update | Mark as Shipped, Delivered, Cancelled | P0 |
| Basic dashboard | Order count, revenue, low stock alerts | P1 |

### ⚙️ Technical Foundation

| Feature | Description | Priority |
|---|---|---|
| SEO metadata | Title, description, Open Graph per page | P0 |
| Sitemap.xml | Auto-generated | P1 |
| robots.txt | Configured correctly | P1 |
| HTTPS | Enforced via Vercel | P0 |
| Environment config | .env.example with all variables documented | P0 |

---

## Phase 2 — Core Features (Weeks 7–10)

| Feature | Description |
|---|---|
| User wishlist | Save products for later |
| Saved addresses | Address book in account settings |
| Product reviews & ratings | Verified-purchase reviews with star rating |
| Coupon / discount codes | Percent, fixed, free-shipping coupons |
| Collections pages | Curated product sets (e.g. "Zodiac Crystals") |
| Blog / content | Articles for SEO and crystal education |
| Full-text product search | Instant search with faceted filters |
| Social login | Google & Apple OAuth via Supabase |
| Shipping email | Notification with tracking link |

---

## Phase 3 — Growth (Weeks 11–14)

| Feature | Description |
|---|---|
| Abandoned cart emails | Recover carts after 1hr of inactivity |
| Back-in-stock alerts | Email when out-of-stock item is restocked |
| Analytics events | GA4 + Meta Pixel ecommerce events |
| Admin sales analytics | Revenue charts, top products, conversion |
| Carrier shipping integration | Live rates + label generation (EasyPost/Shippo) |
| Shipment tracking | Auto-update order status from carrier |
| Performance audit | Core Web Vitals optimisation |
| Accessibility audit | WCAG 2.1 AA compliance pass |
| GDPR compliance | Cookie consent, privacy policy, data deletion |

---

## Out of Scope (v1)

- Subscription boxes / recurring billing
- Multi-currency (single currency for MVP)
- Multi-language / i18n
- Mobile app (React Native)
- B2B / wholesale pricing
- Gift cards
- Product bundles
- Live chat / chatbot
- Loyalty points program

---

## Acceptance Criteria (MVP)

A customer can:
- [x] Browse all crystals with images and prices
- [x] Filter products by category
- [x] View a product detail page with full info
- [x] Add a product to cart and adjust quantity
- [x] Complete checkout with a real credit card (Stripe test mode)
- [x] Receive an order confirmation email
- [x] View their order history when logged in

An admin can:
- [x] Log in to `/admin` with admin credentials
- [x] Add, edit, or remove products including images
- [x] Update order status
- [x] See an overview of recent orders and revenue
