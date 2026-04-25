import Image from "next/image";
import type { ReactNode } from "react";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export interface DetailHeroProps {
  title: string;
  tagline?: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  metaItems: string[];
  actions: ReactNode;
}

export function DetailHero({
  title,
  tagline,
  overview,
  posterPath,
  backdropPath,
  metaItems,
  actions,
}: DetailHeroProps) {
  return (
    <section className="relative isolate w-full overflow-hidden">
      {backdropPath ? (
        <Image
          src={BACKDROP_BASE + backdropPath}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/40"
      />

      <div className="relative z-10 mx-auto max-w-screen-2xl px-4 py-10 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-[200px_1fr] md:gap-10 lg:grid-cols-[260px_1fr]">
          <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-full">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface ring-1 ring-border">
              {posterPath ? (
                <Image
                  src={POSTER_BASE + posterPath}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 260px, (min-width: 768px) 200px, 192px"
                  className="object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {title}
              </h1>
              {tagline ? (
                <p className="text-sm italic text-muted-foreground md:text-base">
                  {tagline}
                </p>
              ) : null}
            </div>

            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {metaItems.filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  {i > 0 ? <span aria-hidden>•</span> : null}
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {overview ? (
              <p className="max-w-3xl text-sm leading-relaxed text-text/90 md:text-base">
                {overview}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
