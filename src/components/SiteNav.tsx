import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ArrowRightIcon } from "@/components/icons";

const links = [
  { href: "/plant", label: "Plant" },
  { href: "/forest", label: "My Forest" },
  { href: "/corporate", label: "For Business" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest-100/70 bg-ivory/80 backdrop-blur-md">
      <nav className="container-px flex h-16 items-center justify-between">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-forest-800/80 transition-colors hover:bg-forest-50 hover:text-forest-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/forest" className="btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <Link href="/plant" className="btn-primary">
            Grow Now
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
