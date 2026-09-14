import "server-only";
import { db } from "@/lib/db";

/**
 * Ensures a Supabase-authenticated user has a matching Prisma `User` row.
 * Reused by the auth callback, the account page, the checkout flow and the
 * dev-only debug route so the sync logic lives in exactly one place.
 */
export async function syncUserToPrisma(
  id: string,
  email: string | undefined | null,
  userMetadata?: Record<string, unknown>
) {
  if (!email) return null;

  try {
    return await db.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
        name: (userMetadata?.full_name as string) ?? null,
        role: "CUSTOMER",
      },
    });
  } catch (err) {
    console.error("[syncUserToPrisma] Failed to sync user to Prisma:", err);
    return null;
  }
}
