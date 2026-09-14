import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: {
    template: "%s | Ametta Crystals",
    default: "Account | Ametta Crystals",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
