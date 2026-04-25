"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { WatchlistItem } from "@/lib/storage/schema";
import { MediaCard } from "@/components/media/MediaCard";

const TABS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
  { value: "anime", label: "Anime" },
] as const;
type TabValue = (typeof TABS)[number]["value"];

function entryKey(item: WatchlistItem): string {
  if (item.type === "anime") return `anime:${item.anilistId}`;
  return `${item.type}:${item.id}`;
}

export function WatchlistTabs({ list }: { list: WatchlistItem[] }) {
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
      <div role="tablist" aria-label="Watchlist filter" className="flex gap-1">
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <div key={entryKey(item)} className="w-full">
              {item.type === "anime" ? (
                <Link
                  href={`/anime/${item.anilistId}`}
                  className="block w-full"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border">
                    {item.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <span className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      Anime
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-text">
                    {item.title}
                  </p>
                </Link>
              ) : (
                <MediaCard
                  id={item.id}
                  type={item.type}
                  title={item.title}
                  posterPath={item.posterPath}
                  releaseDate=""
                  voteAverage={0}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
