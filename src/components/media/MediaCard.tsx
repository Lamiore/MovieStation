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
      className="group block w-[160px] shrink-0 md:w-[200px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border transition-transform group-hover:scale-[1.03]">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(min-width: 768px) 200px, 160px"
          className="object-cover"
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
