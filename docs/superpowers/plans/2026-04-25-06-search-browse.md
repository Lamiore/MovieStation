# Plan 6: Search + Browse

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Two new ways to find content beyond the homepage rows. **Search** — debounced autocomplete in the header dropdown + full results at `/search?q=...`. **Browse** — `/browse` page with genre chips + year + sort + type filters, all driven by URL query params so links are shareable and the back button works.

**Architecture:** Page-level fetches (search results, discover results) are Server Components for fast first render. The autocomplete is a Client Component talking to a Route Handler (so the TMDB token stays on the server). Filters mutate URL state via `router.replace` — no client React state for filters.

**Tech Stack:** Same. No new deps.

**Deferred:** Person/cast search results (no person detail pages in scope). "More results" pagination — for v1 we show TMDB's first page (20 results); pagination later if needed.

---

## File structure (this plan adds)

```
src/lib/tmdb/
  movies.ts                   # extended — discoverMovies
  tv.ts                       # extended — discoverTv
  search.ts                   # NEW — multiSearch (movie + tv only)
  genres.ts                   # NEW — getMovieGenres, getTvGenres
  __tests__/
    search.test.ts
    genres.test.ts
src/hooks/
  useDebounce.ts              # NEW — generic debounce
src/app/api/tmdb/
  search/route.ts             # NEW — Route Handler proxy
  discover/route.ts           # NEW — Route Handler proxy
src/components/search/
  SearchAutocomplete.tsx      # NEW — Client Component
src/components/layout/
  SiteHeader.tsx              # MODIFIED — use SearchAutocomplete
src/components/browse/
  FilterBar.tsx               # NEW — Client Component, URL-driven
src/app/search/page.tsx       # NEW
src/app/browse/page.tsx       # NEW
```

---

### Task 1: search.ts — multiSearch (TDD)

**Files:**
- Create: `src/lib/tmdb/__tests__/search.test.ts`
- Create: `src/lib/tmdb/search.ts`

`multiSearch` calls `/search/multi`. TMDB returns mixed results with `media_type` per item ("movie" | "tv" | "person"). We accept this and let consumers filter by `media_type`.

- [ ] **Step 1: Write failing test**

Write to `src/lib/tmdb/__tests__/search.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("multiSearch", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.TMDB_READ_TOKEN;

  beforeEach(() => {
    process.env.TMDB_READ_TOKEN = "test-token";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TMDB_READ_TOKEN = originalEnv;
    vi.resetModules();
  });

  it("calls /search/multi with the query", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { multiSearch } = await import("@/lib/tmdb/search");
    await multiSearch("inception");

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/3/search/multi");
    expect(url.searchParams.get("query")).toBe("inception");
  });

  it("returns parsed results", async () => {
    const payload = {
      page: 1,
      results: [
        { id: 27205, media_type: "movie", title: "Inception", release_date: "2010" },
        { id: 1399, media_type: "tv", name: "GoT", first_air_date: "2011" },
      ],
      total_pages: 1,
      total_results: 2,
    };
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })) as unknown as typeof fetch;

    const { multiSearch } = await import("@/lib/tmdb/search");
    const result = await multiSearch("anything");
    expect(result.results).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/tmdb/__tests__/search.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/lib/tmdb/search.ts`:

```ts
import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbLocale,
  TmdbMovie,
  TmdbPaginatedResponse,
  TmdbTvShow,
} from "./types";

export type TmdbMultiResult =
  | (TmdbMovie & { media_type: "movie" })
  | (TmdbTvShow & { media_type: "tv" })
  | { id: number; media_type: "person"; name: string; profile_path: string | null };

export interface SearchOptions {
  locale?: TmdbLocale;
}

export function multiSearch(
  query: string,
  options: SearchOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMultiResult>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMultiResult>>("/search/multi", {
    locale: options.locale,
    searchParams: { query },
  });
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 74 tests pass (72 + 2).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): multiSearch endpoint"
```

