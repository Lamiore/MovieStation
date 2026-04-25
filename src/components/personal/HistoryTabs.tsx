"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { HistoryItem } from "@/lib/storage/schema";

const TABS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
  { value: "anime", label: "Anime" },
] as const;
type TabValue = (typeof TABS)[number]["value"];

function entryKey(item: HistoryItem): string {
  if (item.type === "tv") return `tv:${item.id}:${item.season}:${item.episode}`;
  if (item.type === "anime") return `anime:${item.anilistId}:${item.episode}`;
  return `movie:${item.id}`;
}

function entryHref(item: HistoryItem): string {
  if (item.type === "tv") {
    return `/watch/tv/${item.id}/${item.season}/${item.episode}`;
  }
  if (item.type === "anime") {
    return `/watch/anime/${item.anilistId}/${item.episode}`;
  }
  return `/watch/movie/${item.id}`;
}

function entryImage(item: HistoryItem): string | null {
  if (item.type === "anime") return item.coverUrl;
  return item.posterPath
    ? `https://image.tmdb.org/t/p/w342${item.posterPath}`
    : null;
}

export function HistoryTabs({ list }: { list: HistoryItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: TabValue =
    raw === "movie" || raw === "tv" || raw === "anime" ? raw : "all";

  const filtered =
    tab === "all" ? list : list.filter((item) => item.type === tab);

  const setTab = (next: TabValue) => {
    const sp = new URLSearchParams(params.toString());
    if (next === "all") sp.delete("tab");
    else sp.set("tab", next);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <>
      <div role="tablist" aria-label="History filter" className="flex gap-1">
        {TABS.map((t) => {
          const active = t.value === tab;
          return (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-elevated text-muted-foreground ring-1 ring-border hover:text-text"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing here yet for this tab.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => {
            const img = entryImage(item);
            return (
              <li key={entryKey(item)}>
                <Link href={entryHref(item)} className="block w-full">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    {item.type === "anime" ? (
                      <span className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Anime
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-text">
                    {item.title}
                  </p>
                  {item.type === "tv" ? (
                    <p className="text-xs text-muted-foreground">
                      S{item.season} • E{item.episode}
                    </p>
                  ) : item.type === "anime" ? (
                    <p className="text-xs text-muted-foreground">
                      Episode {item.episode}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
