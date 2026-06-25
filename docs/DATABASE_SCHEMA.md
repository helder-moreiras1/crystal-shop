# Database Schema

## Overview

PostgreSQL database managed by Supabase. ORM: Prisma.
All tables have Row-Level Security (RLS) enabled in Supabase.

---

## Entity Relationship Diagram

```
User ──────────┬──── Address (1:N)
               ├──── Order (1:N)
               ├──── Cart (1:1)
               ├──── Review (1:N)
               └──── Wishlist (1:1)

Product ───────┬──── ProductImage (1:N)
               ├──── Category (N:1)
               ├──── OrderItem (1:N)
               ├──── CartItem (1:N)
               ├──── Review (1:N)
               └──── Collection (N:M via CollectionProduct)

Order ─────────└──── OrderItem (1:N)

Cart ──────────└──── CartItem (1:N)
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── ENUMS ───────────────────────────────────────────────────────

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum CouponType {
  PERCENT
  FIXED
  FREE_SHIPPING
}

// ─── USERS & AUTH ────────────────────────────────────────────────

model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  avatarUrl   String?
  role        Role      @default(CUSTOMER)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  addresses   Address[]
  orders      Order[]
  cart        Cart?
  reviews     Review[]
  wishlist    Wishlist?
}

model Address {
  id          String   @id @default(cuid())
  userId      String
  line1       String
  line2       String?
  city        String
  state       String?
  postalCode  String
  country     String
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─── PRODUCTS ────────────────────────────────────────────────────

model Product {
  id              String    @id @default(cuid())
  slug            String    @unique
  name            String
  description     String
  price           Decimal   @db.Decimal(10, 2)
  compareAtPrice  Decimal?  @db.Decimal(10, 2)
  sku             String?   @unique
  stock           Int       @default(0)
  weight          Float?    // grams, for shipping
  origin          String?   // e.g. "Brazil", "Madagascar"
  chakras         String[]  // e.g. ["Crown", "Third Eye"]
  properties      String[]  // e.g. ["Calming", "Protection"]
  isFeatured      Boolean   @default(false)
  isActive        Boolean   @default(true)
  categoryId      String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  category        Category           @relation(fields: [categoryId], references: [id])
  images          ProductImage[]
  orderItems      OrderItem[]
  cartItems       CartItem[]
  reviews         Review[]
  collections     CollectionProduct[]
  wishlistItems   WishlistProduct[]
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  url       String
  altText   String?
  position  Int     @default(0)

  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Category {
  id          String     @id @default(cuid())
  slug        String     @unique
  name        String
  description String?
  imageUrl    String?
  parentId    String?

  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]
}

model Collection {
  id          String             @id @default(cuid())
  slug        String             @unique
  name        String
  description String?
  imageUrl    String?
  isActive    Boolean            @default(true)

  products    CollectionProduct[]
}

model CollectionProduct {
  collectionId  String
  productId     String
  position      Int     @default(0)

  collection    Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  product       Product    @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@id([collectionId, productId])
}

// ─── REVIEWS ─────────────────────────────────────────────────────

model Review {
  id          String   @id @default(cuid())
  productId   String
  userId      String
  rating      Int      // 1–5
  title       String?
  body        String?
  isVerified  Boolean  @default(false) // verified purchase
  createdAt   DateTime @default(now())

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─── CART ────────────────────────────────────────────────────────

model Cart {
  id        String     @id @default(cuid())
  userId    String?    @unique
  sessionId String?    @unique // for guest carts
  expiresAt DateTime?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User?      @relation(fields: [userId], references: [id], onDelete: SetNull)
  items     CartItem[]
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int

  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])
}

// ─── ORDERS ──────────────────────────────────────────────────────

model Order {
  id                    String      @id @default(cuid())
  userId                String?
  email                 String      // captured at checkout (guest-friendly)
  status                OrderStatus @default(PENDING)

  subtotal              Decimal     @db.Decimal(10, 2)
  discountAmount        Decimal     @default(0) @db.Decimal(10, 2)
  shippingCost          Decimal     @default(0) @db.Decimal(10, 2)
  tax                   Decimal     @default(0) @db.Decimal(10, 2)
  total                 Decimal     @db.Decimal(10, 2)

  stripePaymentIntentId String?     @unique
  couponCode            String?
  trackingNumber        String?
  notes                 String?

  // Shipping snapshot (captured at checkout)
  shippingName          String
  shippingLine1         String
  shippingLine2         String?
  shippingCity          String
  shippingState         String?
  shippingPostalCode    String
  shippingCountry       String

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  user                  User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  items                 OrderItem[]
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String
  productName String   // snapshot at time of purchase
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)

  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Restrict)
}

// ─── COUPONS ─────────────────────────────────────────────────────

model Coupon {
  id              String     @id @default(cuid())
  code            String     @unique
  type            CouponType
  value           Decimal    @db.Decimal(10, 2)
  minOrderAmount  Decimal?   @db.Decimal(10, 2)
  usageLimit      Int?
  usageCount      Int        @default(0)
  expiresAt       DateTime?
  isActive        Boolean    @default(true)
  createdAt       DateTime   @default(now())
}

// ─── WISHLIST ────────────────────────────────────────────────────

model Wishlist {
  id        String            @id @default(cuid())
  userId    String            @unique
  createdAt DateTime          @default(now())

  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  products  WishlistProduct[]
}

model WishlistProduct {
  wishlistId  String
  productId   String
  addedAt     DateTime @default(now())

  wishlist    Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@id([wishlistId, productId])
}
```

---

## Indexes

```sql
-- Performance indexes (add to schema.prisma @@index blocks)
Product: slug, categoryId, isFeatured, isActive
Order: userId, status, createdAt
CartItem: cartId, productId
Review: productId, userId
Category: slug, parentId
```

---

## Row-Level Security (Supabase RLS)

| Table | Policy | Rule |
|---|---|---|
| User | SELECT own | `auth.uid() = id` |
| Address | ALL own | `auth.uid() = userId` |
| Order | SELECT own | `auth.uid() = userId` |
| Cart | ALL own | `auth.uid() = userId OR sessionId = current_setting(...)` |
| Review | INSERT own | `auth.uid() = userId` |
| Product | SELECT | Public (anyone) |
| Product | ALL | Admin only |

---

## Seed Data Categories

```
Crystals by Type:
  ├── Raw Crystals
  ├── Tumbled Stones
  ├── Crystal Points & Towers
  ├── Crystal Spheres
  ├── Clusters & Geodes
  └── Crystal Jewellery

Crystals by Chakra:
  ├── Root (Red/Black)
  ├── Sacral (Orange)
  ├── Solar Plexus (Yellow)
  ├── Heart (Green/Pink)
  ├── Throat (Blue)
  ├── Third Eye (Indigo)
  └── Crown (Violet/White)
```
