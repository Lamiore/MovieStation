import Image from "next/image";
import Link from "next/link";

export interface MediaCardProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

export function MediaCard({
  id,
  type,
  title,
  posterPath,
  releaseDate,
  voteAverage,
}: MediaCardProps) {
  const year = releaseDate ? releaseDate.slice(0, 4) : "";
  const rating = voteAverage ? voteAverage.toFixed(1) : "—";
  const src = posterPath ? IMAGE_BASE + posterPath : "/placeholder-poster.svg";

  return (
    <Link
      href={`/${type}/${id}`}
      className="group block w-[176px] shrink-0 md:w-[232px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border transition duration-300 group-hover:scale-[1.04] group-hover:ring-text/40 group-hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.85)]">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(min-width: 768px) 232px, 176px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-medium text-text">{title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{year}</span>
          <span aria-hidden>•</span>
          <span className="text-primary">{rating}</span>
        </div>
      </div>
    </Link>
  );
}
