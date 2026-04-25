# Plan 2: Header + Footer + Full Homepage

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship a complete-looking homepage: site header + footer, a hero banner from the #1 trending title, and all six category rows (Trending, Popular Movies, Popular TV, Top Rated Movies, Upcoming, Now Playing). After this plan, the homepage feels like a real streaming app even though detail pages still 404.

**Architecture:** Continues Plan 1's "server-first" approach — Server Components fetch from TMDB at request time, Suspense streams each row independently so a slow endpoint doesn't block the rest.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, Vitest, RTL, TMDB API. Same as Plan 1.

**Deferred:** Search bar wiring (a non-functional search icon link is fine for now — actual search lives in Plan 5/6). Watchlist button on hero (placeholder — real localStorage flow lives in Plan 4). Detail pages — Plan 3. i18n + language toggle — later plan.

**Decomposition note:** Plan 1 + 2 originally bundled into "Full Homepage + Detail Pages." Detail pages are pulled out into Plan 3 because they're a sizeable subsystem (cast list, trailer modal, similar movies, TV season/episode picker).

---

## Plan 1 recap (existing state)

You can rely on these being in place already:

- `src/lib/tmdb/client.ts` — `tmdbFetch<T>(path, options)` server-only wrapper, bearer-auth, locale, `include_adult=false`, 1-hour revalidate
- `src/lib/tmdb/types.ts` — `TmdbLocale`, `TmdbMovie`, `TmdbPaginatedResponse`, `TmdbErrorResponse`
- `src/lib/tmdb/movies.ts` — `getTrendingMovies({ locale? })`
- `src/components/media/MediaCard.tsx`, `MediaCardSkeleton.tsx`, `MediaRow.tsx`
- `src/app/page.tsx` — homepage with `force-dynamic`, hero-less header + Suspense-wrapped trending row
- `src/app/layout.tsx` — root layout with `<html lang="id" class="dark ...">`, Geist fonts, Inter-style metadata
- Vitest + RTL configured, `server-only` aliased to a stub
- Token convention: `bg-bg`/`bg-surface`/`bg-elevated`/`text-text` are ours (`@theme`), and `text-muted-foreground`/`text-primary`/`border-border`/`bg-card` come from shadcn (mapped to project palette in `.dark`)

---

## File structure (this plan adds)

```
src/lib/tmdb/
  movies.ts                   # extended — add 4 more list functions
  tv.ts                       # NEW — getPopularTv, getTopRatedTv, types
  types.ts                    # extended — TmdbTvShow type
src/components/
  layout/
    SiteHeader.tsx            # NEW
    SiteFooter.tsx            # NEW
  media/
    HeroBanner.tsx            # NEW
src/app/
  layout.tsx                  # modified — wrap children with header/footer
  page.tsx                    # modified — hero + 6 rows
src/components/layout/__tests__/
  SiteHeader.test.tsx
  SiteFooter.test.tsx
src/components/media/__tests__/
  HeroBanner.test.tsx
src/lib/tmdb/__tests__/
  movies.test.ts              # extended
  tv.test.ts                  # NEW
```

---

### Task 1: Extend TMDB types for TV shows

**Files:**
- Modify: `src/lib/tmdb/types.ts`

- [ ] **Step 1: Append `TmdbTvShow` and `TmdbMediaType`**

Add to the bottom of `src/lib/tmdb/types.ts`:

```ts
export interface TmdbTvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string; // "YYYY-MM-DD"
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  origin_country: string[];
  vote_count: number;
}

export type TmdbMediaType = "movie" | "tv";
```

