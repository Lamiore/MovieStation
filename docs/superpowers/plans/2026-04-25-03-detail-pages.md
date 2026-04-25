# Plan 3: Detail Pages (Movie + TV)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship `/movie/[id]` and `/tv/[id]` so clicking a poster goes somewhere real. Each detail page shows poster, title, year, rating, genres, overview, cast (top 6), trailer button, "Tonton" CTA (still 404s — Plan 4 owns the watch page), watchlist button (placeholder — Plan 5 owns persistence), and a "Mirip dengan ini" row. TV adds a season selector and episode list.

**Architecture:** Server Components for the page (fetch detail + credits + videos in parallel via `Promise.all`); a Client Component island for the trailer modal (needs onClick). Route uses `force-dynamic` for the same reason as the homepage.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui (`Dialog`), Vitest, RTL.

**Deferred:** Watchlist button real toggle behavior (Plan 5). Watch page navigation target (Plan 4 — for now `/watch/movie/<id>` is just a future link). Recommendations row (we render "Similar" only). Cast member detail pages.

---

## Plan 1+2 recap

These exist already:
- `src/lib/tmdb/client.ts` — `tmdbFetch<T>` server-only wrapper
- `src/lib/tmdb/types.ts` — `TmdbLocale`, `TmdbMovie`, `TmdbTvShow`, `TmdbPaginatedResponse`, `TmdbMediaType`
- `src/lib/tmdb/movies.ts` — 5 list functions
- `src/lib/tmdb/tv.ts` — 2 list functions
- `src/components/media/MediaCard.tsx`, `MediaRow.tsx`, `MediaCardSkeleton.tsx`, `HeroBanner.tsx`
- `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`
- `src/app/layout.tsx`, `src/app/page.tsx` (full homepage)
- `src/components/ui/button.tsx` (shadcn)

Token convention: `bg-bg`/`bg-surface`/`bg-elevated`/`text-text` are ours; `text-muted-foreground`/`text-primary`/`border-border`/`bg-card` are shadcn (mapped to project palette in `.dark`).

---

## File structure (this plan adds)

```
src/lib/tmdb/
  types.ts                     # extended — detail/credits/video/season types
  movies.ts                    # extended — getMovieDetail, getMovieCredits,
                               #            getMovieVideos, getMovieSimilar
  tv.ts                        # extended — getTvDetail, getTvCredits,
                               #            getSeasonDetail
src/components/
  detail/
    DetailHero.tsx             # NEW — backdrop + poster + meta (shared movie/tv)
    CastList.tsx               # NEW — horizontal cast row
    TrailerModal.tsx           # NEW — Client Component, shadcn Dialog
    WatchlistButton.tsx        # NEW — placeholder (no localStorage yet)
  tv/
    SeasonSelector.tsx         # NEW
    EpisodeList.tsx            # NEW
  ui/
    dialog.tsx                 # NEW — added via `shadcn add dialog`
src/app/
  movie/[id]/
    page.tsx                   # NEW
    loading.tsx                # NEW
    not-found.tsx              # NEW
  tv/[id]/
    page.tsx                   # NEW
    loading.tsx                # NEW
    not-found.tsx              # NEW
src/lib/tmdb/__tests__/
  movies.test.ts               # extended — 4 detail-endpoint tests
  tv.test.ts                   # extended — 3 detail-endpoint tests
src/components/detail/__tests__/
  CastList.test.tsx
  TrailerModal.test.tsx
  WatchlistButton.test.tsx
src/components/tv/__tests__/
  SeasonSelector.test.tsx
  EpisodeList.test.tsx
```

---

### Task 1: Extend TMDB types for detail/credits/video/season

**Files:**
- Modify: `src/lib/tmdb/types.ts`

- [ ] **Step 1: Append types**

Append to `src/lib/tmdb/types.ts`:

```ts
export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TmdbMovieDetail extends TmdbMovie {
  genres: TmdbGenre[];
  runtime: number | null;
  status: string;
  tagline: string;
  homepage: string | null;
  imdb_id: string | null;
  budget: number;
  revenue: number;
  production_companies: TmdbProductionCompany[];
}

export interface TmdbTvSeasonSummary {
  id: number;
  air_date: string | null;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TmdbTvDetail extends TmdbTvShow {
  genres: TmdbGenre[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  tagline: string;
  homepage: string | null;
  in_production: boolean;
  episode_run_time: number[];
  last_air_date: string | null;
  seasons: TmdbTvSeasonSummary[];
  production_companies: TmdbProductionCompany[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  cast_id?: number;
  credit_id: string;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
}

export interface TmdbCredits {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbVideo {
  id: string;
  key: string; // YouTube key when site === "YouTube"
  name: string;
  site: string; // "YouTube" | "Vimeo" | ...
  type: string; // "Trailer" | "Teaser" | ...
  official: boolean;
  published_at: string;
  iso_639_1: string;
  iso_3166_1: string;
  size: number;
}

export interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
}

export interface TmdbSeasonDetail extends TmdbTvSeasonSummary {
  episodes: TmdbEpisode[];
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb/types.ts
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): add detail/credits/video/season types"
```

