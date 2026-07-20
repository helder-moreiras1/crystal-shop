import Link from "next/link";
import { Gem } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <Gem className="h-9 w-9 text-primary" strokeWidth={1.75} />
        </span>
        <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          O cristal que procuras parece ter desaparecido noutras dimensões. Não te preocupes — temos muito mais para descobrir!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Voltar ao início
          </Link>
          <Link
            href="/shop"
            className="rounded-md border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Explorar a loja
          </Link>
        </div>
      </div>
    </div>
  );
}
