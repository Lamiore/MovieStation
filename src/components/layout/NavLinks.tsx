"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/history", label: "History" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden items-center gap-1 text-sm md:flex"
    >
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`group relative rounded-md px-3 py-2 font-medium transition-colors ${
              isActive
                ? "text-text"
                : "text-muted-foreground hover:text-text"
            }`}
          >
            {link.label}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-x-3 -bottom-px h-[2px] origin-center rounded-full bg-primary transition-transform duration-300 ease-out ${
                isActive
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
