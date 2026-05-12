import Link from "next/link";
import { Search } from "lucide-react";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { NavLinks } from "@/components/layout/NavLinks";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-bg/60 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/40">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 md:h-16 md:gap-8 md:px-8">
        <Link
          href="/"
          aria-label="Bauni — home"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span
            aria-hidden
            className="relative flex h-2 w-2 items-center justify-center"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
            <span className="relative h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-display text-2xl uppercase leading-none tracking-[0.08em] text-text transition-colors group-hover:text-primary md:text-[28px]">
            Bauni
          </span>
        </Link>

        <NavLinks />

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <SearchAutocomplete />
          </div>
          <Link
            href="/search"
            aria-label="Search"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-elevated hover:text-text md:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
