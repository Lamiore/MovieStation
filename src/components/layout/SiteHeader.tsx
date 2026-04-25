import Link from "next/link";
import { Search } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/history", label: "History" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-4 md:h-16 md:px-8">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-text hover:text-primary md:text-lg"
        >
          nontonfilm
        </Link>

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center gap-5 text-sm md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center md:ml-0">
          <Link
            href="/search"
            aria-label="Search"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-elevated hover:text-text"
          >
            <Search className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
