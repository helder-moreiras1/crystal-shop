import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await syncUserToPrisma(data.user.id, data.user.email, data.user.user_metadata);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

async function syncUserToPrisma(
  id: string,
  email: string | undefined,
  user_metadata: Record<string, unknown>
) {
  if (!email) return;
  try {
    await db.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
        name: (user_metadata?.full_name as string) ?? null,
        role: "CUSTOMER",
      },
    });
  } catch {
    // Non-fatal: auth flow continues even if DB sync fails
  }
}