---

### Task 2: Movie detail endpoints (TDD)

**Files:**
- Modify: `src/lib/tmdb/__tests__/movies.test.ts`
- Modify: `src/lib/tmdb/movies.ts`

We add `getMovieDetail`, `getMovieCredits`, `getMovieVideos`, `getMovieSimilar` — all take an `id` plus optional `locale`.

- [ ] **Step 1: Append failing tests**

Append to `src/lib/tmdb/__tests__/movies.test.ts`:

```ts
describe("movie detail endpoints", () => {
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

  it("getMovieDetail calls /movie/:id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 27205, title: "Inception", genres: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieDetail } = await import("@/lib/tmdb/movies");
    await getMovieDetail(27205);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/movie/27205");
    expect(url).not.toContain("/movie/27205/");
  });

  it("getMovieCredits calls /movie/:id/credits", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 27205, cast: [], crew: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieCredits } = await import("@/lib/tmdb/movies");
    await getMovieCredits(27205);

    expect(fetchMock.mock.calls[0][0]).toContain("/movie/27205/credits");
  });

  it("getMovieVideos calls /movie/:id/videos", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 27205, results: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieVideos } = await import("@/lib/tmdb/movies");
    await getMovieVideos(27205);

    expect(fetchMock.mock.calls[0][0]).toContain("/movie/27205/videos");
  });

  it("getMovieSimilar calls /movie/:id/similar", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getMovieSimilar } = await import("@/lib/tmdb/movies");
    await getMovieSimilar(27205);

    expect(fetchMock.mock.calls[0][0]).toContain("/movie/27205/similar");
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/tmdb/__tests__/movies.test.ts
```

Expected: 4 new tests fail.

- [ ] **Step 3: Implement**

Append to `src/lib/tmdb/movies.ts`:

```ts
import type {
  TmdbCredits,
  TmdbMovieDetail,
  TmdbVideosResponse,
} from "./types";

export interface DetailOptions {
  locale?: TmdbLocale;
}

export function getMovieDetail(
  id: number,
  options: DetailOptions = {},
): Promise<TmdbMovieDetail> {
  return tmdbFetch<TmdbMovieDetail>(`/movie/${id}`, {
    locale: options.locale,
  });
}

export function getMovieCredits(
  id: number,
  options: DetailOptions = {},
): Promise<TmdbCredits> {
  return tmdbFetch<TmdbCredits>(`/movie/${id}/credits`, {
    locale: options.locale,
  });
}

export function getMovieVideos(
  id: number,
  options: DetailOptions = {},
): Promise<TmdbVideosResponse> {
  return tmdbFetch<TmdbVideosResponse>(`/movie/${id}/videos`, {
    locale: options.locale,
  });
}

export function getMovieSimilar(
  id: number,
  options: DetailOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>(`/movie/${id}/similar`, {
    locale: options.locale,
  });
}
```

**Note:** Move the `import type` statement to the top of the file alongside the existing type imports — don't add a duplicate import block at the bottom. Combine with the existing `import type { ... } from "./types";` line.

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 28 tests pass (24 + 4 new movie detail).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): movie detail/credits/videos/similar endpoints"
```

---

### Task 3: TV detail endpoints (TDD)

**Files:**
- Modify: `src/lib/tmdb/__tests__/tv.test.ts`
- Modify: `src/lib/tmdb/tv.ts`

Add `getTvDetail`, `getTvCredits`, `getSeasonDetail`.

- [ ] **Step 1: Append failing tests**

Append to `src/lib/tmdb/__tests__/tv.test.ts`:

```ts
describe("tv detail endpoints", () => {
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

  it("getTvDetail calls /tv/:id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 1399, name: "GoT", genres: [], seasons: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTvDetail } = await import("@/lib/tmdb/tv");
    await getTvDetail(1399);

    expect(fetchMock.mock.calls[0][0]).toContain("/tv/1399");
  });

  it("getTvCredits calls /tv/:id/credits", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 1399, cast: [], crew: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTvCredits } = await import("@/lib/tmdb/tv");
    await getTvCredits(1399);

    expect(fetchMock.mock.calls[0][0]).toContain("/tv/1399/credits");
  });

  it("getSeasonDetail calls /tv/:tvId/season/:seasonNumber", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 1, season_number: 1, episodes: [] }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getSeasonDetail } = await import("@/lib/tmdb/tv");
    await getSeasonDetail(1399, 1);

    expect(fetchMock.mock.calls[0][0]).toContain("/tv/1399/season/1");
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/tmdb/__tests__/tv.test.ts
```

Expected: 3 new tests fail.

- [ ] **Step 3: Implement**

Append to `src/lib/tmdb/tv.ts`:

```ts
import type {
  TmdbCredits,
  TmdbSeasonDetail,
  TmdbTvDetail,
} from "./types";

