"use client";

import Link from "next/link";
import Image from "next/image";
import { useHistory } from "@/hooks/useHistory";
import { MediaRow } from "@/components/media/MediaRow";
import type { HistoryItem } from "@/lib/storage/schema";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

function entryHref(item: HistoryItem): string {
  if (item.type === "tv") {
    return `/watch/tv/${item.id}/${item.season}/${item.episode}`;
  }
  if (item.type === "anime") {
    return `/watch/anime/${item.anilistId}/${item.episode}`;
  }
  return `/watch/movie/${item.id}`;
}

function entryKey(item: HistoryItem): string {
  if (item.type === "tv") return `tv:${item.id}:${item.season}:${item.episode}`;
  if (item.type === "anime") return `anime:${item.anilistId}:${item.episode}`;
  return `movie:${item.id}`;
}

function entryImageSrc(item: HistoryItem): string | null {
  if (item.type === "anime") return item.coverUrl;
  return item.posterPath ? POSTER_BASE + item.posterPath : null;
}

export function ContinueWatchingRow() {
  const { list } = useHistory();
  const recent = list.slice(0, 12);
  if (recent.length === 0) return null;

  return (
    <MediaRow title="Continue Watching">
      {recent.map((item) => {
        const src = entryImageSrc(item);
        return (
          <Link
            key={entryKey(item)}
            href={entryHref(item)}
            className="group block w-[160px] shrink-0 md:w-[200px]"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border transition-transform group-hover:scale-[1.03]">
              {src ? (
                <Image
                  src={src}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 200px, 160px"
                  className="object-cover"
                  unoptimized={item.type === "anime"}
                />
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
        );
      })}
    </MediaRow>
  );
}