- [ ] **Step 2: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb/types.ts
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): add TmdbTvShow and TmdbMediaType types"
```

---

### Task 2: Extend `movies.ts` with 4 more list functions (TDD)

**Files:**
- Modify: `src/lib/tmdb/__tests__/movies.test.ts` (add tests)
- Modify: `src/lib/tmdb/movies.ts` (add functions)

We'll add `getPopularMovies`, `getTopRatedMovies`, `getUpcomingMovies`, `getNowPlayingMovies`. They all share the same shape — paginated `TmdbMovie` response, optional `locale`. Each calls a different TMDB endpoint.

- [ ] **Step 1: Write failing tests**

Append to `src/lib/tmdb/__tests__/movies.test.ts` (inside the existing file, after the `getTrendingMovies` block):

```ts
describe("movie list endpoints", () => {
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

  const makeOk = () =>
    new Response(
      JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      { status: 200 },
    );

  it.each([
    ["getPopularMovies", "/movie/popular"],
    ["getTopRatedMovies", "/movie/top_rated"],
    ["getUpcomingMovies", "/movie/upcoming"],
    ["getNowPlayingMovies", "/movie/now_playing"],
  ] as const)("%s calls %s", async (fnName, expectedPath) => {
    const fetchMock = vi.fn().mockResolvedValue(makeOk());
    global.fetch = fetchMock as unknown as typeof fetch;

    const mod = await import("@/lib/tmdb/movies");
    const fn = (mod as Record<string, unknown>)[fnName] as () => Promise<unknown>;
    expect(fn).toBeDefined();
    await fn();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(expectedPath);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/tmdb/__tests__/movies.test.ts
```

Expected: 4 of the new tests fail (functions undefined). Existing tests still pass.

- [ ] **Step 3: Implement the four functions**

Append to `src/lib/tmdb/movies.ts`:

```ts
export function getPopularMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/movie/popular", {
    locale: options.locale,
  });
}

export function getTopRatedMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/movie/top_rated", {
    locale: options.locale,
  });
}

export function getUpcomingMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/movie/upcoming", {
    locale: options.locale,
  });
}

export function getNowPlayingMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/movie/now_playing", {
    locale: options.locale,
  });
}
```

(Reuses the existing `GetTrendingOptions` interface from the same file — same shape `{ locale? }`. No need to introduce a new options type.)

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: all tests pass (now 14: 1 cn + 3 client + 6 movies + 3 MediaCard + 1 MediaRow). Confirm 4 new movie tests pass.

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): popular/top-rated/upcoming/now-playing movie endpoints"
```

---

### Task 3: TV endpoints (TDD)

**Files:**
- Create: `src/lib/tmdb/tv.ts`
- Create: `src/lib/tmdb/__tests__/tv.test.ts`

- [ ] **Step 1: Write failing tests**

Write to `src/lib/tmdb/__tests__/tv.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("tv endpoints", () => {
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

  const okEmpty = () =>
    new Response(
      JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      { status: 200 },
    );

  it.each([
    ["getPopularTv", "/tv/popular"],
    ["getTopRatedTv", "/tv/top_rated"],
  ] as const)("%s calls %s", async (fnName, expectedPath) => {
    const fetchMock = vi.fn().mockResolvedValue(okEmpty());
    global.fetch = fetchMock as unknown as typeof fetch;

    const mod = await import("@/lib/tmdb/tv");
    const fn = (mod as Record<string, unknown>)[fnName] as () => Promise<unknown>;
    expect(fn).toBeDefined();
    await fn();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(expectedPath);
  });

  it("returns the parsed payload from getPopularTv", async () => {
    const payload = {
      page: 1,
      results: [
        {
          id: 1399,
          name: "Game of Thrones",
          original_name: "Game of Thrones",
          overview: "Seven noble families…",
          poster_path: "/got.jpg",
          backdrop_path: "/got-backdrop.jpg",
          first_air_date: "2011-04-17",
          vote_average: 8.4,
          genre_ids: [10765, 18],
          adult: false,
          original_language: "en",
          popularity: 200,
          origin_country: ["US"],
          vote_count: 20000,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })) as unknown as typeof fetch;

    const { getPopularTv } = await import("@/lib/tmdb/tv");
    const result = await getPopularTv();

    expect(result.results).toHaveLength(1);
    expect(result.results[0].name).toBe("Game of Thrones");
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/tmdb/__tests__/tv.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/tmdb/tv.ts`**

Write to `src/lib/tmdb/tv.ts`:

```ts
import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbLocale,
  TmdbPaginatedResponse,
  TmdbTvShow,
} from "./types";

export interface GetTvListOptions {
  locale?: TmdbLocale;
}

export function getPopularTv(
  options: GetTvListOptions = {},
): Promise<TmdbPaginatedResponse<TmdbTvShow>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>("/tv/popular", {
    locale: options.locale,
  });
}

export function getTopRatedTv(
  options: GetTvListOptions = {},
): Promise<TmdbPaginatedResponse<TmdbTvShow>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>("/tv/top_rated", {
    locale: options.locale,
  });
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: all 17 tests pass (14 from before + 3 new TV).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): popular and top-rated TV endpoints"
```

