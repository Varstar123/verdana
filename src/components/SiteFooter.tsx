import Link from "next/link";
import { Logo } from "@/components/Logo";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/plant", label: "Plant a tree" },
      { href: "/forest", label: "My Forest" },
      { href: "/checkout", label: "Gift trees" },
    ],
  },
  {
    title: "Business",
    links: [
      { href: "/corporate", label: "For Business" },
      { href: "/corporate", label: "ESG reporting" },
      { href: "/corporate", label: "API & integrations" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/#verification", label: "How verification works" },
      { href: "/#impact", label: "Impact data" },
      { href: "/#partners", label: "Planting partners" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-forest-100 bg-white">
      <div className="container-px grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-forest-900/60">
            Own a piece of Earth&apos;s future. Real trees, GPS-verified and
            tracked from your phone.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-forest-900/70 transition-colors hover:text-forest-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-forest-100">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-6 text-xs text-forest-900/50 sm:flex-row">
          <p>© {2026} Verdana. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />
            Reforest the world. One tree at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
