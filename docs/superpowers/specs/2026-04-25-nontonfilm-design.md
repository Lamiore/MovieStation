# nontonfilm — Design Spec

**Date:** 2026-04-25
**Status:** Draft — awaiting user review

## 1. Summary

A client-focused streaming catalog web app that uses the **TMDB API** for all metadata (titles, posters, search, trending, genres, cast, etc.) and **vidking.net** as the embedded video player. No user accounts and no backend database — personal features (watchlist, watch history, language preference) live in `localStorage`.

## 2. Goals & Non-Goals

### Goals
- Browse trending, popular, top-rated movies and TV shows
- Search across movies and TV shows
- View rich detail pages (cast, rating, genres, similar titles)
- Watch content via vidking embed player
- Navigate TV series by season and episode (manual next-episode button)
- Save titles to a personal watchlist and track watch history
- Filter/browse with advanced criteria (genre, year, rating, sort)
- Support Indonesian (default) and English with a UI language toggle
- Filter adult content (TMDB `include_adult=false`)

### Non-Goals (out of scope for v1)
- User authentication / accounts
- Any backend or database
- Production deployment (local development only for now)
- Auto-advance next episode (vidking does not expose video events cross-origin)
- Multiple streaming sources / fallback providers
- Mobile native apps
- SEO optimization beyond Next.js defaults

## 3. Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **i18n:** `next-intl` (locales: `id`, `en`)
- **State:** React Context + `localStorage` (no external state library)
- **Data fetching:** Server Components with Next.js built-in fetch cache; Route Handlers for interactive client fetches (search autocomplete, browse filters)
- **Video player:** `<iframe>` to vidking.net

## 4. Architecture

### Data flow

```
Server Components  ──► TMDB API (Bearer token, server-only)
                    ──► Render HTML + TMDB image CDN URLs

Client Components  ──► Route Handlers (/api/tmdb/*) ──► TMDB API
                    (debounced search, filter changes)

Client Components  ──► localStorage
                    (watchlist, history, language)

Browser <iframe>   ──► vidking.net/embed/...
                    (direct, no server proxy)
```

### Security

- TMDB **Read Access Token (v4)** stored in `.env.local` only
- Read exclusively from Server Components and Route Handlers
- `src/lib/tmdb/client.ts` uses `import 'server-only'` to enforce this at build time
- Token never appears in client bundles

### Vidking integration

Vidking URL format:

```
Movie: https://www.vidking.net/embed/movie/{tmdb_id}
TV:    https://www.vidking.net/embed/tv/{tmdb_id}/{season}/{episode}
```

Iframe attributes:
- `allow="autoplay; fullscreen; picture-in-picture"`
- `allowFullScreen`
- `referrerPolicy="no-referrer"`
- Wrapper uses `aspect-video` to prevent layout shift
- No `sandbox` attribute (needed for stream functionality)

## 5. Routes