---

### Task 4: Update `MediaCard` to accept TV shape (no-op for movies)

**Background:** `MediaCard` already accepts a unified shape `{ id, type, title, posterPath, releaseDate, voteAverage }`. TV shows use `name` and `first_air_date` from TMDB instead of `title`/`release_date`. The fix is at the call site — pages mapping `TmdbTvShow` → `MediaCardProps` will translate the field names.

**No code change to `MediaCard.tsx` itself for this plan.** This task exists as documentation: future TV row mapping looks like:

```ts
results.map((tv) => (
  <MediaCard
    key={tv.id}
    id={tv.id}
    type="tv"
    title={tv.name}
    posterPath={tv.poster_path}
    releaseDate={tv.first_air_date}
    voteAverage={tv.vote_average}
  />
))
```

- [ ] **Step 1: No-op — proceed to next task**

No commit. This task simply documents the mapping convention for Tasks 7 and 8.

---

### Task 5: SiteHeader component (TDD)

**Files:**
- Create: `src/components/layout/__tests__/SiteHeader.test.tsx`
- Create: `src/components/layout/SiteHeader.tsx`

**Design:** sticky-top dark header. Logo on the left, nav links (Home / Browse / Watchlist / History) on the right (collapses on mobile to a hamburger — out of scope for v1, just hide on small screens). A search icon (`lucide-react`'s `Search`) linking to `/search` (page doesn't exist yet, will 404 — that's fine until Plan 5/6).

- [ ] **Step 1: Write failing test**

Write to `src/components/layout/__tests__/SiteHeader.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/SiteHeader";

describe("SiteHeader", () => {
  it("renders logo link to home and the four nav links", () => {
    render(<SiteHeader />);

    const logo = screen.getByRole("link", { name: /nontonfilm/i });
    expect(logo).toHaveAttribute("href", "/");

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
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

  it("renders a search link to /search", () => {
    render(<SiteHeader />);
    const searchLink = screen.getByRole("link", { name: /search/i });
    expect(searchLink).toHaveAttribute("href", "/search");
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/layout/__tests__/SiteHeader.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/layout/SiteHeader.tsx`**

Write to `src/components/layout/SiteHeader.tsx`:

```tsx
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
```

**Note:** `aria-label="Search"` makes the icon-only link accessible by name `/search/i`. The mobile-hidden nav (`hidden md:flex`) is fine for the test because RTL queries DOM regardless of CSS — `getByRole("link", { name: /home/i })` will still find it.

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: all 19 tests pass (17 + 2 SiteHeader).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/layout
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(layout): SiteHeader"
```

---

### Task 6: SiteFooter component (TDD)

**Files:**
- Create: `src/components/layout/__tests__/SiteFooter.test.tsx`
- Create: `src/components/layout/SiteFooter.tsx`

**TMDB attribution is required by their terms** — the footer must mention "powered by TMDB" with a link to themoviedb.org.

- [ ] **Step 1: Write failing test**

Write to `src/components/layout/__tests__/SiteFooter.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "@/components/layout/SiteFooter";

describe("SiteFooter", () => {
  it("renders TMDB attribution with a link to themoviedb.org", () => {
    render(<SiteFooter />);
    const link = screen.getByRole("link", { name: /tmdb|themoviedb/i });
    expect(link.getAttribute("href")).toMatch(/themoviedb\.org/);
  });

  it("renders a non-affiliation disclaimer", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText(/tidak berafiliasi|not affiliated/i),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/layout/__tests__/SiteFooter.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/components/layout/SiteFooter.tsx`**

Write to `src/components/layout/SiteFooter.tsx`:

```tsx
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 px-4 py-8 text-xs text-muted-foreground md:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-2">
        <p>
          Data film &amp; serial TV{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline hover:text-text"
          >
            powered by TMDB
          </a>
          .
        </p>
        <p>
          nontonfilm tidak berafiliasi dengan TMDB atau penyedia streaming
          mana pun. Konten ditampilkan dari sumber pihak ketiga.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: all 21 tests pass.

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/layout
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(layout): SiteFooter with TMDB attribution"
```

---

### Task 7: Wire header + footer into root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `src/app/layout.tsx`**

Write to `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nontonfilm",
  description: "Katalog film & serial TV — tonton langsung di browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-bg text-text min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify build + tests**

```bash
npm run build
npm run test
```

Both should pass.

- [ ] **Step 3: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/layout.tsx
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: wire SiteHeader and SiteFooter into root layout"
```

---

### Task 8: HeroBanner component (TDD)

**Files:**
- Create: `src/components/media/__tests__/HeroBanner.test.tsx`
- Create: `src/components/media/HeroBanner.tsx`

**Design:** full-width section ~70vh, blurred backdrop image, title overlaid in big bold text + overview clamped to 3 lines, two buttons: "Tonton" (primary, links to `/movie/<id>` for now since watch page is Plan 4) and "Tambah ke Watchlist" (ghost, links to `/movie/<id>` for now — real toggle in Plan 5). Backdrop image from TMDB at `https://image.tmdb.org/t/p/w1280<backdrop_path>`.

- [ ] **Step 1: Write failing test**

Write to `src/components/media/__tests__/HeroBanner.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroBanner } from "@/components/media/HeroBanner";

describe("HeroBanner", () => {
  it("renders title, overview, and a primary CTA linking to detail", () => {
    render(
      <HeroBanner
        id={27205}
        type="movie"
        title="Inception"
        overview="A thief who steals corporate secrets…"
        backdropPath="/inception-backdrop.jpg"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Inception" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a thief who steals corporate secrets/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tonton/i })).toHaveAttribute(
      "href",
      "/movie/27205",
    );
  });

  it("links to /tv/:id when type is tv", () => {
    render(
      <HeroBanner
        id={1399}
        type="tv"
        title="Game of Thrones"
        overview="Seven noble families…"
        backdropPath="/got-backdrop.jpg"
      />,
    );

    expect(screen.getByRole("link", { name: /tonton/i })).toHaveAttribute(
      "href",
      "/tv/1399",
    );
  });

  it("renders without crashing when backdropPath is null", () => {
    render(
      <HeroBanner
        id={1}
        type="movie"
        title="No Backdrop"
        overview=""
        backdropPath={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "No Backdrop" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/media/__tests__/HeroBanner.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/components/media/HeroBanner.tsx`**

Write to `src/components/media/HeroBanner.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

export interface HeroBannerProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  overview: string;
  backdropPath: string | null;
}

const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export function HeroBanner({
  id,
  type,
  title,
  overview,
  backdropPath,
}: HeroBannerProps) {
  const detailHref = `/${type}/${id}`;

  return (
    <section className="relative isolate h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[70vh]">
      {backdropPath ? (
        <Image
          src={BACKDROP_BASE + backdropPath}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/30 to-transparent"
      />

      <div className="relative z-10 flex h-full max-w-screen-2xl flex-col justify-end px-4 pb-8 md:px-8 md:pb-12">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            {title}
          </h2>
          {overview ? (
            <p className="line-clamp-3 text-sm text-text/80 md:text-base">
              {overview}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Tonton
            </Link>
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 rounded-md bg-elevated/80 px-5 py-2.5 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated"
            >
              Tambah ke Watchlist
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: all 24 tests pass.

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/media
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(ui): HeroBanner"
```

---

### Task 9: Update homepage with hero + 6 rows

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

Write to `src/app/page.tsx`:

```tsx
import { Suspense } from "react";
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
} from "@/lib/tmdb/movies";
import { getPopularTv } from "@/lib/tmdb/tv";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaCardSkeleton } from "@/components/media/MediaCardSkeleton";
import { HeroBanner } from "@/components/media/HeroBanner";
import type { TmdbMovie, TmdbPaginatedResponse, TmdbTvShow } from "@/lib/tmdb/types";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-dvh space-y-10 pb-12">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Trending Minggu Ini" />}>
        <MovieRow
          title="Trending Minggu Ini"
          fetcher={getTrendingMovies}
        />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Sedang Tayang" />}>
        <MovieRow title="Sedang Tayang" fetcher={getNowPlayingMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Populer" />}>
        <MovieRow title="Populer" fetcher={getPopularMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Akan Datang" />}>
        <MovieRow title="Akan Datang" fetcher={getUpcomingMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Rating Tertinggi" />}>
        <MovieRow title="Rating Tertinggi" fetcher={getTopRatedMovies} />
      </Suspense>

      <Suspense fallback={<MovieRowSkeleton title="Serial TV Populer" />}>
        <TvRow title="Serial TV Populer" fetcher={getPopularTv} />
      </Suspense>
    </main>
  );
}

async function Hero() {
  const { results } = await getTrendingMovies();
  const top = results[0];
  if (!top) return null;
  return (
    <HeroBanner
      id={top.id}
      type="movie"
      title={top.title}
      overview={top.overview}
      backdropPath={top.backdrop_path}
    />
  );
}

function HeroSkeleton() {
  return (
    <section className="relative h-[60vh] min-h-[420px] w-full animate-pulse bg-surface md:h-[70vh]" />
  );
}

async function MovieRow({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<TmdbPaginatedResponse<TmdbMovie>>;
}) {
  const { results } = await fetcher();
  return (
    <MediaRow title={title}>
      {results.slice(0, 20).map((m) => (
        <MediaCard
          key={m.id}
          id={m.id}
          type="movie"
          title={m.title}
          posterPath={m.poster_path}
          releaseDate={m.release_date}
          voteAverage={m.vote_average}
        />
      ))}
    </MediaRow>
  );
}

async function TvRow({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<TmdbPaginatedResponse<TmdbTvShow>>;
}) {
  const { results } = await fetcher();
  return (
    <MediaRow title={title}>
      {results.slice(0, 20).map((tv) => (
        <MediaCard
          key={tv.id}
          id={tv.id}
          type="tv"
          title={tv.name}
          posterPath={tv.poster_path}
          releaseDate={tv.first_air_date}
          voteAverage={tv.vote_average}
        />
      ))}
    </MediaRow>
  );
}

function MovieRowSkeleton({ title }: { title: string }) {
  return (
    <MediaRow title={title}>
      {Array.from({ length: 8 }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </MediaRow>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds. `/` should still be `ƒ` (Dynamic).

- [ ] **Step 3: Verify tests**

```bash
npm run test
```

Expected: all 24 tests still pass (homepage isn't unit-tested; we rely on component tests).

- [ ] **Step 4: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/page.tsx
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: full homepage with hero + 6 category rows"
```

---

### Task 10: Manual smoke test (user-driven)

**No code change.** This task gates the plan's completion on a real visual check.

- [ ] **Step 1: Confirm `.env.local` has a real TMDB token**

The file should contain `TMDB_READ_TOKEN=eyJ...` (a real JWT). If it still has `REPLACE_WITH_YOUR_TOKEN`, ask the user to paste their regenerated token before continuing.

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

Open `http://localhost:3000` (or whatever port Next prints).

- [ ] **Step 3: Verify**

Expected:
- Sticky dark header at the top with "nontonfilm" + nav links + search icon
- Hero banner taking ~70% of the viewport with a real backdrop, title overlay, two buttons
- Six rows below: Trending, Sedang Tayang, Populer, Akan Datang, Rating Tertinggi, Serial TV Populer
- Each row scrolls horizontally on touch / mouse drag
- TMDB attribution + disclaimer in the footer
- No console errors related to image domains, missing env, or TMDB 401

If TMDB returns 401: token is wrong/expired. Regenerate at themoviedb.org/settings/api.

If a row is empty: that endpoint may not have results in the user's locale (`id-ID`). Try the language toggle (not yet implemented — note as a Plan-X follow-up).

Stop the dev server with Ctrl+C.

---

## Plan 2 done when:

- All tests pass (~24)
- `npm run build` succeeds
- Manual smoke at `http://localhost:3000` shows full homepage end-to-end
- `git log` shows the 8 commits introduced in this plan (Tasks 1, 2, 3, 5, 6, 7, 8, 9 — Task 4 is documentation-only, Task 10 is verification-only)

**Next plan:** Plan 3 — Detail Pages (movie + TV with cast, trailer, similar; TV with season/episode picker).
