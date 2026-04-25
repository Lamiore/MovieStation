# Plan 4: Player + Watch Pages (vidking integration)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire up vidking.net as the streaming source. Two new routes — `/watch/movie/[id]` and `/watch/tv/[id]/[season]/[episode]` — embed vidking's player via iframe. TV watch shows episode list with a "Next Episode" button so users can advance manually (vidking doesn't expose end-of-video events cross-origin).

**Architecture:** Server Components fetch the bare minimum from TMDB (title for `<title>`, breadcrumb info, episode list for TV). The `<VidkingPlayer>` is a small server-renderable iframe wrapper — no client interactivity needed inside it. The "Next Episode" button is a regular `<Link>`.

**Tech Stack:** Same as before. No new deps.

**Deferred:** WatchTracker (writes to history localStorage) → Plan 5. Continue Watching row on homepage → Plan 5. Auto-next-episode (vidking doesn't postMessage when video ends — manual only).

---

## File structure (this plan adds)

```
src/lib/vidking/
  buildEmbedUrl.ts                # NEW — pure function
  __tests__/buildEmbedUrl.test.ts
src/components/player/
  VidkingPlayer.tsx               # NEW — iframe wrapper
  __tests__/VidkingPlayer.test.tsx
src/app/watch/
  movie/[id]/
    page.tsx
    loading.tsx
    not-found.tsx
  tv/[id]/[season]/[episode]/
    page.tsx
    loading.tsx
    not-found.tsx
```

---

### Task 1: vidking buildEmbedUrl helper (TDD)

**Files:**
- Create: `src/lib/vidking/__tests__/buildEmbedUrl.test.ts`
- Create: `src/lib/vidking/buildEmbedUrl.ts`

vidking URL conventions:

```
Movie: https://www.vidking.net/embed/movie/{tmdb_id}
TV:    https://www.vidking.net/embed/tv/{tmdb_id}/{season}/{episode}
```

- [ ] **Step 1: Write failing test**

Write to `src/lib/vidking/__tests__/buildEmbedUrl.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildEmbedUrl } from "@/lib/vidking/buildEmbedUrl";

describe("buildEmbedUrl", () => {
  it("returns the movie embed URL for type=movie", () => {
    expect(buildEmbedUrl({ type: "movie", id: 27205 })).toBe(
      "https://www.vidking.net/embed/movie/27205",
    );
  });

  it("returns the TV embed URL with season+episode for type=tv", () => {
    expect(
      buildEmbedUrl({ type: "tv", id: 1399, season: 1, episode: 1 }),
    ).toBe("https://www.vidking.net/embed/tv/1399/1/1");
  });

  it("throws when type=tv but season or episode is missing", () => {
    // @ts-expect-error — runtime guard
    expect(() => buildEmbedUrl({ type: "tv", id: 1399 })).toThrow(
      /season.*episode/i,
    );
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/lib/vidking/__tests__/buildEmbedUrl.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Write to `src/lib/vidking/buildEmbedUrl.ts`:

```ts
const BASE_URL = "https://www.vidking.net/embed";

export type BuildEmbedUrlInput =
  | { type: "movie"; id: number }
  | { type: "tv"; id: number; season: number; episode: number };

export function buildEmbedUrl(input: BuildEmbedUrlInput): string {
  if (input.type === "movie") {
    return `${BASE_URL}/movie/${input.id}`;
  }
  if (
    typeof input.season !== "number" ||
    typeof input.episode !== "number"
  ) {
    throw new Error("buildEmbedUrl: tv requires both season and episode");
  }
  return `${BASE_URL}/tv/${input.id}/${input.season}/${input.episode}`;
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 50 tests pass (47 + 3 new).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/lib/vidking
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(vidking): buildEmbedUrl helper"
```

---

### Task 2: VidkingPlayer component (TDD)

**Files:**
- Create: `src/components/player/__tests__/VidkingPlayer.test.tsx`
- Create: `src/components/player/VidkingPlayer.tsx`

**Design:** thin iframe wrapper. Aspect-video container so layout is stable while loading. Allows fullscreen + autoplay + PiP. `referrerPolicy="no-referrer"` since some embed providers reject specific referrers.

- [ ] **Step 1: Write failing test**

Write to `src/components/player/__tests__/VidkingPlayer.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VidkingPlayer } from "@/components/player/VidkingPlayer";

describe("VidkingPlayer", () => {
  it("renders an iframe with the provided src", () => {
    const { container } = render(
      <VidkingPlayer src="https://www.vidking.net/embed/movie/27205" title="Inception" />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute("src")).toBe(
      "https://www.vidking.net/embed/movie/27205",
    );
  });

  it("sets title (for accessibility), allowFullScreen, and referrer-policy", () => {
    const { container } = render(
      <VidkingPlayer src="https://example/embed/x" title="Some Title" />,
    );
    const iframe = container.querySelector("iframe")!;
    expect(iframe.getAttribute("title")).toBe("Some Title");
    expect(iframe.hasAttribute("allowfullscreen")).toBe(true);
    expect(iframe.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(iframe.getAttribute("allow")).toMatch(/autoplay/);
    expect(iframe.getAttribute("allow")).toMatch(/fullscreen/);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

```bash
npm run test -- src/components/player/__tests__/VidkingPlayer.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

Write to `src/components/player/VidkingPlayer.tsx`:

```tsx
export interface VidkingPlayerProps {
  src: string;
  title: string;
}

export function VidkingPlayer({ src, title }: VidkingPlayerProps) {
  return (
    <div className="relative aspect-video w-full bg-black">
      <iframe
        src={src}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
npm run test
```

Expected: 52 tests pass (50 + 2 new).

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/components/player
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat(player): VidkingPlayer iframe wrapper"
```

---

### Task 3: Movie watch page

**Files:**
- Create: `src/app/watch/movie/[id]/page.tsx`
- Create: `src/app/watch/movie/[id]/loading.tsx`
- Create: `src/app/watch/movie/[id]/not-found.tsx`

**Design:** minimal. Title + back-to-detail link above the player. Player full-width up to ~1280px max. Below the player: short overview, year, "Kembali ke detail" link. No header/footer interference (those live in root layout).

- [ ] **Step 1: Implement page**

Write to `src/app/watch/movie/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getMovieDetail } from "@/lib/tmdb/movies";
import { VidkingPlayer } from "@/components/player/VidkingPlayer";
import { buildEmbedUrl } from "@/lib/vidking/buildEmbedUrl";

export const dynamic = "force-dynamic";

export default async function WatchMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let detail;
  try {
    detail = await getMovieDetail(id);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const src = buildEmbedUrl({ type: "movie", id });
  const year = detail.release_date ? detail.release_date.slice(0, 4) : "";

  return (
    <main className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
      <Link
        href={`/movie/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke detail
      </Link>

      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {detail.title}
        {year ? (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({year})
          </span>
        ) : null}
      </h1>

      <VidkingPlayer src={src} title={`${detail.title} (${year})`} />

      {detail.overview ? (
        <p className="max-w-3xl text-sm text-text/80">{detail.overview}</p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Sumber streaming dari pihak ketiga (vidking.net). Kalau player gagal
        memuat, coba refresh atau matikan adblock.
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Implement loading.tsx**

Write to `src/app/watch/movie/[id]/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
      <div className="h-4 w-32 animate-pulse rounded bg-surface" />
      <div className="h-7 w-2/3 animate-pulse rounded bg-surface" />
      <div className="aspect-video w-full animate-pulse rounded bg-surface" />
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-surface" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-surface" />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Implement not-found.tsx**

Write to `src/app/watch/movie/[id]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Film tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        ID film tidak valid atau sudah dihapus dari TMDB.
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

Expected: build adds `ƒ /watch/movie/[id]`, tests still 52.

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/watch/movie
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: movie watch page with vidking embed"
```

---

### Task 4: TV watch page with episode list + next button

**Files:**
- Create: `src/app/watch/tv/[id]/[season]/[episode]/page.tsx`
- Create: `src/app/watch/tv/[id]/[season]/[episode]/loading.tsx`
- Create: `src/app/watch/tv/[id]/[season]/[episode]/not-found.tsx`

**Design:** above the player — series title + S/E breadcrumb + back-to-detail link. Below the player — episode title + overview + "Episode Berikutnya" / "Episode Sebelumnya" buttons + the episode list for the current season (so user can jump). The next/prev button only appears when an adjacent episode exists; otherwise hidden.

- [ ] **Step 1: Implement page**

Write to `src/app/watch/tv/[id]/[season]/[episode]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTvDetail, getSeasonDetail } from "@/lib/tmdb/tv";
import { VidkingPlayer } from "@/components/player/VidkingPlayer";
import { buildEmbedUrl } from "@/lib/vidking/buildEmbedUrl";
import { EpisodeList } from "@/components/tv/EpisodeList";

export const dynamic = "force-dynamic";

export default async function WatchTvEpisodePage({
  params,
}: {
  params: Promise<{ id: string; season: string; episode: string }>;
}) {
  const { id: idParam, season: sParam, episode: eParam } = await params;
  const id = Number(idParam);
  const seasonNumber = Number(sParam);
  const episodeNumber = Number(eParam);
  if (
    !Number.isInteger(id) || id <= 0 ||
    !Number.isInteger(seasonNumber) || seasonNumber < 0 ||
    !Number.isInteger(episodeNumber) || episodeNumber <= 0
  ) {
    notFound();
  }

  let detail, season;
  try {
    [detail, season] = await Promise.all([
      getTvDetail(id),
      getSeasonDetail(id, seasonNumber),
    ]);
  } catch (err) {
    if (err instanceof Error && /TMDB 404/.test(err.message)) notFound();
    throw err;
  }

  const episode = season.episodes.find(
    (ep) => ep.episode_number === episodeNumber,
  );
  if (!episode) notFound();

  const src = buildEmbedUrl({
    type: "tv",
    id,
    season: seasonNumber,
    episode: episodeNumber,
  });

  const idx = season.episodes.findIndex(
    (ep) => ep.episode_number === episodeNumber,
  );
  const prev = idx > 0 ? season.episodes[idx - 1] : null;
  const next =
    idx >= 0 && idx < season.episodes.length - 1
      ? season.episodes[idx + 1]
      : null;

  return (
    <main className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
      <Link
        href={`/tv/${id}?s=${seasonNumber}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke detail
      </Link>

      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {detail.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          S{seasonNumber} • E{episodeNumber} — {episode.name}
        </p>
      </div>

      <VidkingPlayer
        src={src}
        title={`${detail.name} S${seasonNumber}E${episodeNumber}`}
      />

      <div className="flex flex-wrap items-center gap-3">
        {prev ? (
          <Link
            href={`/watch/tv/${id}/${seasonNumber}/${prev.episode_number}`}
            className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
          >
            <ChevronLeft className="h-4 w-4" />
            Episode Sebelumnya
          </Link>
        ) : null}
        {next ? (
          <Link
            href={`/watch/tv/${id}/${seasonNumber}/${next.episode_number}`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Episode Berikutnya
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      {episode.overview ? (
        <p className="max-w-3xl text-sm text-text/80">{episode.overview}</p>
      ) : null}

      <section className="space-y-3 pt-6">
        <h2 className="text-base font-semibold tracking-tight md:text-lg">
          Semua episode S{seasonNumber}
        </h2>
        <EpisodeList
          tvId={id}
          season={seasonNumber}
          episodes={season.episodes}
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Sumber streaming dari pihak ketiga (vidking.net). Kalau player gagal
        memuat, coba refresh atau matikan adblock.
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Implement loading.tsx**

Write to `src/app/watch/tv/[id]/[season]/[episode]/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-8">
      <div className="h-4 w-32 animate-pulse rounded bg-surface" />
      <div className="h-7 w-2/3 animate-pulse rounded bg-surface" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
      <div className="aspect-video w-full animate-pulse rounded bg-surface" />
      <div className="flex gap-3">
        <div className="h-10 w-40 animate-pulse rounded bg-surface" />
        <div className="h-10 w-40 animate-pulse rounded bg-surface" />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Implement not-found.tsx**

Write to `src/app/watch/tv/[id]/[season]/[episode]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Episode tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        Season atau episode yang diminta tidak ada di TMDB.
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

Expected: build adds `ƒ /watch/tv/[id]/[season]/[episode]`, 52 tests pass.

- [ ] **Step 5: Commit**

```bash
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" add src/app/watch/tv
git -c user.email="ilham_lam@icloud.com" -c user.name="irhammohammad" commit -m "feat: tv watch page with episode list, prev/next buttons"
```

---

### Task 5: Manual smoke test (user-driven)

**No code change.**

- [ ] **Step 1: Confirm `.env.local` has a real TMDB token**

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

- [ ] **Step 3: Movie watch flow**

- Click any movie poster on the homepage → detail page
- Click "Tonton" → `/watch/movie/<id>`
- Player should load — vidking iframe with the movie streaming
- Click "Kembali ke detail" → returns to detail page

If player shows "video not found" or stays blank: that title may not be on vidking. That's an inherent limitation of the third-party source; nothing we can do without fallback providers (out of scope).

- [ ] **Step 4: TV watch flow**

- Click any TV poster → detail page
- Click an episode in the episode list → `/watch/tv/<id>/<s>/<e>`
- Player loads, breadcrumb shows S/E and episode title
- "Episode Berikutnya" navigates to next episode within the season
- "Episode Sebelumnya" navigates back (hidden on E1)
- Episode list at the bottom — clicking any episode navigates there

- [ ] **Step 5: Edge cases**

- Visit `http://localhost:3000/watch/movie/999999999` → "Film tidak ditemukan"
- Visit `http://localhost:3000/watch/tv/1/1/9999` → "Episode tidak ditemukan"

Stop the dev server.

---

## Plan 4 done when:

- 52 tests pass
- `npm run build` succeeds; routes include `ƒ /watch/movie/[id]` and `ƒ /watch/tv/[id]/[season]/[episode]`
- Manual smoke for both movie and TV watch flows works in the browser
- 5 new commits in `git log`

**Next plan:** Plan 5 — Personal Features (watchlist persistence, watch history, Continue Watching row, real WatchlistButton wiring).