---

### Task 2: genres.ts — getMovieGenres + getTvGenres (TDD)

**Files:**
- Create: `src/lib/tmdb/__tests__/genres.test.ts`
- Create: `src/lib/tmdb/genres.ts`

- [ ] **Step 1: Write failing test**

Write to `src/lib/tmdb/__tests__/genres.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("genre endpoints", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.TMDB_READ_TOKEN;

  beforeEach(() => {
    process.env.TMDB_READ_TOKEN = "test-token";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TMDB_READ_TOKEN = originalEnv;
    vi.resetModules();
  });

  const okGenres = () =>
    new Response(JSON.stringify({ genres: [{ id: 28, name: "Action" }] }), { status: 200 });

  it("getMovieGenres calls /genre/movie/list", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okGenres());
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieGenres } = await import("@/lib/tmdb/genres");
    const result = await getMovieGenres();

    expect(fetchMock.mock.calls[0][0]).toContain("/genre/movie/list");
    expect(result.genres[0].name).toBe("Action");
  });

  it("getTvGenres calls /genre/tv/list", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okGenres());
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTvGenres } = await import("@/lib/tmdb/genres");
    await getTvGenres();

    expect(fetchMock.mock.calls[0][0]).toContain("/genre/tv/list");
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/tmdb/__tests__/genres.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/lib/tmdb/genres.ts`:

```ts
import "server-only";
import { tmdbFetch } from "./client";
import type { TmdbGenre, TmdbLocale } from "./types";

export interface GenresResponse {
  genres: TmdbGenre[];
}

export interface GenresOptions {
  locale?: TmdbLocale;
}

export function getMovieGenres(
  options: GenresOptions = {},
): Promise<GenresResponse> {
  return tmdbFetch<GenresResponse>("/genre/movie/list", {
    locale: options.locale,
    revalidate: 60 * 60 * 24, // 1 day — genres rarely change
  });
}

export function getTvGenres(
  options: GenresOptions = {},
): Promise<GenresResponse> {
  return tmdbFetch<GenresResponse>("/genre/tv/list", {
    locale: options.locale,
    revalidate: 60 * 60 * 24,
  });
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 76 tests pass.

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): movie + tv genre endpoints (24h cache)"
```

---

### Task 3: Discover endpoints (TDD)

**Files:**
- Modify: `src/lib/tmdb/movies.ts`
- Modify: `src/lib/tmdb/tv.ts`
- Modify: `src/lib/tmdb/__tests__/movies.test.ts` (add discover test)
- Modify: `src/lib/tmdb/__tests__/tv.test.ts` (add discover test)

`discover` accepts: `with_genres` (comma-separated ids), `primary_release_year` (movie), `first_air_date_year` (tv), `vote_average.gte`, `sort_by`.

- [ ] **Step 1: Append failing tests**

Append to `src/lib/tmdb/__tests__/movies.test.ts`:

```ts
describe("discoverMovies", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.TMDB_READ_TOKEN;

  beforeEach(() => {
    process.env.TMDB_READ_TOKEN = "test-token";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TMDB_READ_TOKEN = originalEnv;
    vi.resetModules();
  });

  it("calls /discover/movie and forwards filter params", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { discoverMovies } = await import("@/lib/tmdb/movies");
    await discoverMovies({
      genres: [28, 12],
      year: 2024,
      minRating: 7,
      sortBy: "vote_average.desc",
    });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/3/discover/movie");
    expect(url.searchParams.get("with_genres")).toBe("28,12");
    expect(url.searchParams.get("primary_release_year")).toBe("2024");
    expect(url.searchParams.get("vote_average.gte")).toBe("7");
    expect(url.searchParams.get("sort_by")).toBe("vote_average.desc");
  });
});
```

Append to `src/lib/tmdb/__tests__/tv.test.ts`:

```ts
describe("discoverTv", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.TMDB_READ_TOKEN;

  beforeEach(() => {
    process.env.TMDB_READ_TOKEN = "test-token";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TMDB_READ_TOKEN = originalEnv;
    vi.resetModules();
  });

  it("calls /discover/tv with first_air_date_year", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { discoverTv } = await import("@/lib/tmdb/tv");
    await discoverTv({ year: 2023, sortBy: "popularity.desc" });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/3/discover/tv");
    expect(url.searchParams.get("first_air_date_year")).toBe("2023");
    expect(url.searchParams.get("sort_by")).toBe("popularity.desc");
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test
```

Expected: 2 new tests fail, all others pass.

- [ ] **Step 3: Implement movie discover**

Append to `src/lib/tmdb/movies.ts`:

```ts
export interface DiscoverMoviesOptions {
  locale?: TmdbLocale;
  genres?: number[];
  year?: number;
  minRating?: number;
  sortBy?: string; // "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" | ...
  page?: number;
}

export function discoverMovies(
  options: DiscoverMoviesOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/discover/movie", {
    locale: options.locale,
    searchParams: {
      with_genres: options.genres?.length ? options.genres.join(",") : undefined,
      primary_release_year: options.year,
      "vote_average.gte": options.minRating,
      sort_by: options.sortBy,
      page: options.page,
    },
  });
}
```

- [ ] **Step 4: Implement tv discover**

Append to `src/lib/tmdb/tv.ts`:

```ts
export interface DiscoverTvOptions {
  locale?: TmdbLocale;
  genres?: number[];
  year?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
}

export function discoverTv(
  options: DiscoverTvOptions = {},
): Promise<TmdbPaginatedResponse<TmdbTvShow>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>("/discover/tv", {
    locale: options.locale,
    searchParams: {
      with_genres: options.genres?.length ? options.genres.join(",") : undefined,
      first_air_date_year: options.year,
      "vote_average.gte": options.minRating,
      sort_by: options.sortBy,
      page: options.page,
    },
  });
}
```

- [ ] **Step 5: Run, confirm pass**

```bash
npm run test
```

Expected: 78 tests pass.

- [ ] **Step 6: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): discoverMovies and discoverTv with filter options"
```

---

### Task 4: useDebounce hook

**Files:**
- Create: `src/hooks/useDebounce.ts`

- [ ] **Step 1: Implement**

Write to `src/hooks/useDebounce.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
```

No tests — trivial generic hook. Behavior is verified by SearchAutocomplete tests later.

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/hooks/useDebounce.ts
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(hooks): useDebounce"
```

---

### Task 5: Search Route Handler

**Files:**
- Create: `src/app/api/tmdb/search/route.ts`

- [ ] **Step 1: Implement**

Write to `src/app/api/tmdb/search/route.ts`:

```ts
import { NextResponse } from "next/server";
import { multiSearch } from "@/lib/tmdb/search";
import type { TmdbLocale } from "@/lib/tmdb/types";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const locale = (searchParams.get("locale") ?? "id-ID") as TmdbLocale;

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await multiSearch(query, { locale });
    const filtered = data.results.filter(
      (r) => r.media_type === "movie" || r.media_type === "tv",
    );
    return NextResponse.json({ results: filtered });
  } catch (err) {
    const message = err instanceof Error ? err.message : "search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/api/tmdb/search
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(api): /api/tmdb/search Route Handler"
```

---

### Task 6: SearchAutocomplete component (TDD)

**Files:**
- Create: `src/components/search/__tests__/SearchAutocomplete.test.tsx`
- Create: `src/components/search/SearchAutocomplete.tsx`

**Design:** input + dropdown panel. As user types, debounce 300ms, fetch `/api/tmdb/search?q=...`. Dropdown shows up to 8 results with poster thumb + title + year + media-type badge. Click a result → navigate to its detail page. Press Enter or click "Lihat semua hasil" → navigate to `/search?q=<query>`.

