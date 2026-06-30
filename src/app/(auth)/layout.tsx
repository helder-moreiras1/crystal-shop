import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Crystal Shop",
    default: "Account | Crystal Shop",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🔮</span>
            <span className="text-xl font-semibold text-foreground">Crystal Shop</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
