import Image from "next/image";
import Link from "next/link";

export interface HeroBannerProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  overview: string;
  backdropPath: string | null;
}

const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export function HeroBanner({
  id,
  type,
  title,
  overview,
  backdropPath,
}: HeroBannerProps) {
  const detailHref = `/${type}/${id}`;

  return (
    <section className="relative isolate h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[70vh]">
      {backdropPath ? (
        <Image
          src={BACKDROP_BASE + backdropPath}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/30 to-transparent"
      />

      <div className="relative z-10 flex h-full max-w-screen-2xl flex-col justify-end px-4 pb-8 md:px-8 md:pb-12">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            {title}
          </h2>
          {overview ? (
            <p className="line-clamp-3 text-sm text-text/80 md:text-base">
              {overview}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Tonton
            </Link>
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 rounded-md bg-elevated/80 px-5 py-2.5 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated"
            >
              Tambah ke Watchlist
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