export interface TvDetailOptions {
  locale?: TmdbLocale;
}

export function getTvDetail(
  id: number,
  options: TvDetailOptions = {},
): Promise<TmdbTvDetail> {
  return tmdbFetch<TmdbTvDetail>(`/tv/${id}`, { locale: options.locale });
}

export function getTvCredits(
  id: number,
  options: TvDetailOptions = {},
): Promise<TmdbCredits> {
  return tmdbFetch<TmdbCredits>(`/tv/${id}/credits`, { locale: options.locale });
}

export function getSeasonDetail(
  tvId: number,
  seasonNumber: number,
  options: TvDetailOptions = {},
): Promise<TmdbSeasonDetail> {
  return tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, {
    locale: options.locale,
  });
}
```

**Note:** combine the new `import type` statement with the existing one at the top.

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 31 tests pass (28 + 3 new TV detail).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/tmdb
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tmdb): tv detail/credits/season endpoints"
```

---

### Task 4: Install shadcn Dialog component

**Files:**
- Adds: `src/components/ui/dialog.tsx` (auto-generated)

- [ ] **Step 1: Add dialog**

```bash
npx --yes shadcn@latest add dialog
```

Expected: `src/components/ui/dialog.tsx` created. Possibly some new deps installed (`@base-ui/react` already there, dialog primitive may add nothing).

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add -A
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "chore: add shadcn Dialog component"
```

---

### Task 5: CastList component (TDD)

**Files:**
- Create: `src/components/detail/__tests__/CastList.test.tsx`
- Create: `src/components/detail/CastList.tsx`

**Design:** horizontal scroll list of cast members. Each entry: profile photo (or placeholder initial), actor name, character name. Limit shown to 12 (page-level callers will slice further if needed).

- [ ] **Step 1: Write failing test**

Write to `src/components/detail/__tests__/CastList.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CastList } from "@/components/detail/CastList";

const SAMPLE = [
  {
    id: 1,
    name: "Leonardo DiCaprio",
    character: "Cobb",
    profile_path: "/leo.jpg",
    order: 0,
    credit_id: "c1",
  },
  {
    id: 2,
    name: "Ellen Page",
    character: "Ariadne",
    profile_path: null,
    order: 1,
    credit_id: "c2",
  },
];

