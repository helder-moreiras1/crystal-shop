import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { createCallerFactory, createTRPCContext } from "@/server/trpc";
import { appRouter } from "@/server/root";

const createCaller = createCallerFactory(appRouter);

/**
 * Server-side tRPC caller — memoised per request via React cache().
 * Use in Server Components: `const caller = await api(); const data = await caller.product.list(...)`
 */
export const api = cache(async () => {
  const heads = await headers();
  const ctx = await createTRPCContext({ headers: heads });
  return createCaller(ctx);
});