| Route | Purpose |
|---|---|
| `/` | Homepage: hero (trending #1) + rows (Trending, Popular Movies, Popular TV, Top Rated, Upcoming, Now Playing) + "Continue Watching" row when history exists |
| `/movie/[id]` | Movie detail: poster, title, year, rating, genres, overview, cast (top 6), trailer, Watch/Watchlist buttons, Similar Movies |
| `/tv/[id]` | TV detail: info + season/episode picker |
| `/watch/movie/[id]` | Movie player page |
| `/watch/tv/[id]/[season]/[episode]` | TV player page with episode list and Next Episode button |
| `/browse` | Browse with filters (genre, year, rating, language, type, sort) — filter state stored in URL query params |
| `/search?q=...` | Multi-search results (movie + tv + person) |
| `/watchlist` | User's saved titles (from localStorage) |
| `/history` | Watch history (from localStorage) |
| `/api/tmdb/search` | Route Handler for autocomplete and search page |
| `/api/tmdb/discover` | Route Handler for browse filter changes |

**Filter state is URL state** on `/browse` and `/search` — back button works, links are shareable.

## 6. Components

### Layout & navigation
- `<SiteHeader>` — logo, search bar with autocomplete dropdown, nav links (Home / Browse / Watchlist / History), language toggle (ID/EN)
- `<SiteFooter>` — disclaimer + TMDB attribution (required by TMDB ToS)

### Media display
- `<MediaCard>` — poster, title, year, rating (used in grids and rows)
- `<MediaRow>` — horizontal scrolling row with category heading (Netflix-style)
- `<MediaGrid>` — responsive grid (2/3/4/6 columns across breakpoints)
- `<HeroBanner>` — full-width backdrop, title, overview, Play / Watchlist buttons

### Detail & player
- `<MovieDetail>` / `<TvDetail>` — full info layout
- `<CastList>` — horizontal scroll with photos
- `<TrailerModal>` — YouTube embed from TMDB `/videos` endpoint
- `<VidkingPlayer>` — iframe wrapper (responsive 16:9, fullscreen enabled)
- `<EpisodeList>` — episodes per season with next-episode button
- `<SeasonSelector>` — dropdown

### Personal features
- `<WatchlistButton>` — toggle save/unsave with toast feedback
- `<ContinueWatchingRow>` — homepage row that appears when history exists

### Feedback & state
- `<MediaCardSkeleton>` / `<HeroSkeleton>` / `<DetailSkeleton>` — loading states
- `<EmptyState>` — for empty watchlist/history/search
- `<ErrorBoundary>` (via `error.tsx`) — TMDB failures and iframe issues

### Filter
- `<FilterBar>` — genre chips, year range, rating slider, sort dropdown (on `/browse`)

## 7. Data Layer

### TMDB module (`src/lib/tmdb/`)

- `client.ts` — fetch wrapper: injects Bearer token + locale + `include_adult=false`, sets Next.js fetch revalidate to 1 hour, handles errors. Uses `import 'server-only'`.
- `types.ts` — TypeScript types for TMDB responses
- `movies.ts` — `getTrending()`, `getPopular()`, `getTopRated()`, `getUpcoming()`, `getNowPlaying()`, `getMovieDetail(id)`, `getSimilar(id)`, `getRecommendations(id)`, `getCredits(id)`, `getVideos(id)`
- `tv.ts` — `getPopularTv()`, `getTopRatedTv()`, `getTvDetail(id)`, `getSeasonDetail(tvId, seasonNumber)`, `getTvCredits(id)`
- `search.ts` — `multiSearch(query)`, `searchMovie(query)`, `searchTv(query)`
- `discover.ts` — `discoverMovies(filters)`, `discoverTv(filters)`
- `genres.ts` — `getMovieGenres()`, `getTvGenres()`

### Route Handlers (`src/app/api/tmdb/`)

Thin wrappers around the TMDB module for client-triggered queries (autocomplete, browse filter changes). They accept query params, call the corresponding TMDB function, and return JSON.

### localStorage schema (`src/lib/storage/`)

```ts
// key: "nonton:watchlist"
type WatchlistItem = {
  id: number
  type: 'movie' | 'tv'
  title: string
  posterPath: string | null
  addedAt: number
}

// key: "nonton:history"
type HistoryItem = {
  id: number
  type: 'movie' | 'tv'
  title: string
  posterPath: string | null
  season?: number
  episode?: number
  progress?: number  // 0..1, only populated if vidking later exposes timing events
  watchedAt: number
}

// key: "nonton:language"
type Language = 'id' | 'en'
```

### Hooks

- `useWatchlist()` — read/add/remove/isInWatchlist. Handles SSR by returning empty state on first render, hydrates in `useEffect`. Syncs across tabs via `storage` event.
- `useHistory()` — append, read, clear. Auto-trims to 100 most recent items on write.
- `useLanguage()` — get/set language. Writes to both localStorage and a cookie so SSR and first client render agree.
- `useDebounce(value, delay)` — generic helper for search.

## 8. UI / UX

### Color palette (dark-first, Netflix-inspired)

```
bg        #0a0a0a
surface   #141414
elevated  #1f1f1f
border    #2a2a2a
text      #f5f5f5
muted     #9ca3af
accent    #e50914   (used sparingly: play button, active state, rating highlight)
```

### Typography (minimalist modern)
- Headings: Inter or Geist, bold, tight letter-spacing
- Body: Inter regular
- Generous whitespace; posters are the visual focus

### Layout principles
- Homepage: 70vh hero → horizontal scroll rows with generous spacing
- Detail: blurred backdrop + center-aligned content (not a data dump)
- Player: minimal chrome, no header/footer for immersion
- Grids: `gap-4` mobile, `gap-6` desktop

### Responsive
- Mobile-first
- Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280
- Touch-friendly horizontal-scroll rows on mobile
- Player always 16:9, fullscreen enabled

### i18n (`next-intl`)

```
messages/id.json   (default)
messages/en.json
```

UI strings via `next-intl`. TMDB requests carry `language=id-ID` or `en-US`. Toggle in header, persisted to localStorage + cookie (so server render matches first client render).

### Micro-interactions
- Hover card: scale 1.05 + shadow (desktop only)
- Skeleton shimmer during loading
- Watchlist button: check icon fade-in + small toast
- Page transitions: subtle fade via Next.js `loading.tsx`

## 9. Error Handling & Edge Cases

### TMDB failures
- Rate limit / timeout → `error.tsx` with retry button
- 404 on movie/TV id → `not-found.tsx`
- Invalid token → log full error on server, show generic "configuration error" on client (no leaks)

### Vidking failures
- Cannot detect iframe-internal errors (cross-origin). Mitigation: "Source not playing?" button below player opens a modal with troubleshooting (refresh, try another browser, disable adblock)
- Title exists on TMDB but not on vidking → user sees vidking's own error page; detail page carries a general availability disclaimer

### localStorage edge cases
- Quota exceeded → auto-trim history to 100 most recent; warn on watchlist
- Private/incognito mode → localStorage non-persistent; one-time dismissable banner
- SSR hydration mismatch → every localStorage read is inside `useEffect` with empty initial state

### Search
- Empty query clears results
- 300ms debounce
- URL-encode queries (non-Latin scripts supported)

### Images
- Null `posterPath` → placeholder SVG (gradient + title)
- TMDB image CDN failure → `next/image` retry + `onError` fallback to placeholder

### Network
- No service worker (out of scope)
- `navigator.onLine` check on critical pages with a "connection lost" banner

### Empty content
- Empty watchlist / history / search → `<EmptyState>` with CTA back to homepage

## 10. File Structure

```
nontonfilm/
├── .env.local                    # TMDB_READ_TOKEN (gitignored)
├── .env.example                  # template without values
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── messages/
│   ├── id.json
│   └── en.json
├── public/
│   └── placeholder-poster.svg
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── loading.tsx
    │   ├── error.tsx
    │   ├── not-found.tsx
    │   ├── movie/[id]/
    │   │   ├── page.tsx
    │   │   └── loading.tsx
    │   ├── tv/[id]/
    │   │   ├── page.tsx
    │   │   └── loading.tsx
    │   ├── watch/
    │   │   ├── movie/[id]/page.tsx
    │   │   └── tv/[id]/[season]/[episode]/page.tsx
    │   ├── browse/page.tsx
    │   ├── search/page.tsx
    │   ├── watchlist/page.tsx
    │   ├── history/page.tsx
    │   └── api/tmdb/
    │       ├── search/route.ts
    │       └── discover/route.ts
    ├── components/
    │   ├── layout/
    │   ├── media/
    │   ├── detail/
    │   ├── player/
    │   ├── personal/
    │   ├── filter/
    │   ├── feedback/
    │   └── ui/                   # shadcn/ui generated
    ├── lib/
    │   ├── tmdb/
    │   ├── storage/
    │   ├── vidking/              # buildEmbedUrl()
    │   └── utils.ts
    ├── hooks/
    │   ├── useWatchlist.ts
    │   ├── useHistory.ts
    │   ├── useLanguage.ts
    │   └── useDebounce.ts
    ├── contexts/
    │   └── PersonalDataProvider.tsx
    └── i18n/
        ├── config.ts
        └── request.ts
```

Files are split so each has a single responsibility; anything trending toward 300+ lines is broken up further.

## 11. Open Questions / Follow-ups

- **Deployment** — local only for v1; revisit Vercel once the app is stable.
- **vidking progress events** — verify whether vidking publishes any `postMessage` events for playback progress. If yes, wire `progress` into `HistoryItem`. If no, leave as "not tracked".
- **Adult content toggle** — currently hard-off. Could become a setting later.
- **Additional pages** — people / actor pages, collections, and "coming soon" are intentionally deferred.