- [ ] **Step 1: Write failing test**

Write to `src/components/search/__tests__/SearchAutocomplete.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";

const sampleResponse = {
  results: [
    {
      id: 27205,
      media_type: "movie" as const,
      title: "Inception",
      release_date: "2010-07-16",
      poster_path: "/p.jpg",
    },
    {
      id: 1399,
      media_type: "tv" as const,
      name: "Game of Thrones",
      first_air_date: "2011-04-17",
      poster_path: "/got.jpg",
    },
  ],
};

describe("SearchAutocomplete", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(sampleResponse), { status: 200 })) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders an input", () => {
    render(<SearchAutocomplete />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("fetches and shows results after typing (debounced)", async () => {
    const user = userEvent.setup();
    render(<SearchAutocomplete />);

    await user.type(screen.getByRole("searchbox"), "inception");

    await waitFor(
      () => {
        expect(screen.getByText("Inception")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(screen.getByText("Game of Thrones")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalled();
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/tmdb/search");
    expect(calledUrl).toContain("q=inception");
  });

  it("does not fetch for empty query", async () => {
    render(<SearchAutocomplete />);
    // wait a tick longer than debounce
    await new Promise((r) => setTimeout(r, 500));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/search/__tests__/SearchAutocomplete.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/components/search/SearchAutocomplete.tsx`:

```tsx
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
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 81 tests pass (78 + 3).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/search src/hooks
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(search): SearchAutocomplete with debounced fetch"
```

---

### Task 7: Update SiteHeader to use SearchAutocomplete

**Files:**
- Modify: `src/components/layout/SiteHeader.tsx`
- Modify: `src/components/layout/__tests__/SiteHeader.test.tsx`

The header currently has a search-icon `<Link>`. Replace it with the autocomplete on desktop, keep the icon link as a fallback on mobile (where space is tight).

- [ ] **Step 1: Update test**

Replace `src/components/layout/__tests__/SiteHeader.test.tsx` with:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/SiteHeader";

describe("SiteHeader", () => {
  it("renders logo link to home and the four nav links", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: /nontonfilm/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /browse/i })).toHaveAttribute(
      "href",
      "/browse",
    );
    expect(screen.getByRole("link", { name: /watchlist/i })).toHaveAttribute(
      "href",
      "/watchlist",
    );
    expect(screen.getByRole("link", { name: /history/i })).toHaveAttribute(
      "href",
      "/history",
    );
  });

  it("renders a search input (autocomplete) and a mobile search link", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute(
      "href",
      "/search",
    );
  });
});
```

- [ ] **Step 2: Update implementation**

Replace `src/components/layout/SiteHeader.tsx` with:

```tsx
import Link from "next/link";
import { Search } from "lucide-react";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/history", label: "History" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 md:h-16 md:gap-6 md:px-8">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-text hover:text-primary md:text-lg"
        >
          nontonfilm
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 text-sm md:flex"
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
```

- [ ] **Step 3: Run, confirm pass**

```bash
npm run test
```

Expected: 81 tests pass (one more SiteHeader assertion replaces the old "search link only" check, net same count).

- [ ] **Step 4: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/layout
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(layout): SiteHeader uses SearchAutocomplete on desktop"
```

---

### Task 8: Search results page

**Files:**
- Create: `src/app/search/page.tsx`

Server Component. Reads `q` from `searchParams`, calls `multiSearch`, renders grid of `<MediaCard>` filtered to movie/tv. Empty state for empty query or zero results.

- [ ] **Step 1: Implement**

Write to `src/app/search/page.tsx`:

