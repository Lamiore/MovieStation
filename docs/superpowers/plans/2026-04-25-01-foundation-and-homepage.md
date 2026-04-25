# Plan 1: Foundation + Minimal Homepage

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js project, build the TMDB server-side client, and ship a working homepage that renders a single "Trending This Week" row of real film posters.

**Architecture:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui. TMDB is fetched from Server Components through a server-only wrapper. Vitest + React Testing Library for unit tests. i18n and remaining rows/pages are deferred to later plans.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, **Tailwind CSS v4** (CSS-based config via `@theme`), shadcn/ui, Vitest, React Testing Library, TMDB API (Read Access Token v4). Font: **Geist** (scaffolded by default).

**Note on Tailwind v4:** The scaffold uses Tailwind v4, which has no `tailwind.config.ts`. Theme tokens are defined inside `@theme` in `globals.css`. PostCSS uses the `@tailwindcss/postcss` plugin. Import is `@import "tailwindcss"`, not `@tailwind base/components/utilities`.

**Token naming convention** (after Task 3 stabilizes the palette): the project uses two non-overlapping sets of utility classes:

| Purpose | Use | Source |
|---|---|---|
| Page bg | `bg-bg` | our `@theme` |
| Card / row container bg | `bg-surface` | our `@theme` |
| Elevated bg (chips, tooltips) | `bg-elevated` | our `@theme` |
| Default text | `text-text` | our `@theme` |
| Muted/secondary text (year, byline) | `text-muted-foreground` | shadcn |
| Brand accent (rating, play button) | `text-primary` / `bg-primary` | shadcn (mapped to `#e50914` in `.dark`) |
| Borders & rings | `border-border` / `ring-border` | shadcn (mapped to `#2a2a2a` in `.dark`) |
| shadcn components (Button etc.) | `bg-primary text-primary-foreground` etc. | shadcn |

We do NOT define `--color-border`, `--color-muted`, or `--color-accent` in our `@theme` — those collide with shadcn's tokens and would silently lose. Use the shadcn equivalents above instead.

**Deferred to later plans:** next-intl / language toggle, hero banner, remaining homepage rows, detail pages, watch pages, watchlist, history, search, browse. Plan 1 hardcodes UI strings in Indonesian — no translation layer yet.

---

## File Structure

Files created in this plan:

```
.env.example                          Template env vars
.env.local                            Local env vars (gitignored)
.gitignore                            Next.js + env + test ignores
README.md                             Minimal project README
package.json                          Next.js + deps
tsconfig.json                         TypeScript config
next.config.ts                        TMDB image domain allowlist
tailwind.config.ts                    Color palette + fonts
postcss.config.mjs                    Tailwind plugin
components.json                       shadcn/ui config
vitest.config.ts                      Vitest + jsdom + path aliases
vitest.setup.ts                       Testing Library matchers
src/app/layout.tsx                    Root layout — fonts, dark bg
src/app/page.tsx                      Homepage — fetch trending + render row
src/app/globals.css                   Tailwind + CSS variables
src/lib/utils.ts                      cn() helper
src/lib/tmdb/types.ts                 TMDB response types
src/lib/tmdb/client.ts                Server-only fetch wrapper
src/lib/tmdb/movies.ts                getTrending()
src/lib/tmdb/__tests__/client.test.ts Client tests
src/lib/tmdb/__tests__/movies.test.ts Movies tests
src/components/media/MediaCard.tsx    Poster card
src/components/media/MediaCardSkeleton.tsx  Loading state
src/components/media/MediaRow.tsx     Horizontal scroll row
src/components/media/__tests__/MediaCard.test.tsx
src/components/media/__tests__/MediaRow.test.tsx
public/placeholder-poster.svg         Fallback when posterPath is null
```

