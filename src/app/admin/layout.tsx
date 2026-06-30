import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin | Crystal Shop",
    template: "%s | Admin — Crystal Shop",
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated → silent redirect
  if (!user) redirect("/");

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  // Authenticated but not admin → friendly error
  if (dbUser?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso não autorizado</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Não tens permissões para aceder a esta área. Contacta o administrador se precisares de acesso.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
