import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Chrome for the original V1 commerce/marketing pages (plant, checkout,
 * corporate, forest). Kept intact under the (legacy) route group while the V2
 * social platform lives under (app).
 */
export default function LegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
