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
