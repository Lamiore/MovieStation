"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface MediaCardProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const HOVER_DELAY_MS = 600;

// Module-level cache so re-hovering the same card doesn't refetch.
// Value can be a string (trailer key) or null (we already checked, none).
const trailerCache = new Map<string, string | null>();

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
  const cacheKey = `${type}:${id}`;

  const [hovered, setHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(
    trailerCache.has(cacheKey) ? trailerCache.get(cacheKey) ?? null : null,
  );
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hovered) return;

    if (trailerCache.has(cacheKey)) {
      setTrailerKey(trailerCache.get(cacheKey) ?? null);
      return;
    }

    let cancelled = false;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      fetch(`/api/tmdb/videos?type=${type}&id=${id}`)
        .then((res) => res.json())
        .then((data: { key: string | null }) => {
          if (cancelled) return;
          trailerCache.set(cacheKey, data.key);
          setTrailerKey(data.key);
        })
        .catch(() => {
          if (cancelled) return;
          trailerCache.set(cacheKey, null);
        });
    }, HOVER_DELAY_MS);

    return () => {
      cancelled = true;
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hovered, cacheKey, type, id]);

  const showPreview = hovered && Boolean(trailerKey);

  return (
    <Link
      href={`/${type}/${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

        {showPreview ? (
          <iframe
            key={`preview-${cacheKey}`}
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&loop=1&playlist=${trailerKey}`}
            title=""
            aria-hidden
            tabIndex={-1}
            allow="autoplay; encrypted-media; picture-in-picture"
            className="card-preview pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 border-0"
          />
        ) : null}
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
