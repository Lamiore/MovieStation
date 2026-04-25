"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus } from "lucide-react";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
const AUTO_ADVANCE_MS = 7000;

export interface HeroItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  overview: string;
  backdropPath: string | null;
}

export interface HeroBannerProps {
  items: HeroItem[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const id = window.setInterval(advance, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, advance, items.length]);

  if (items.length === 0) return null;
  const current = items[index];
  const detailHref = `/${current.type}/${current.id}`;
  const titleChars = Array.from(current.title);

  return (
    <section
      className="relative isolate h-[60vh] min-h-[460px] w-full overflow-hidden md:h-[78vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Trending"
    >
      {/* Stacked backdrops, cross-fade. Active one runs Ken Burns. */}
      {items.map((item, i) => {
        const active = i === index;
        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              active ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!active}
          >
            {item.backdropPath ? (
              <div
                key={`${item.id}-${active ? "on" : "off"}`}
                className={active ? "absolute inset-0 hero-zoom" : "absolute inset-0"}
              >
                <Image
                  src={BACKDROP_BASE + item.backdropPath}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-surface" />
            )}
          </div>
        );
      })}

      {/* Gradient overlays */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/30 to-transparent"
      />

      {/* Foreground — keyed to current.id so animations re-fire on change */}
      <div className="relative z-10 mx-auto flex h-full max-w-screen-2xl flex-col justify-end px-4 pb-20 md:px-8 md:pb-24">
        <div key={current.id} className="max-w-2xl">
          <h2
            aria-label={current.title}
            className="text-3xl font-bold tracking-tight md:text-6xl"
          >
            {titleChars.map((ch, i) => (
              <span
                key={i}
                aria-hidden
                className="hero-letter"
                style={{ animationDelay: `${i * 28}ms` }}
              >
                {ch === " " ? " " : ch}
              </span>
            ))}
          </h2>

          {current.overview ? (
            <p
              className="hero-fade-up mt-4 line-clamp-3 max-w-xl text-sm text-text/85 md:text-base"
              style={{ animationDelay: "400ms" }}
            >
              {current.overview}
            </p>
          ) : null}

          <div
            className="hero-fade-up mt-6 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "550ms" }}
          >
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Play className="h-4 w-4 fill-current" />
              Tonton
            </Link>
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 rounded-md bg-elevated/80 px-5 py-2.5 text-sm font-semibold text-text ring-1 ring-border backdrop-blur transition-colors hover:bg-elevated"
            >
              <Plus className="h-4 w-4" />
              Watchlist
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicators + progress bar */}
      {items.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 md:bottom-8">
          <div className="flex items-center gap-2">
            {items.map((item, i) => {
              const active = i === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className={`relative h-1.5 overflow-hidden rounded-full transition-all ${
                    active
                      ? "w-10 bg-text/25"
                      : "w-3 bg-text/30 hover:bg-text/50"
                  }`}
                >
                  {active && !paused ? (
                    <span
                      key={`progress-${index}`}
                      className="hero-progress absolute inset-0 block bg-primary"
                      style={{ "--hero-duration": `${AUTO_ADVANCE_MS}ms` } as React.CSSProperties}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
