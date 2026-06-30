import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl mb-4">🔮</p>
        <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The crystal you&apos;re looking for seems to have vanished into another dimension.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/shop"
            className="rounded-md border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    </div>
  );
}
