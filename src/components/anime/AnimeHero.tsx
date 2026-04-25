import type { AnilistMediaDetail } from "@/lib/anilist/types";

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<br\s*\/?>(\s|\n)?/gi, "\n").replace(/<[^>]+>/g, "");
}

export function AnimeHero({ anime }: { anime: AnilistMediaDetail }) {
  const title = anime.title.userPreferred ?? anime.title.romaji ?? "Untitled";
  const score = anime.averageScore != null ? (anime.averageScore / 10).toFixed(1) : "—";
  const description = stripHtml(anime.description);

  return (
    <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen">
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-black md:aspect-[16/6]">
        {anime.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={anime.bannerImage}
            alt=""
            className="h-full w-full object-cover opacity-60"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      </div>
      <div className="mx-auto -mt-32 max-w-screen-xl px-4 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {anime.coverImage.large ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anime.coverImage.large}
              alt={title}
              className="h-60 w-40 shrink-0 rounded-md object-cover ring-1 ring-border md:h-72 md:w-48"
            />
          ) : null}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-text md:text-4xl">
              {title}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="text-primary">★ {score}</span>
              {anime.format ? <span>{anime.format}</span> : null}
              {anime.episodes != null ? <span>{anime.episodes} ep</span> : null}
              {anime.status ? <span>{anime.status}</span> : null}
              {anime.seasonYear != null ? (
                <span>
                  {anime.season ?? ""} {anime.seasonYear}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {anime.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-elevated px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border"
                >
                  {g}
                </span>
              ))}
            </div>
            {description ? (
              <p className="max-w-prose whitespace-pre-line text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
