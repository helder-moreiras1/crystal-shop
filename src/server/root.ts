import { createTRPCRouter } from "@/server/trpc";
import { productRouter } from "@/server/routers/product";
import { categoryRouter } from "@/server/routers/category";
import { cartRouter } from "@/server/routers/cart";
import { orderRouter } from "@/server/routers/order";
import { userRouter } from "@/server/routers/user";
import { collectionRouter } from "@/server/routers/collection";
import { adminRouter } from "@/server/routers/admin";

export const appRouter = createTRPCRouter({
  product: productRouter,
  category: categoryRouter,
  cart: cartRouter,
  order: orderRouter,
  user: userRouter,
  collection: collectionRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;