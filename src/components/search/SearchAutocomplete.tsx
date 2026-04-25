"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const POSTER_BASE = "https://image.tmdb.org/t/p/w92";

interface AutocompleteResult {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
}

export function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    fetch(`/api/tmdb/search?q=${encodeURIComponent(trimmed)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setResults((data.results ?? []).slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setOpen(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          role="searchbox"
          type="search"
          placeholder="Cari film atau serial…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="w-full rounded-md bg-elevated py-1.5 pl-8 pr-3 text-sm text-text ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary"
        />
      </div>

      {open && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-bg shadow-lg">
          <ul>
            {results.map((r) => {
              const title = r.title ?? r.name ?? "";
              const year = (r.release_date ?? r.first_air_date ?? "").slice(0, 4);
              const href = `/${r.media_type}/${r.id}`;
              return (
                <li key={`${r.media_type}:${r.id}`}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-elevated"
                  >
                    <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-surface">
                      {r.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={POSTER_BASE + r.poster_path}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">
                        {title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.media_type === "movie" ? "Film" : "Serial"}
                        {year ? ` • ${year}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border bg-surface/40">
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-center text-xs font-medium text-primary hover:bg-elevated"
            >
              Lihat semua hasil
            </Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