describe("CastList", () => {
  it("renders each cast member's name and character", () => {
    render(<CastList cast={SAMPLE} />);
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    expect(screen.getByText("Cobb")).toBeInTheDocument();
    expect(screen.getByText("Ellen Page")).toBeInTheDocument();
    expect(screen.getByText("Ariadne")).toBeInTheDocument();
  });

  it("renders nothing visible when cast array is empty", () => {
    const { container } = render(<CastList cast={[]} />);
    expect(container.textContent).toBe("");
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/detail/__tests__/CastList.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/components/detail/CastList.tsx`:

```tsx
import Image from "next/image";
import type { TmdbCastMember } from "@/lib/tmdb/types";

const PROFILE_BASE = "https://image.tmdb.org/t/p/w185";

export interface CastListProps {
  cast: TmdbCastMember[];
  limit?: number;
}

export function CastList({ cast, limit = 12 }: CastListProps) {
  if (cast.length === 0) return null;
  const shown = cast.slice(0, limit);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {shown.map((person) => (
        <div
          key={person.credit_id}
          className="w-[112px] shrink-0"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border">
            {person.profile_path ? (
              <Image
                src={PROFILE_BASE + person.profile_path}
                alt={person.name}
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                {person.name.charAt(0)}
              </div>
            )}
          </div>
          <p className="mt-2 truncate text-xs font-medium text-text">
            {person.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {person.character}
          </p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 33 tests pass (31 + 2 CastList).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/detail
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(detail): CastList"
```

---

### Task 6: TrailerModal component (TDD)

**Files:**
- Create: `src/components/detail/__tests__/TrailerModal.test.tsx`
- Create: `src/components/detail/TrailerModal.tsx`

**Design:** Client Component. Button "Putar Trailer" opens shadcn `<Dialog>` with a YouTube iframe at `https://www.youtube.com/embed/<key>?autoplay=1`. If `videos` is empty or no YouTube trailer, the button is disabled and labeled "Trailer tidak tersedia".

The component picks the first video where `site === "YouTube"` and `type === "Trailer"`, falling back to `type === "Teaser"` if no Trailer.

- [ ] **Step 1: Write failing test**

Write to `src/components/detail/__tests__/TrailerModal.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrailerModal } from "@/components/detail/TrailerModal";
import type { TmdbVideo } from "@/lib/tmdb/types";

const buildVideo = (overrides: Partial<TmdbVideo> = {}): TmdbVideo => ({
  id: "v1",
  key: "YOUTUBE_KEY",
  name: "Official Trailer",
  site: "YouTube",
  type: "Trailer",
  official: true,
  published_at: "2010-05-01",
  iso_639_1: "en",
  iso_3166_1: "US",
  size: 1080,
  ...overrides,
});

describe("TrailerModal", () => {
  it("renders an enabled button when a YouTube trailer exists", () => {
    render(<TrailerModal videos={[buildVideo()]} />);
    const btn = screen.getByRole("button", { name: /putar trailer/i });
    expect(btn).toBeEnabled();
  });

  it("renders a disabled button when no usable video exists", () => {
    render(<TrailerModal videos={[]} />);
    const btn = screen.getByRole("button", { name: /trailer tidak tersedia/i });
    expect(btn).toBeDisabled();
  });

  it("opens a dialog with a YouTube iframe when clicked", async () => {
    render(<TrailerModal videos={[buildVideo()]} />);
    await userEvent.click(screen.getByRole("button", { name: /putar trailer/i }));

    const iframe = await screen.findByTitle(/official trailer/i);
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe.getAttribute("src")).toMatch(/youtube\.com\/embed\/YOUTUBE_KEY/);
  });

  it("falls back to a Teaser when no Trailer is available", () => {
    const teaser = buildVideo({ type: "Teaser", key: "TEASER_KEY", name: "Teaser" });
    render(<TrailerModal videos={[teaser]} />);
    expect(screen.getByRole("button", { name: /putar trailer/i })).toBeEnabled();
  });

  it("ignores non-YouTube videos", () => {
    const vimeo = buildVideo({ site: "Vimeo" });
    render(<TrailerModal videos={[vimeo]} />);
    expect(
      screen.getByRole("button", { name: /trailer tidak tersedia/i }),
    ).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/detail/__tests__/TrailerModal.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/components/detail/TrailerModal.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TmdbVideo } from "@/lib/tmdb/types";

export interface TrailerModalProps {
  videos: TmdbVideo[];
}

function pickTrailer(videos: TmdbVideo[]): TmdbVideo | null {
  const youtube = videos.filter((v) => v.site === "YouTube");
  return (
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    null
  );
}

export function TrailerModal({ videos }: TrailerModalProps) {
  const trailer = useMemo(() => pickTrailer(videos), [videos]);
  const [open, setOpen] = useState(false);

  if (!trailer) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-md bg-elevated/60 px-4 py-2 text-sm font-semibold text-muted-foreground"
      >
        Trailer tidak tersedia
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
        >
          <Play className="h-4 w-4" />
          Putar Trailer
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-border bg-bg p-0">
        <DialogTitle className="sr-only">{trailer.name}</DialogTitle>
        <div className="aspect-video w-full overflow-hidden rounded-md">
          <iframe
            title={trailer.name}
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 38 tests pass (33 + 5 TrailerModal).

If `Dialog` import fails, ensure Task 4 created `src/components/ui/dialog.tsx`. The exact named exports may differ between shadcn versions — open `dialog.tsx` and confirm it exports `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`. If named differently, adjust the import.

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/detail
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(detail): TrailerModal with YouTube embed"
```

---

### Task 7: WatchlistButton placeholder (TDD)

**Files:**
- Create: `src/components/detail/__tests__/WatchlistButton.test.tsx`
- Create: `src/components/detail/WatchlistButton.tsx`

**Placeholder behavior:** renders a button labeled "Tambah ke Watchlist" (default) or "Sudah di Watchlist" (when `isInWatchlist` prop is true). Clicking it does nothing yet — Plan 5 wires real localStorage persistence. Component takes `id`, `type`, `isInWatchlist?` (default false), `onToggle?` props so Plan 5 can hook it up without rewriting the component.

- [ ] **Step 1: Write failing test**

Write to `src/components/detail/__tests__/WatchlistButton.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WatchlistButton } from "@/components/detail/WatchlistButton";

describe("WatchlistButton", () => {
  it("shows 'Tambah ke Watchlist' when not in watchlist", () => {
    render(<WatchlistButton id={1} type="movie" />);
    expect(
      screen.getByRole("button", { name: /tambah ke watchlist/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Sudah di Watchlist' when already in watchlist", () => {
    render(<WatchlistButton id={1} type="movie" isInWatchlist />);
    expect(
      screen.getByRole("button", { name: /sudah di watchlist/i }),
    ).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn();
    render(<WatchlistButton id={42} type="tv" onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("does not crash when onToggle is omitted", async () => {
    render(<WatchlistButton id={1} type="movie" />);
    await userEvent.click(screen.getByRole("button"));
    // no assertion needed — we just want no throw
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/detail/__tests__/WatchlistButton.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/components/detail/WatchlistButton.tsx`:

```tsx
"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";

export interface WatchlistButtonProps {
  id: number;
  type: "movie" | "tv";
  isInWatchlist?: boolean;
  onToggle?: () => void;
}

export function WatchlistButton({
  isInWatchlist = false,
  onToggle,
}: WatchlistButtonProps) {
  const Icon = isInWatchlist ? BookmarkCheck : Bookmark;
  const label = isInWatchlist ? "Sudah di Watchlist" : "Tambah ke Watchlist";
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
```

The `id` and `type` props are accepted but unused for now (placeholder) — they're declared so Plan 5 can drop in real wiring without changing call sites.

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 42 tests pass (38 + 4 WatchlistButton).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/detail
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(detail): WatchlistButton placeholder"
```

---

### Task 8: DetailHero component

**Files:**
- Create: `src/components/detail/DetailHero.tsx`

This is shared visual chrome — backdrop image, blur gradient, poster on the left, title + meta on the right. Used by both movie and TV detail pages. Action buttons (Tonton, Watchlist, Trailer) are rendered as children so each page page can compose them as needed.

No TDD here — visual-only component, hard to assert meaningfully without snapshot tests. Manual smoke at the end of the plan covers it.

- [ ] **Step 1: Implement**

Write to `src/components/detail/DetailHero.tsx`:

```tsx
import Image from "next/image";
import type { ReactNode } from "react";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export interface DetailHeroProps {
  title: string;
  tagline?: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  metaItems: string[]; // e.g. ["2010", "2h 28m", "Sci-Fi, Action", "★ 8.3"]
  actions: ReactNode;
}

export function DetailHero({
  title,
  tagline,
  overview,
  posterPath,
  backdropPath,
  metaItems,
  actions,
}: DetailHeroProps) {
  return (
    <section className="relative isolate w-full overflow-hidden">
      {backdropPath ? (
        <Image
          src={BACKDROP_BASE + backdropPath}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/40"
      />

      <div className="relative z-10 mx-auto max-w-screen-2xl px-4 py-10 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-[200px_1fr] md:gap-10 lg:grid-cols-[260px_1fr]">
          <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-full">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface ring-1 ring-border">
              {posterPath ? (
                <Image
                  src={POSTER_BASE + posterPath}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 260px, (min-width: 768px) 200px, 192px"
                  className="object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {title}
              </h1>
              {tagline ? (
                <p className="text-sm italic text-muted-foreground md:text-base">
                  {tagline}
                </p>
              ) : null}
            </div>

            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {metaItems.filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  {i > 0 ? <span aria-hidden>•</span> : null}
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {overview ? (
              <p className="max-w-3xl text-sm leading-relaxed text-text/90 md:text-base">
                {overview}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/detail/DetailHero.tsx
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(detail): DetailHero shared layout"
```

---

### Task 9: Movie detail page

**Files:**
- Create: `src/app/movie/[id]/page.tsx`
- Create: `src/app/movie/[id]/loading.tsx`
- Create: `src/app/movie/[id]/not-found.tsx`

- [ ] **Step 1: Implement page**

Write to `src/app/movie/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMovieDetail,
  getMovieCredits,
  getMovieVideos,
  getMovieSimilar,
} from "@/lib/tmdb/movies";
import { DetailHero } from "@/components/detail/DetailHero";
import { CastList } from "@/components/detail/CastList";
import { TrailerModal } from "@/components/detail/TrailerModal";
import { WatchlistButton } from "@/components/detail/WatchlistButton";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";

export const dynamic = "force-dynamic";

function formatRuntime(min: number | null): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let detail, credits, videos, similar;
  try {
    [detail, credits, videos, similar] = await Promise.all([
      getMovieDetail(id),
      getMovieCredits(id),
      getMovieVideos(id),
      getMovieSimilar(id),
    ]);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const year = detail.release_date ? detail.release_date.slice(0, 4) : "";
  const meta = [
    year,
    formatRuntime(detail.runtime),
    detail.genres.map((g) => g.name).join(", "),
    detail.vote_average ? `★ ${detail.vote_average.toFixed(1)}` : "",
  ].filter(Boolean);

  return (
    <main className="pb-12">
      <DetailHero
        title={detail.title}
        tagline={detail.tagline || undefined}
        overview={detail.overview}
        posterPath={detail.poster_path}
        backdropPath={detail.backdrop_path}
        metaItems={meta}
        actions={
          <>
            <Link
              href={`/watch/movie/${detail.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Tonton
            </Link>
            <TrailerModal videos={videos.results} />
            <WatchlistButton id={detail.id} type="movie" />
          </>
        }
      />

      {credits.cast.length > 0 ? (
        <section className="mx-auto max-w-screen-2xl space-y-3 px-4 pt-10 md:px-8">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Pemeran
          </h2>
          <CastList cast={credits.cast} limit={12} />
        </section>
      ) : null}

      {similar.results.length > 0 ? (
        <section className="pt-10">
          <MediaRow title="Mirip dengan ini">
            {similar.results.slice(0, 20).map((m) => (
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
        </section>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 2: Implement loading.tsx**

Write to `src/app/movie/[id]/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <main className="pb-12">
      <section className="relative w-full">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-8 md:py-16">
          <div className="grid gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr]">
            <div className="mx-auto h-72 w-48 animate-pulse rounded-lg bg-surface md:mx-0 md:h-96 md:w-full" />
            <div className="space-y-4">
              <div className="h-9 w-2/3 animate-pulse rounded bg-surface" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
              <div className="space-y-2 pt-3">
                <div className="h-3 w-full animate-pulse rounded bg-surface" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-surface" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-surface" />
              </div>
              <div className="flex gap-3 pt-3">
                <div className="h-10 w-24 animate-pulse rounded bg-surface" />
                <div className="h-10 w-32 animate-pulse rounded bg-surface" />
                <div className="h-10 w-40 animate-pulse rounded bg-surface" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Implement not-found.tsx**

Write to `src/app/movie/[id]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Film tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        Mungkin sudah dihapus dari TMDB atau ID-nya tidak valid.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Verify build + tests**

```bash
npm run build
npm run test
```

Expected: build succeeds, 42 tests still pass.

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/movie
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: movie detail page with cast, trailer, similar"
```

---

### Task 10: SeasonSelector component (TDD)

**Files:**
- Create: `src/components/tv/__tests__/SeasonSelector.test.tsx`
- Create: `src/components/tv/SeasonSelector.tsx`

**Design:** Server-rendered list of season buttons. Selected season is the URL search param `?s=<n>` (default = first regular season, i.e. season_number > 0). Buttons are real `<Link>` elements so navigation is back/forward-friendly.

- [ ] **Step 1: Write failing test**

Write to `src/components/tv/__tests__/SeasonSelector.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeasonSelector } from "@/components/tv/SeasonSelector";

const SEASONS = [
  {
    id: 0,
    air_date: "2010-01-01",
    episode_count: 5,
    name: "Specials",
    overview: "",
    poster_path: null,
    season_number: 0,
    vote_average: 0,
  },
  {
    id: 1,
    air_date: "2011-04-17",
    episode_count: 10,
    name: "Season 1",
    overview: "",
    poster_path: null,
    season_number: 1,
    vote_average: 8.5,
  },
  {
    id: 2,
    air_date: "2012-04-01",
    episode_count: 10,
    name: "Season 2",
    overview: "",
    poster_path: null,
    season_number: 2,
    vote_average: 8.7,
  },
];

describe("SeasonSelector", () => {
  it("renders one button per regular season (skips season 0)", () => {
    render(<SeasonSelector tvId={1399} seasons={SEASONS} currentSeason={1} />);
    expect(screen.getByRole("link", { name: /season 1/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /season 2/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /specials/i })).toBeNull();
  });

  it("links each button to /tv/:id?s=:n", () => {
    render(<SeasonSelector tvId={1399} seasons={SEASONS} currentSeason={1} />);
    expect(screen.getByRole("link", { name: /season 1/i })).toHaveAttribute(
      "href",
      "/tv/1399?s=1",
    );
    expect(screen.getByRole("link", { name: /season 2/i })).toHaveAttribute(
      "href",
      "/tv/1399?s=2",
    );
  });

  it("marks the current season with aria-current=page", () => {
    render(<SeasonSelector tvId={1399} seasons={SEASONS} currentSeason={2} />);
    expect(screen.getByRole("link", { name: /season 2/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /season 1/i })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/tv/__tests__/SeasonSelector.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/components/tv/SeasonSelector.tsx`:

```tsx
import Link from "next/link";
import type { TmdbTvSeasonSummary } from "@/lib/tmdb/types";

export interface SeasonSelectorProps {
  tvId: number;
  seasons: TmdbTvSeasonSummary[];
  currentSeason: number;
}

export function SeasonSelector({
  tvId,
  seasons,
  currentSeason,
}: SeasonSelectorProps) {
  const regular = seasons.filter((s) => s.season_number > 0);

  return (
    <div className="flex flex-wrap gap-2">
      {regular.map((season) => {
        const active = season.season_number === currentSeason;
        return (
          <Link
            key={season.id}
            href={`/tv/${tvId}?s=${season.season_number}`}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                : "rounded-md bg-elevated px-3 py-1.5 text-sm font-medium text-text ring-1 ring-border hover:bg-elevated/80"
            }
          >
            {season.name}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 45 tests pass (42 + 3 SeasonSelector).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/tv
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tv): SeasonSelector"
```

---

### Task 11: EpisodeList component (TDD)

**Files:**
- Create: `src/components/tv/__tests__/EpisodeList.test.tsx`
- Create: `src/components/tv/EpisodeList.tsx`

**Design:** vertical list, each episode shows still (or placeholder), episode number, title, runtime, overview. Clicking the episode navigates to `/watch/tv/<tvId>/<season>/<episode>` (page is Plan 4, will 404 for now — that's fine).

- [ ] **Step 1: Write failing test**

Write to `src/components/tv/__tests__/EpisodeList.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EpisodeList } from "@/components/tv/EpisodeList";

const EPISODES = [
  {
    id: 101,
    name: "Winter Is Coming",
    overview: "Lord Eddard…",
    episode_number: 1,
    season_number: 1,
    air_date: "2011-04-17",
    still_path: "/ep1.jpg",
    runtime: 62,
    vote_average: 8.0,
    vote_count: 100,
  },
  {
    id: 102,
    name: "The Kingsroad",
    overview: "An incident on…",
    episode_number: 2,
    season_number: 1,
    air_date: "2011-04-24",
    still_path: null,
    runtime: 56,
    vote_average: 8.1,
    vote_count: 100,
  },
];

describe("EpisodeList", () => {
  it("renders episode number, name, and overview for each episode", () => {
    render(<EpisodeList tvId={1399} season={1} episodes={EPISODES} />);
    expect(screen.getByText("Winter Is Coming")).toBeInTheDocument();
    expect(screen.getByText("The Kingsroad")).toBeInTheDocument();
    expect(screen.getByText(/lord eddard/i)).toBeInTheDocument();
  });

  it("links each episode to /watch/tv/:id/:s/:e", () => {
    render(<EpisodeList tvId={1399} season={1} episodes={EPISODES} />);
    expect(
      screen.getByRole("link", { name: /winter is coming/i }),
    ).toHaveAttribute("href", "/watch/tv/1399/1/1");
    expect(
      screen.getByRole("link", { name: /kingsroad/i }),
    ).toHaveAttribute("href", "/watch/tv/1399/1/2");
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/tv/__tests__/EpisodeList.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/components/tv/EpisodeList.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { TmdbEpisode } from "@/lib/tmdb/types";

const STILL_BASE = "https://image.tmdb.org/t/p/w300";

export interface EpisodeListProps {
  tvId: number;
  season: number;
  episodes: TmdbEpisode[];
}

export function EpisodeList({ tvId, season, episodes }: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada episode untuk season ini.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {episodes.map((ep) => (
        <li key={ep.id}>
          <Link
            href={`/watch/tv/${tvId}/${season}/${ep.episode_number}`}
            className="flex gap-4 rounded-lg bg-surface p-3 ring-1 ring-border transition-colors hover:bg-elevated"
          >
            <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-elevated sm:w-40">
              {ep.still_path ? (
                <Image
                  src={STILL_BASE + ep.still_path}
                  alt={ep.name}
                  fill
                  sizes="(min-width: 640px) 160px, 128px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  E{ep.episode_number}
                </span>
                <h3 className="truncate text-sm font-semibold text-text">
                  {ep.name}
                </h3>
              </div>
              <p className="line-clamp-2 pt-1 text-xs text-muted-foreground">
                {ep.overview}
              </p>
              {ep.runtime ? (
                <p className="pt-1 text-[11px] text-muted-foreground">
                  {ep.runtime} menit
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 47 tests pass (45 + 2 EpisodeList).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/tv
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(tv): EpisodeList"
```

---

### Task 12: TV detail page

**Files:**
- Create: `src/app/tv/[id]/page.tsx`
- Create: `src/app/tv/[id]/loading.tsx`
- Create: `src/app/tv/[id]/not-found.tsx`

- [ ] **Step 1: Implement page**

Write to `src/app/tv/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getTvDetail,
  getTvCredits,
  getSeasonDetail,
} from "@/lib/tmdb/tv";
import { DetailHero } from "@/components/detail/DetailHero";
import { CastList } from "@/components/detail/CastList";
import { WatchlistButton } from "@/components/detail/WatchlistButton";
import { SeasonSelector } from "@/components/tv/SeasonSelector";
import { EpisodeList } from "@/components/tv/EpisodeList";

export const dynamic = "force-dynamic";

export default async function TvDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const { id: idParam } = await params;
  const { s: sParam } = await searchParams;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let detail, credits;
  try {
    [detail, credits] = await Promise.all([getTvDetail(id), getTvCredits(id)]);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const regularSeasons = detail.seasons.filter((s) => s.season_number > 0);
  const requestedSeason = Number(sParam);
  const validRequested = regularSeasons.some(
    (s) => s.season_number === requestedSeason,
  );
  const currentSeason = validRequested
    ? requestedSeason
    : regularSeasons[0]?.season_number ?? 1;

  let season = null;
  if (regularSeasons.length > 0) {
    try {
      season = await getSeasonDetail(id, currentSeason);
    } catch {
      season = null;
    }
  }

  const year = detail.first_air_date
    ? detail.first_air_date.slice(0, 4)
    : "";
  const endYear =
    detail.last_air_date && !detail.in_production
      ? detail.last_air_date.slice(0, 4)
      : null;
  const yearRange = endYear && endYear !== year ? `${year}–${endYear}` : year;

  const meta = [
    yearRange,
    `${detail.number_of_seasons} season • ${detail.number_of_episodes} episode`,
    detail.genres.map((g) => g.name).join(", "),
    detail.vote_average ? `★ ${detail.vote_average.toFixed(1)}` : "",
  ].filter(Boolean);

  return (
    <main className="pb-12">
      <DetailHero
        title={detail.name}
        tagline={detail.tagline || undefined}
        overview={detail.overview}
        posterPath={detail.poster_path}
        backdropPath={detail.backdrop_path}
        metaItems={meta}
        actions={
          <>
            {season && season.episodes[0] ? (
              <Link
                href={`/watch/tv/${detail.id}/${currentSeason}/${season.episodes[0].episode_number}`}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Tonton
              </Link>
            ) : null}
            <WatchlistButton id={detail.id} type="tv" />
          </>
        }
      />

      {credits.cast.length > 0 ? (
        <section className="mx-auto max-w-screen-2xl space-y-3 px-4 pt-10 md:px-8">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Pemeran
          </h2>
          <CastList cast={credits.cast} limit={12} />
        </section>
      ) : null}

      {regularSeasons.length > 0 ? (
        <section className="mx-auto max-w-screen-2xl space-y-4 px-4 pt-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">
              Episode
            </h2>
            <SeasonSelector
              tvId={detail.id}
              seasons={regularSeasons}
              currentSeason={currentSeason}
            />
          </div>
          {season ? (
            <EpisodeList
              tvId={detail.id}
              season={currentSeason}
              episodes={season.episodes}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Tidak bisa memuat episode untuk season ini.
            </p>
          )}
        </section>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 2: Implement loading.tsx and not-found.tsx**

Write to `src/app/tv/[id]/loading.tsx` (same content as movie loading; you can copy it verbatim):

```tsx
export default function Loading() {
  return (
    <main className="pb-12">
      <section className="relative w-full">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-8 md:py-16">
          <div className="grid gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr]">
            <div className="mx-auto h-72 w-48 animate-pulse rounded-lg bg-surface md:mx-0 md:h-96 md:w-full" />
            <div className="space-y-4">
              <div className="h-9 w-2/3 animate-pulse rounded bg-surface" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
              <div className="space-y-2 pt-3">
                <div className="h-3 w-full animate-pulse rounded bg-surface" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-surface" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-surface" />
              </div>
              <div className="flex gap-3 pt-3">
                <div className="h-10 w-24 animate-pulse rounded bg-surface" />
                <div className="h-10 w-40 animate-pulse rounded bg-surface" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

Write to `src/app/tv/[id]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Serial tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        Mungkin sudah dihapus dari TMDB atau ID-nya tidak valid.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
```

- [ ] **Step 3: Verify build + tests**

```bash
npm run build
npm run test
```

Expected: build succeeds, 47 tests still pass.

- [ ] **Step 4: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/tv
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: tv detail page with cast, seasons, episodes"
```

---

### Task 13: Manual smoke test (user-driven)

**No code change.**

- [ ] **Step 1: Confirm `.env.local` has a real TMDB token**

If `TMDB_READ_TOKEN` is still `REPLACE_WITH_YOUR_TOKEN`, ask the user to paste their token before proceeding.

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 3: Verify movie detail**

- Click any poster on the homepage → should land on `/movie/<id>`
- Page shows: backdrop blur, poster, title + tagline, year + runtime + genres + rating, overview, "Tonton"/"Putar Trailer"/"Tambah ke Watchlist" buttons, cast row, "Mirip dengan ini" row
- Click "Putar Trailer" — modal opens with YouTube embed (autoplay)
- Click "Tonton" → 404 (`/watch/movie/<id>` is Plan 4)
- Click cast row item — does nothing (no cast detail page in scope)
- Click a "Mirip dengan ini" poster → navigates to that movie's detail

- [ ] **Step 4: Verify TV detail**

- Click a TV poster on the homepage → should land on `/tv/<id>`
- Page shows: same hero shape, season selector, episode list
- Click another season button — URL becomes `?s=2`, episode list refreshes
- Click an episode → 404 (`/watch/tv/...` is Plan 4)

- [ ] **Step 5: Verify edge cases**

- Visit `http://localhost:3000/movie/999999999` (made-up ID) → friendly "Film tidak ditemukan" page
- Visit `http://localhost:3000/tv/999999999` → "Serial tidak ditemukan"

Stop the dev server.

---

## Plan 3 done when:

- All ~47 tests pass
- `npm run build` succeeds (movie + tv detail routes show as `ƒ` Dynamic)
- Manual smoke test passes for both movie and TV
- `git log` shows ~12 new commits introduced in this plan

**Next plan:** Plan 4 — Player + Watch Pages (vidking embed, season/episode navigation, watch tracking).