Each file has a single responsibility. TMDB module is server-only; components are pure view.

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`, `README.md`, `public/*` (via create-next-app)

- [ ] **Step 1: Scaffold Next.js into a temp directory and copy files in**

This avoids `create-next-app`'s "directory not empty" refusal — we already have `docs/` and `.git/` in the project.

Run:
```bash
rm -rf /tmp/nontonfilm-scaffold
npx --yes create-next-app@latest /tmp/nontonfilm-scaffold \
  --typescript --tailwind --eslint --app --src-dir --turbopack \
  --import-alias "@/*" --use-npm --no-git
```

Then copy the scaffolded files into the project (preserving existing `docs/` and `.git/`):

```bash
cd /Users/irhammohammad/Documents/Code/React/nontonfilm
cp -R /tmp/nontonfilm-scaffold/. .
rm -rf /tmp/nontonfilm-scaffold
```

Expected: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/*`, `.gitignore`, `README.md`, `public/*` now exist in the project. `docs/` and `.git/` are untouched.

- [ ] **Step 2: Verify dev server boots**

Run:
```bash
npm run dev
```

Expected: server starts at `http://localhost:3000`. Open browser briefly to confirm the default page renders. Stop the server with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 project with TypeScript + Tailwind"
```

---

### Task 2: Apply project color palette (Tailwind v4 + Geist)

Tailwind v4 uses CSS-based configuration via `@theme`. There is **no** `tailwind.config.ts` file. Theme tokens become utility classes automatically (e.g. `--color-bg` → `bg-bg`, `text-bg`, `border-bg`).

**Files:**
- Modify: `src/app/globals.css` (replace scaffold content)
- Modify: `src/app/layout.tsx` (set page metadata, language, dark body bg)

- [ ] **Step 1: Replace `src/app/globals.css`**

Write to `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0a;
  --color-surface: #141414;
  --color-elevated: #1f1f1f;
  --color-border: #2a2a2a;
  --color-text: #f5f5f5;
  --color-muted: #9ca3af;
  --color-accent: #e50914;

  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}

html,
body {
  min-height: 100%;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}
```

- [ ] **Step 2: Update `src/app/layout.tsx`**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-bg text-text min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify**

Run:
```bash
npm run dev
```

Open `http://localhost:3000` (or the port the server prints if 3000 is taken). Expected: page background is near-black (`#0a0a0a`), Geist font applied. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/app
git commit -m "feat: apply dark color palette via Tailwind v4 @theme"
```

---

### Task 3: Install and configure shadcn/ui

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx` (generated)

- [ ] **Step 1: Initialize shadcn/ui**

Run:
```bash
npx --yes shadcn@latest init -d
```

This creates `components.json` and `src/lib/utils.ts`. Accept defaults — they align with our structure (alias `@/*`, `src/components`, Tailwind).

- [ ] **Step 2: Add the button component**

Run:
```bash
npx --yes shadcn@latest add button
```

Expected: `src/components/ui/button.tsx` created.

- [ ] **Step 3: Verify `src/lib/utils.ts` exists with `cn()`**

Run:
```bash
cat src/lib/utils.ts
```

Expected output contains a `cn` function that combines `clsx` and `tailwind-merge`. If missing, install deps manually:

```bash
npm install clsx tailwind-merge
```

And write to `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: install and configure shadcn/ui"
```

---

### Task 4: Install and configure Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (add `test` script)

- [ ] **Step 1: Install test dependencies**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

Write to `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

Write to `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Add test script in `package.json`**

In `package.json`, inside `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test**

Create `src/lib/__tests__/utils.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", false && "hidden", "font-bold")).toBe(
      "text-red-500 font-bold",
    );
  });
});
```

- [ ] **Step 6: Run tests**

Run:
```bash
npm run test
```

Expected: 1 file, 1 test passes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: set up Vitest + React Testing Library"
```

---

### Task 5: Configure env vars and ignore secrets

**Files:**
- Create: `.env.example`
- Create: `.env.local`
- Modify: `.gitignore`

- [ ] **Step 1: Create `.env.example`**

Write to `.env.example`:

```
# TMDB API — get from https://www.themoviedb.org/settings/api
# Use the "API Read Access Token" (v4), NOT the v3 API key.
TMDB_READ_TOKEN=
```

- [ ] **Step 2: Create `.env.local`**

Write to `.env.local`:

```
TMDB_READ_TOKEN=REPLACE_WITH_YOUR_TOKEN
```

**Tell the user to paste their regenerated Read Access Token into `.env.local` before moving on.** Do NOT paste any token into this file from chat history.

- [ ] **Step 3: Verify `.gitignore` ignores `.env.local`**

Run:
```bash
grep -E "^\.env" .gitignore
```

Expected: the default CNA `.gitignore` already lists `.env*` or at minimum `.env.local`. If not, append:

```
# local env
.env.local
.env*.local
```

- [ ] **Step 4: Confirm `.env.local` is NOT staged**

Run:
```bash
git status --porcelain | grep -E "\.env\.local" || echo "not staged (good)"
```

Expected: `not staged (good)`.

- [ ] **Step 5: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add env template and ignore local env files"
```

---

### Task 6: TMDB types

**Files:**
- Create: `src/lib/tmdb/types.ts`

- [ ] **Step 1: Write types**

Write to `src/lib/tmdb/types.ts`:

```ts
export type TmdbLocale = "id-ID" | "en-US";

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string; // "YYYY-MM-DD"
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  video: boolean;
  vote_count: number;
}

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbErrorResponse {
  status_code: number;
  status_message: string;
  success: false;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/tmdb/types.ts
git commit -m "feat: add TMDB response types"
```

---

### Task 7: TMDB client wrapper (TDD)

**Files:**
- Create: `src/lib/tmdb/__tests__/client.test.ts`
- Create: `src/lib/tmdb/client.ts`

- [ ] **Step 1: Write failing test**

Write to `src/lib/tmdb/__tests__/client.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("tmdbFetch", () => {
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

  it("calls TMDB with bearer token, locale, and include_adult=false", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), { status: 200 }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { tmdbFetch } = await import("@/lib/tmdb/client");
    await tmdbFetch("/trending/movie/week", { locale: "id-ID" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    const parsed = new URL(url as string);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://api.themoviedb.org/3/trending/movie/week",
    );
    expect(parsed.searchParams.get("language")).toBe("id-ID");
    expect(parsed.searchParams.get("include_adult")).toBe("false");
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: "Bearer test-token",
      accept: "application/json",
    });
  });

  it("throws a helpful error on non-OK response", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status_code: 7,
          status_message: "Invalid API key",
          success: false,
        }),
        { status: 401 },
      ),
    ) as unknown as typeof fetch;

    const { tmdbFetch } = await import("@/lib/tmdb/client");
    await expect(tmdbFetch("/trending/movie/week")).rejects.toThrow(
      /TMDB 401.*Invalid API key/,
    );
  });

  it("throws if TMDB_READ_TOKEN is missing", async () => {
    delete process.env.TMDB_READ_TOKEN;
    const { tmdbFetch } = await import("@/lib/tmdb/client");
    await expect(tmdbFetch("/trending/movie/week")).rejects.toThrow(
      /TMDB_READ_TOKEN/,
    );
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run:
```bash
npm run test -- src/lib/tmdb/__tests__/client.test.ts
```

Expected: FAIL with module not found `@/lib/tmdb/client`.

- [ ] **Step 3: Implement `src/lib/tmdb/client.ts`**

Write to `src/lib/tmdb/client.ts`:

```ts
import "server-only";
import type { TmdbLocale } from "./types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_REVALIDATE_SECONDS = 60 * 60; // 1 hour

export interface TmdbFetchOptions {
  locale?: TmdbLocale;
  searchParams?: Record<string, string | number | boolean | undefined>;
  revalidate?: number;
}

export async function tmdbFetch<T>(
  path: string,
  options: TmdbFetchOptions = {},
): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    throw new Error(
      "TMDB_READ_TOKEN is not set. Add it to .env.local (see .env.example).",
    );
  }

  const url = new URL(TMDB_BASE_URL + path);
  url.searchParams.set("language", options.locale ?? "id-ID");
  url.searchParams.set("include_adult", "false");
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { status_message?: string };
      if (body.status_message) message = body.status_message;
    } catch {
      // body not JSON — keep statusText
    }
    throw new Error(`TMDB ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
}
```

- [ ] **Step 4: Run to confirm pass**

Run:
```bash
npm run test -- src/lib/tmdb/__tests__/client.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tmdb
git commit -m "feat(tmdb): server-only fetch wrapper with bearer auth"
```

---

### Task 8: TMDB getTrending (TDD)

**Files:**
- Create: `src/lib/tmdb/__tests__/movies.test.ts`
- Create: `src/lib/tmdb/movies.ts`

- [ ] **Step 1: Write failing test**

Write to `src/lib/tmdb/__tests__/movies.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("getTrendingMovies", () => {
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

  it("calls /trending/movie/week and returns results", async () => {
    const payload = {
      page: 1,
      results: [
        {
          id: 27205,
          title: "Inception",
          original_title: "Inception",
          overview: "A thief…",
          poster_path: "/poster.jpg",
          backdrop_path: "/backdrop.jpg",
          release_date: "2010-07-16",
          vote_average: 8.3,
          genre_ids: [28, 878],
          adult: false,
          original_language: "en",
          popularity: 100,
          video: false,
          vote_count: 10000,
        },
      ],
      total_pages: 1,
      total_results: 1,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTrendingMovies } = await import("@/lib/tmdb/movies");
    const result = await getTrendingMovies();

    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe("Inception");
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/trending/movie/week");
  });

  it("accepts a locale override", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { getTrendingMovies } = await import("@/lib/tmdb/movies");
    await getTrendingMovies({ locale: "en-US" });

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("language")).toBe("en-US");
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run:
```bash
npm run test -- src/lib/tmdb/__tests__/movies.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/tmdb/movies.ts`**

Write to `src/lib/tmdb/movies.ts`:

```ts
import "server-only";
import { tmdbFetch } from "./client";
import type { TmdbLocale, TmdbMovie, TmdbPaginatedResponse } from "./types";

export interface GetTrendingOptions {
  locale?: TmdbLocale;
}

export function getTrendingMovies(
  options: GetTrendingOptions = {},
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/trending/movie/week", {
    locale: options.locale,
  });
}
```

- [ ] **Step 4: Run to confirm pass**

Run:
```bash
npm run test
```

Expected: all tests pass (4 files, at least 6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/tmdb
git commit -m "feat(tmdb): getTrendingMovies"
```

---

### Task 9: Configure next/image for TMDB CDN

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Update `next.config.ts`**

Write to `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "chore: allow TMDB image domain for next/image"
```

---

### Task 10: Placeholder poster asset

**Files:**
- Create: `public/placeholder-poster.svg`

- [ ] **Step 1: Write SVG**

Write to `public/placeholder-poster.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1f1f1f"/>
      <stop offset="1" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#g)"/>
  <g fill="#2a2a2a">
    <circle cx="150" cy="200" r="40"/>
    <rect x="90" y="260" width="120" height="10" rx="4"/>
    <rect x="110" y="280" width="80" height="8" rx="4"/>
  </g>
</svg>
```

- [ ] **Step 2: Commit**

```bash
git add public/placeholder-poster.svg
git commit -m "feat: add placeholder poster svg"
```

---

### Task 11: MediaCard component (TDD)

**Files:**
- Create: `src/components/media/__tests__/MediaCard.test.tsx`
- Create: `src/components/media/MediaCard.tsx`

- [ ] **Step 1: Write failing test**

Write to `src/components/media/__tests__/MediaCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaCard } from "@/components/media/MediaCard";

describe("MediaCard", () => {
  it("renders title, year, and links to detail page", () => {
    render(
      <MediaCard
        id={27205}
        type="movie"
        title="Inception"
        posterPath="/poster.jpg"
        releaseDate="2010-07-16"
        voteAverage={8.3}
      />,
    );

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
    expect(screen.getByText("8.3")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/movie/27205");
  });

  it("falls back to placeholder when posterPath is null", () => {
    render(
      <MediaCard
        id={1}
        type="movie"
        title="Untitled"
        posterPath={null}
        releaseDate=""
        voteAverage={0}
      />,
    );

    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("placeholder-poster.svg");
  });

  it("links to /tv/:id when type is tv", () => {
    render(
      <MediaCard
        id={1399}
        type="tv"
        title="Game of Thrones"
        posterPath="/got.jpg"
        releaseDate="2011-04-17"
        voteAverage={9}
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/tv/1399");
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run:
```bash
npm run test -- src/components/media/__tests__/MediaCard.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/media/MediaCard.tsx`**

Write to `src/components/media/MediaCard.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

export interface MediaCardProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

export function MediaCard({
  id,
  type,
  title,
  posterPath,
  releaseDate,
  voteAverage,
}: MediaCardProps) {
  const year = releaseDate ? releaseDate.slice(0, 4) : "";
  const rating = voteAverage ? voteAverage.toFixed(1) : "—";
  const src = posterPath ? IMAGE_BASE + posterPath : "/placeholder-poster.svg";

  return (
    <Link
      href={`/${type}/${id}`}
      className="group block w-[160px] shrink-0 md:w-[200px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border transition-transform group-hover:scale-[1.03]">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(min-width: 768px) 200px, 160px"
          className="object-cover"
        />
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-medium text-text">{title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{year}</span>
          <span aria-hidden>•</span>
          <span className="text-primary">{rating}</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run to confirm pass**

Run:
```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/media
git commit -m "feat(ui): MediaCard"
```

---

### Task 12: MediaCardSkeleton

**Files:**
- Create: `src/components/media/MediaCardSkeleton.tsx`

- [ ] **Step 1: Implement**

Write to `src/components/media/MediaCardSkeleton.tsx`:

```tsx
export function MediaCardSkeleton() {
  return (
    <div className="w-[160px] shrink-0 md:w-[200px]">
      <div className="aspect-[2/3] animate-pulse rounded-md bg-surface ring-1 ring-border" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/media/MediaCardSkeleton.tsx
git commit -m "feat(ui): MediaCardSkeleton"
```

---

### Task 13: MediaRow component (TDD)

**Files:**
- Create: `src/components/media/__tests__/MediaRow.test.tsx`
- Create: `src/components/media/MediaRow.tsx`

- [ ] **Step 1: Write failing test**

Write to `src/components/media/__tests__/MediaRow.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaCard } from "@/components/media/MediaCard";

describe("MediaRow", () => {
  it("renders the heading and children", () => {
    render(
      <MediaRow title="Trending Minggu Ini">
        <MediaCard
          id={1}
          type="movie"
          title="Film A"
          posterPath="/a.jpg"
          releaseDate="2024-01-01"
          voteAverage={7}
        />
        <MediaCard
          id={2}
          type="movie"
          title="Film B"
          posterPath="/b.jpg"
          releaseDate="2023-06-01"
          voteAverage={6}
        />
      </MediaRow>,
    );

    expect(
      screen.getByRole("heading", { name: "Trending Minggu Ini" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Film A")).toBeInTheDocument();
    expect(screen.getByText("Film B")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run:
```bash
npm run test -- src/components/media/__tests__/MediaRow.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/media/MediaRow.tsx`**

Write to `src/components/media/MediaRow.tsx`:

```tsx
import type { ReactNode } from "react";

export interface MediaRowProps {
  title: string;
  children: ReactNode;
}

export function MediaRow({ title, children }: MediaRowProps) {
  return (
    <section className="space-y-3">
      <h2 className="px-4 text-lg font-semibold tracking-tight md:px-8 md:text-xl">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 md:gap-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run to confirm pass**

Run:
```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/media
git commit -m "feat(ui): MediaRow"
```

---

### Task 14: Homepage — render trending row

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

Write to `src/app/page.tsx`:

```tsx
import { Suspense } from "react";
import { getTrendingMovies } from "@/lib/tmdb/movies";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaCardSkeleton } from "@/components/media/MediaCardSkeleton";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <main className="min-h-dvh space-y-8 py-6 md:py-10">
      <header className="px-4 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          nontonfilm
        </h1>
        <p className="mt-1 text-sm text-muted">
          Katalog film &amp; serial TV — tonton langsung di browser.
        </p>
      </header>

      <Suspense fallback={<TrendingRowSkeleton />}>
        <TrendingRow />
      </Suspense>
    </main>
  );
}

async function TrendingRow() {
  const { results } = await getTrendingMovies();
  return (
    <MediaRow title="Trending Minggu Ini">
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

function TrendingRowSkeleton() {
  return (
    <MediaRow title="Trending Minggu Ini">
      {Array.from({ length: 8 }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </MediaRow>
  );
}
```

- [ ] **Step 2: Manual verify**

Ensure `.env.local` contains a valid `TMDB_READ_TOKEN`, then run:

```bash
npm run dev
```

Open `http://localhost:3000`. Expected:
- Dark page, "nontonfilm" heading
- "Trending Minggu Ini" row with real movie posters
- Horizontal scroll works
- Clicking a card navigates to `/movie/<id>` (will 404 for now — detail pages are Plan 2 territory)

If TMDB returns an error, read the server log — the wrapper surfaces the TMDB message verbatim.

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: homepage renders trending movies row"
```

---

### Task 15: Full test + build verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run:
```bash
npm run test
```

Expected: all files pass.

- [ ] **Step 2: Run a production build**

Run:
```bash
npm run build
```

Expected: build succeeds. If it fails with a type error about `server-only` in a client component, that's a bug — no client component should import from `@/lib/tmdb/*`. Fix at that boundary.

- [ ] **Step 3: Commit nothing (verification only)**

No commit. If any cleanup was needed to make tests or build pass, commit that as a separate fix.

---

## Plan 1 done when:

- `npm run dev` shows a dark homepage with a "Trending Minggu Ini" row of real TMDB posters
- `npm run test` all pass
- `npm run build` succeeds
- `.env.local` is not committed, `.env.example` is committed
- No `TMDB_READ_TOKEN` string appears in the client bundle (Next.js enforces this because `client.ts` uses `import 'server-only'`)

**Next plan:** Plan 2 — Full Homepage (remaining rows + hero banner) + Detail Pages (movie + TV).
