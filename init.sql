-- Crystal Shop — Initial Schema
-- Generated from prisma/schema.prisma
-- Apply this in Supabase Dashboard → SQL Editor

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED', 'FREE_SHIPPING');

-- ─── USERS ───────────────────────────────────────────────────────────────────

CREATE TABLE "User" (
  "id"        TEXT        NOT NULL,
  "email"     TEXT        NOT NULL,
  "name"      TEXT,
  "avatarUrl" TEXT,
  "role"      "Role"      NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Address" (
  "id"         TEXT        NOT NULL,
  "userId"     TEXT        NOT NULL,
  "line1"      TEXT        NOT NULL,
  "line2"      TEXT,
  "city"       TEXT        NOT NULL,
  "state"      TEXT,
  "postalCode" TEXT        NOT NULL,
  "country"    TEXT        NOT NULL,
  "isDefault"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Address_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────

CREATE TABLE "Category" (
  "id"          TEXT  NOT NULL,
  "slug"        TEXT  NOT NULL,
  "name"        TEXT  NOT NULL,
  "description" TEXT,
  "imageUrl"    TEXT,
  "parentId"    TEXT,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_slug_idx"     ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- ─── COLLECTIONS ─────────────────────────────────────────────────────────────

CREATE TABLE "Collection" (
  "id"          TEXT    NOT NULL,
  "slug"        TEXT    NOT NULL,
  "name"        TEXT    NOT NULL,
  "description" TEXT,
  "imageUrl"    TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────

CREATE TABLE "Product" (
  "id"             TEXT           NOT NULL,
  "slug"           TEXT           NOT NULL,
  "name"           TEXT           NOT NULL,
  "description"    TEXT           NOT NULL,
  "price"          DECIMAL(10, 2) NOT NULL,
  "compareAtPrice" DECIMAL(10, 2),
  "sku"            TEXT,
  "stock"          INTEGER        NOT NULL DEFAULT 0,
  "weight"         DOUBLE PRECISION,
  "origin"         TEXT,
  "chakras"        TEXT[]         NOT NULL DEFAULT '{}',
  "properties"     TEXT[]         NOT NULL DEFAULT '{}',
  "isFeatured"     BOOLEAN        NOT NULL DEFAULT FALSE,
  "isActive"       BOOLEAN        NOT NULL DEFAULT TRUE,
  "categoryId"     TEXT           NOT NULL,
  "createdAt"      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ    NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
);
CREATE UNIQUE INDEX "Product_slug_key"  ON "Product"("slug");
CREATE UNIQUE INDEX "Product_sku_key"   ON "Product"("sku");
CREATE INDEX "Product_slug_idx"         ON "Product"("slug");
CREATE INDEX "Product_categoryId_idx"   ON "Product"("categoryId");
CREATE INDEX "Product_isFeatured_idx"   ON "Product"("isFeatured");
CREATE INDEX "Product_isActive_idx"     ON "Product"("isActive");

CREATE TABLE "ProductImage" (
  "id"        TEXT    NOT NULL,
  "productId" TEXT    NOT NULL,
  "url"       TEXT    NOT NULL,
  "altText"   TEXT,
  "position"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE TABLE "CollectionProduct" (
  "collectionId" TEXT    NOT NULL,
  "productId"    TEXT    NOT NULL,
  "position"     INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "CollectionProduct_pkey" PRIMARY KEY ("collectionId", "productId"),
  CONSTRAINT "CollectionProduct_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE,
  CONSTRAINT "CollectionProduct_productId_fkey"    FOREIGN KEY ("productId")    REFERENCES "Product"("id")    ON DELETE CASCADE
);

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────

CREATE TABLE "Review" (
  "id"         TEXT        NOT NULL,
  "productId"  TEXT        NOT NULL,
  "userId"     TEXT        NOT NULL,
  "rating"     INTEGER     NOT NULL,
  "title"      TEXT,
  "body"       TEXT,
  "isVerified" BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
  CONSTRAINT "Review_userId_fkey"    FOREIGN KEY ("userId")    REFERENCES "User"("id")    ON DELETE CASCADE
);
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- ─── CART ────────────────────────────────────────────────────────────────────

CREATE TABLE "Cart" (
  "id"        TEXT        NOT NULL,
  "userId"    TEXT,
  "sessionId" TEXT,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "Cart_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX "Cart_userId_key"    ON "Cart"("userId");
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "Cart"("sessionId");

CREATE TABLE "CartItem" (
  "id"        TEXT    NOT NULL,
  "cartId"    TEXT    NOT NULL,
  "productId" TEXT    NOT NULL,
  "quantity"  INTEGER NOT NULL,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CartItem_cartId_productId_key" UNIQUE ("cartId", "productId"),
  CONSTRAINT "CartItem_cartId_fkey"    FOREIGN KEY ("cartId")    REFERENCES "Cart"("id")    ON DELETE CASCADE,
  CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────

CREATE TABLE "Order" (
  "id"                    TEXT           NOT NULL,
  "userId"                TEXT,
  "email"                 TEXT           NOT NULL,
  "status"                "OrderStatus"  NOT NULL DEFAULT 'PENDING',
  "subtotal"              DECIMAL(10, 2) NOT NULL,
  "discountAmount"        DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "shippingCost"          DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "tax"                   DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "total"                 DECIMAL(10, 2) NOT NULL,
  "stripePaymentIntentId" TEXT,
  "couponCode"            TEXT,
  "trackingNumber"        TEXT,
  "notes"                 TEXT,
  "shippingName"          TEXT           NOT NULL,
  "shippingLine1"         TEXT           NOT NULL,
  "shippingLine2"         TEXT,
  "shippingCity"          TEXT           NOT NULL,
  "shippingState"         TEXT,
  "shippingPostalCode"    TEXT           NOT NULL,
  "shippingCountry"       TEXT           NOT NULL,
  "createdAt"             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMPTZ    NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");
CREATE INDEX "Order_userId_idx"    ON "Order"("userId");
CREATE INDEX "Order_status_idx"    ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

CREATE TABLE "OrderItem" (
  "id"          TEXT           NOT NULL,
  "orderId"     TEXT           NOT NULL,
  "productId"   TEXT           NOT NULL,
  "productName" TEXT           NOT NULL,
  "quantity"    INTEGER        NOT NULL,
  "unitPrice"   DECIMAL(10, 2) NOT NULL,
  "totalPrice"  DECIMAL(10, 2) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderItem_orderId_fkey"   FOREIGN KEY ("orderId")   REFERENCES "Order"("id")   ON DELETE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT
);

-- ─── COUPONS ─────────────────────────────────────────────────────────────────

CREATE TABLE "Coupon" (
  "id"             TEXT           NOT NULL,
  "code"           TEXT           NOT NULL,
  "type"           "CouponType"   NOT NULL,
  "value"          DECIMAL(10, 2) NOT NULL,
  "minOrderAmount" DECIMAL(10, 2),
  "usageLimit"     INTEGER,
  "usageCount"     INTEGER        NOT NULL DEFAULT 0,
  "expiresAt"      TIMESTAMPTZ,
  "isActive"       BOOLEAN        NOT NULL DEFAULT TRUE,
  "createdAt"      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- ─── WISHLIST ────────────────────────────────────────────────────────────────

CREATE TABLE "Wishlist" (
  "id"        TEXT        NOT NULL,
  "userId"    TEXT        NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Wishlist_userId_key" ON "Wishlist"("userId");

CREATE TABLE "WishlistProduct" (
  "wishlistId" TEXT        NOT NULL,
  "productId"  TEXT        NOT NULL,
  "addedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "WishlistProduct_pkey" PRIMARY KEY ("wishlistId", "productId"),
  CONSTRAINT "WishlistProduct_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE,
  CONSTRAINT "WishlistProduct_productId_fkey"  FOREIGN KEY ("productId")  REFERENCES "Product"("id")  ON DELETE CASCADE
);
