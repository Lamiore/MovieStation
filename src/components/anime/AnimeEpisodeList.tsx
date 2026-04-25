import Link from "next/link";

export interface AnimeEpisodeListProps {
  animeId: number;
  totalEpisodes: number;
  currentEpisode?: number;
}

export function AnimeEpisodeList({
  animeId,
  totalEpisodes,
  currentEpisode,
}: AnimeEpisodeListProps) {
  if (totalEpisodes <= 0) return null;
  const eps = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight text-text md:text-lg">
        Episodes
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {eps.map((n) => {
          const active = n === currentEpisode;
          return (
            <Link
              key={n}
              href={`/watch/anime/${animeId}/${n}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-2 py-2 text-center text-sm font-medium ring-1 ${
                active
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-elevated text-text ring-border hover:bg-elevated/80"
              }`}
            >
              {n}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
