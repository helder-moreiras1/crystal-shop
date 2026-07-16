import Link from "next/link";
import { cn } from "@/utils/cn";

type BrandLogoSize = "sm" | "md" | "lg";

const SIZES: Record<BrandLogoSize, { icon: string; wordmark: string }> = {
  sm: { icon: "text-2xl", wordmark: "text-sm font-bold leading-none" },
  md: { icon: "text-2xl", wordmark: "text-lg font-semibold tracking-tight" },
  lg: { icon: "text-3xl", wordmark: "text-xl font-semibold" },
};

interface BrandLogoProps {
  /** Controls icon/wordmark scale. Defaults to "md" (navbar size). */
  size?: BrandLogoSize;
  /** Optional secondary line shown under the wordmark (e.g. "Painel Admin"). */
  subtitle?: string;
  /** Link target. Pass `null` to render a non-interactive logo (no <Link>). */
  href?: string | null;
  className?: string;
}

/**
 * Reusable Ametta Crystals brand mark (icon + wordmark).
 * Used across the Navbar, AdminSidebar and auth pages to keep branding
 * consistent per docs/BRAND_GUIDELINES.md.
 */
export function BrandLogo({ size = "md", subtitle, href = "/", className }: BrandLogoProps) {
  const { icon, wordmark } = SIZES[size];

  const content = (
    <>
      <span className={icon}>🔮</span>
      {subtitle ? (
        <span className="flex flex-col">
          <span className={cn(wordmark, "text-foreground")}>Ametta Crystals</span>
          <span className="text-xs text-muted-foreground mt-0.5">{subtitle}</span>
        </span>
      ) : (
        <span className={cn(wordmark, "text-foreground")}>Ametta Crystals</span>
      )}
    </>
  );

  const wrapperClassName = cn("inline-flex items-center", subtitle ? "gap-3" : "gap-2", className);

  if (href) {
    return (
      <Link href={href} className={wrapperClassName}>
        {content}
      </Link>
    );
  }

  return <span className={wrapperClassName}>{content}</span>;
}
