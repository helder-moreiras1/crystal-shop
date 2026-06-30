import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/account/LogoutButton";

export const metadata: Metadata = {
  title: "A minha conta | Crystal Shop",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name ?? "Utilizador";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {initials}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center rounded-lg bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">Nome</span>
            <span className="text-sm font-medium text-foreground">{name}</span>
          </div>
          <div className="flex justify-between items-center rounded-lg bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium text-foreground">{user.email}</span>
          </div>
          <div className="flex justify-between items-center rounded-lg bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">Conta criada</span>
            <span className="text-sm font-medium text-foreground">
              {new Date(user.created_at).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}
