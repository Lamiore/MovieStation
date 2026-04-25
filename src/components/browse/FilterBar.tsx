"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { TmdbGenre } from "@/lib/tmdb/types";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Paling Populer" },
  { value: "vote_average.desc", label: "Rating Tertinggi" },
  { value: "primary_release_date.desc", label: "Terbaru" },
];

const RATING_OPTIONS = [
  { value: "", label: "Semua rating" },
  { value: "5", label: "≥ 5" },
  { value: "6", label: "≥ 6" },
  { value: "7", label: "≥ 7" },
  { value: "8", label: "≥ 8" },
];

export interface FilterBarProps {
  genres: TmdbGenre[];
}

export function FilterBar({ genres }: FilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type") === "tv" ? "tv" : "movie";
  const selectedGenres = (params.get("genres") ?? "")
    .split(",")
    .filter(Boolean)
    .map(Number);
  const year = params.get("year") ?? "";
  const minRating = params.get("minRating") ?? "";
  const sortBy = params.get("sortBy") ?? "popularity.desc";

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(changes)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      router.replace(`/browse?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const toggleGenre = (id: number) => {
    const next = selectedGenres.includes(id)
      ? selectedGenres.filter((g) => g !== id)
      : [...selectedGenres, id];
    update({ genres: next.length ? next.join(",") : null });
  };

  return (
    <div className="space-y-4 rounded-lg bg-surface/60 p-4 ring-1 ring-border">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-md ring-1 ring-border">
          {(["movie", "tv"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update({ type: t === "movie" ? null : t })}
              className={
                type === t
                  ? "bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "bg-elevated px-3 py-1.5 text-xs font-medium text-text hover:bg-elevated/80"
              }
            >
              {t === "movie" ? "Film" : "Serial"}
            </button>
          ))}
        </div>

        <input
          type="number"
          min={1900}
          max={2100}
          placeholder="Tahun"
          value={year}
          onChange={(e) => update({ year: e.target.value || null })}
          className="w-24 rounded-md bg-elevated px-3 py-1.5 text-xs text-text ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary"
        />

        <select
          value={minRating}
          onChange={(e) => update({ minRating: e.target.value || null })}
          className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text ring-1 ring-border focus:outline-none focus:ring-primary"
        >
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
          className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text ring-1 ring-border focus:outline-none focus:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map((g) => {
          const active = selectedGenres.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGenre(g.id)}
              className={
                active
                  ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                  : "rounded-full bg-elevated px-3 py-1 text-xs font-medium text-text ring-1 ring-border hover:bg-elevated/80"
              }
            >
              {g.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