```tsx
import Link from "next/link";
import { multiSearch, type TmdbMultiResult } from "@/lib/tmdb/search";
import { MediaCard } from "@/components/media/MediaCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let items: TmdbMultiResult[] = [];
  if (query.length >= 2) {
    try {
      const data = await multiSearch(query);
      items = data.results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv",
      );
    } catch {
      items = [];
    }
  }

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Pencarian
        </h1>
        {query ? (
          <p className="text-sm text-muted-foreground">
            {items.length} hasil untuk{" "}
            <span className="font-medium text-text">&ldquo;{query}&rdquo;</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ketik judul film atau serial di kolom pencarian di header.
          </p>
        )}
      </header>

      {query.length >= 2 && items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Tidak ada hasil untuk &ldquo;{query}&rdquo;.
          </p>
          <Link
            href="/browse"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Coba Browse
          </Link>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((r) => {
            const isMovie = r.media_type === "movie";
            const title = isMovie ? r.title : r.name;
            const releaseDate = isMovie
              ? r.release_date
              : r.first_air_date ?? "";
            return (
              <div key={`${r.media_type}:${r.id}`} className="w-full">
                <MediaCard
                  id={r.id}
                  type={r.media_type}
                  title={title}
                  posterPath={r.poster_path}
                  releaseDate={releaseDate}
                  voteAverage={r.vote_average}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/search
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: search results page"
```

---

### Task 9: FilterBar component

**Files:**
- Create: `src/components/browse/FilterBar.tsx`

**Design:** Client Component. Reads URL state via `useSearchParams`, writes via `router.replace`. Sub-controls:
- **Type:** segmented "Film" | "Serial" (selected by `type=movie|tv`, default movie)
- **Genre chips:** multi-select (toggle adds/removes the id from `with_genres`)
- **Year:** number input (single year)
- **Min rating:** select 0/5/6/7/8
- **Sort:** select (popularity desc, vote desc, release date desc)

The component takes `genres` as a prop (server fetched once).

- [ ] **Step 1: Implement**

