import Link from "next/link";
import type { AnilistMediaFormat } from "@/lib/anilist/types";

export interface AnimeCardProps {
  id: number;
  title: string;
  coverUrl: string | null;
  format: AnilistMediaFormat | null;
  episodes: number | null;
  averageScore: number | null;
}

function formatBadge(format: AnilistMediaFormat | null): string | null {
  if (!format) return null;
  if (format === "TV" || format === "TV_SHORT") return null;
  if (format === "MOVIE") return "Movie";
  if (format === "SPECIAL") return "Special";
  if (format === "OVA") return "OVA";
  if (format === "ONA") return "ONA";
  return null;
}

export function AnimeCard({
  id,
  title,
  coverUrl,
  format,
  episodes,
  averageScore,
}: AnimeCardProps) {
  const badge = formatBadge(format);
  const isTv = format === "TV" || format === "TV_SHORT";
  const score = averageScore != null ? (averageScore / 10).toFixed(1) : "—";

  return (
    <Link
      href={`/anime/${id}`}
      className="group block w-[160px] shrink-0 md:w-[200px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border transition-transform group-hover:scale-[1.03]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : null}
        {badge ? (
          <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-medium text-text">{title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {isTv && episodes != null ? <span>{episodes} ep</span> : null}
          {isTv && episodes != null ? <span aria-hidden>•</span> : null}
          <span className="text-primary">{score}</span>
        </div>
      </div>
    </Link>
  );
}
