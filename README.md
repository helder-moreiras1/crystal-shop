# 🔮 Crystal Shop — Ecommerce Platform

A modern, full-featured ecommerce website for selling crystals and gemstones online.
Built with a spiritual/wellness aesthetic, high-quality imagery, and a seamless checkout experience.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | Next.js 14 (App Router)           |
| Styling      | Tailwind CSS + shadcn/ui          |
| Backend API  | tRPC (type-safe, co-located)      |
| Database     | PostgreSQL via Supabase           |
| ORM          | Prisma                            |
| Auth         | Supabase Auth                     |
| Payments     | Stripe (Payment Intents + Tax)    |
| Media        | Cloudinary                        |
| Email        | Resend + React Email              |
| Search       | Algolia / Typesense               |
| Hosting      | Vercel + Supabase                 |

---

## Documentation

| Document | Description |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture & design decisions |
| [docs/MVP_FEATURES.md](docs/MVP_FEATURES.md) | MVP feature list & phased delivery |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Full database schema & relationships |
| [docs/API_DESIGN.md](docs/API_DESIGN.md) | API design (tRPC routers & endpoints) |
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | Third-party service integrations |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Codebase layout & conventions |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Set up the database
npx prisma migrate dev

# 4. Seed sample data
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
  app/          # Next.js App Router pages
  components/   # Reusable UI components
  lib/          # External service clients
  server/       # tRPC routers & server logic
  hooks/        # Custom React hooks
  utils/        # Helpers & formatters
  types/        # Shared TypeScript types
prisma/         # Database schema & migrations
docs/           # Architecture & design documents
public/         # Static assets
```

---

## Delivery Phases

| Phase | Scope | Duration |
|---|---|---|
| Phase 1 | MVP: catalog, cart, checkout, auth, admin | Weeks 1–6 |
| Phase 2 | Accounts, reviews, search, coupons, blog | Weeks 7–10 |
| Phase 3 | Abandoned cart, analytics, shipping, SEO | Weeks 11–14 |

---

*Crystal Shop — Built with ✨*