Write to `src/components/browse/FilterBar.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { TmdbGenre } from "@/lib/tmdb/types";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Paling Populer" },
  { value: "vote_average.desc", label: "Rating Tertinggi" },
  { value: "primary_release_date.desc", label: "Terbaru" },
];

const RATING_OPTIONS = [
  { value: "", label: "Semua rating" },
  { value: "5", label: "≥ 5" },
  { value: "6", label: "≥ 6" },
  { value: "7", label: "≥ 7" },
  { value: "8", label: "≥ 8" },
];

export interface FilterBarProps {
  genres: TmdbGenre[];
}

export function FilterBar({ genres }: FilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type") === "tv" ? "tv" : "movie";
  const selectedGenres = (params.get("genres") ?? "")
    .split(",")
    .filter(Boolean)
    .map(Number);
  const year = params.get("year") ?? "";
  const minRating = params.get("minRating") ?? "";
  const sortBy = params.get("sortBy") ?? "popularity.desc";

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(changes)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      router.replace(`/browse?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const toggleGenre = (id: number) => {
    const next = selectedGenres.includes(id)
      ? selectedGenres.filter((g) => g !== id)
      : [...selectedGenres, id];
    update({ genres: next.length ? next.join(",") : null });
  };

  return (
    <div className="space-y-4 rounded-lg bg-surface/60 p-4 ring-1 ring-border">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-md ring-1 ring-border">
          {(["movie", "tv"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update({ type: t === "movie" ? null : t })}
              className={
                type === t
                  ? "bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "bg-elevated px-3 py-1.5 text-xs font-medium text-text hover:bg-elevated/80"
              }
            >
              {t === "movie" ? "Film" : "Serial"}
            </button>
          ))}
        </div>

        <input
          type="number"
          min={1900}
          max={2100}
          placeholder="Tahun"
          value={year}
          onChange={(e) => update({ year: e.target.value || null })}
          className="w-24 rounded-md bg-elevated px-3 py-1.5 text-xs text-text ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary"
        />

        <select
          value={minRating}
          onChange={(e) => update({ minRating: e.target.value || null })}
          className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text ring-1 ring-border focus:outline-none focus:ring-primary"
        >
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
          className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text ring-1 ring-border focus:outline-none focus:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map((g) => {
          const active = selectedGenres.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGenre(g.id)}
              className={
                active
                  ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                  : "rounded-full bg-elevated px-3 py-1 text-xs font-medium text-text ring-1 ring-border hover:bg-elevated/80"
              }
            >
              {g.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/browse
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(browse): FilterBar driven by URL search params"
```

---

### Task 10: Browse page

**Files:**
- Create: `src/app/browse/page.tsx`

- [ ] **Step 1: Implement**

Write to `src/app/browse/page.tsx`:

```tsx
import { discoverMovies } from "@/lib/tmdb/movies";
import { discoverTv } from "@/lib/tmdb/tv";
import { getMovieGenres, getTvGenres } from "@/lib/tmdb/genres";
import { MediaCard } from "@/components/media/MediaCard";
import { FilterBar } from "@/components/browse/FilterBar";

export const dynamic = "force-dynamic";

interface BrowseSearchParams {
  type?: string;
  genres?: string;
  year?: string;
  minRating?: string;
  sortBy?: string;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) {
  const sp = await searchParams;
  const isTv = sp.type === "tv";

  const genreList = isTv ? await getTvGenres() : await getMovieGenres();

  const filters = {
    genres: sp.genres
      ?.split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n)),
    year: sp.year ? Number(sp.year) : undefined,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    sortBy: sp.sortBy || "popularity.desc",
  };

  const data = isTv
    ? await discoverTv(filters)
    : await discoverMovies(filters);

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Browse
        </h1>
        <p className="text-sm text-muted-foreground">
          Filter berdasarkan tipe, genre, tahun, rating, dan urutan.
        </p>
      </header>

      <FilterBar genres={genreList.genres} />

      {data.results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Tidak ada hasil untuk filter ini. Coba longgarkan filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.results.map((item) => (
            <div key={`${isTv ? "tv" : "movie"}:${item.id}`} className="w-full">
              <MediaCard
                id={item.id}
                type={isTv ? "tv" : "movie"}
                title={isTv ? (item as { name: string }).name : (item as { title: string }).title}
                posterPath={item.poster_path}
                releaseDate={
                  isTv
                    ? (item as { first_air_date?: string }).first_air_date ?? ""
                    : (item as { release_date?: string }).release_date ?? ""
                }
                voteAverage={item.vote_average}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/browse
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: browse page with FilterBar"
```

---

### Task 11: Manual smoke test

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Search flow**

- Click in the header search box → start typing "interstellar" → after ~300ms, dropdown shows results
- Click a result → navigates to its detail page
- Type something + press Enter → navigates to `/search?q=...` with full results grid
- Visit `/search?q=batman` directly — same grid

- [ ] **Step 3: Browse flow**

- Visit `/browse` → grid of popular movies + filter bar
- Toggle "Serial" → URL becomes `/browse?type=tv` → grid changes to TV
- Click a genre chip → URL gains `genres=<id>` → grid filtered
- Click another genre → multiple genres
- Type a year (e.g. 2024) → URL gains `year=2024` → grid filtered
- Change sort → grid reorders
- Browser back/forward should preserve filter state

- [ ] **Step 4: Edge cases**

- `/search` with no q → "Ketik judul…" prompt
- `/search?q=qwerasdfzxcv` → "Tidak ada hasil"
- `/browse?genres=99999` (invalid genre) → empty grid + "longgarkan filter"

Stop dev server.

---

## Plan 6 done when:

- ~81 tests pass
- `npm run build` succeeds; routes include `/search`, `/browse`, `/api/tmdb/search`
- All manual smoke flows pass
- ~10 new commits in `git log`

**Result of Plan 6:** MVP complete. Next steps post-MVP: deployment to Vercel, i18n with `next-intl` (language toggle), watchlist for cast/people, fallback streaming providers, infinite-scroll pagination on `/browse`.
