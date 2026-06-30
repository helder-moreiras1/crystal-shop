import Link from "next/link";
import { api } from "@/lib/trpc/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/product/ProductGrid";

const CATEGORY_ICONS: Record<string, string> = {
  crystals: "💎",
  "raw-crystals": "🪨",
  "tumbled-stones": "✨",
  "crystal-clusters": "🌟",
  "crystal-jewelry": "💍",
  "crystal-sets": "🎁",
};

export default async function HomePage() {
  const caller = await api();
  const [featured, categories] = await Promise.all([
    caller.product.featured(),
    caller.category.tree(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-primary/10 py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
              Cristais Selecionados à Mão
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Descobre o Poder dos{" "}
              <span className="text-primary">Cristais</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
              Explora a nossa coleção cuidadosamente selecionada de cristais, pedras preciosas e
              pedras de cura de origem ética. Cada peça é escolhida à mão com intenção e cuidado.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Ver Todos os Cristais
              </Link>
              <Link
                href="/collections"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-8 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Ver Coleções
              </Link>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent blur-3xl pointer-events-none" />
        </section>

        {/* Featured products */}
        {featured.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Cristais em Destaque
                  </h2>
                  <p className="text-muted-foreground mt-1">Os nossos favoritos</p>
                </div>
                <Link
                  href="/shop"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver tudo →
                </Link>
              </div>
              <ProductGrid products={featured} />
            </div>
          </section>
        )}

        {/* Category highlights */}
        {categories.length > 0 && (
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Comprar por Categoria
              </h2>
              <p className="text-muted-foreground mb-8">Encontra o teu cristal perfeito</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.id}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <span className="text-4xl">{CATEGORY_ICONS[cat.slug] ?? "🔮"}</span>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Value props */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                {
                  icon: "🌍",
                  title: "Origem Responsável",
                  desc: "Cada cristal é adquirido de forma responsável junto de fornecedores de confiança em todo o mundo.",
                },
                {
                  icon: "✋",
                  title: "Selecionado à Mão",
                  desc: "Selecionamos cada peça pessoalmente pela sua qualidade, energia e beleza natural.",
                },
                {
                  icon: "📦",
                  title: "Embalado com Cuidado",
                  desc: "Embalado com carinho e enviado para que o teu cristal chegue em perfeitas condições.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center text-center gap-3">
                  <span className="text-4xl">{icon}</span>
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

