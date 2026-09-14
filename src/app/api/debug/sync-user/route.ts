import { createClient } from "@/lib/supabase/server";
import { syncUserToPrisma } from "@/lib/auth/syncUser";
import { NextResponse } from "next/server";

// DEV-ONLY: hit GET /api/debug/sync-user to manually trigger sync and see errors
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated", detail: authError?.message }, { status: 401 });
  }

  const result = await syncUserToPrisma(user.id, user.email, user.user_metadata);
  if (!result) {
    return NextResponse.json({ ok: false, error: "Failed to sync user" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user: result });
}
