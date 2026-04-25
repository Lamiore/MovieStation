"use client";

import { useEffect, useState } from "react";
import type { EmbedProvider } from "@/lib/embed/buildEmbedUrl";

const STORAGE_KEY = "nonton:animeProvider";
const DEFAULT_PROVIDER: EmbedProvider = "videasy";

const ALL_OPTIONS: { value: EmbedProvider; label: string }[] = [
  { value: "videasy", label: "Videasy" },
  { value: "vidsrc", label: "Vidsrc" },
  { value: "vidlink", label: "Vidlink" },
];

function isProvider(value: string | null): value is EmbedProvider {
  return value === "videasy" || value === "vidsrc" || value === "vidlink";
}

export interface ProviderToggleProps {
  onChange: (provider: EmbedProvider) => void;
  /** Hide vidlink option when MAL ID isn't available for this anime. */
  hasMalId?: boolean;
}

export function ProviderToggle({ onChange, hasMalId = true }: ProviderToggleProps) {
  const OPTIONS = ALL_OPTIONS.filter(
    (opt) => opt.value !== "vidlink" || hasMalId,
  );
  const [provider, setProvider] = useState<EmbedProvider>(DEFAULT_PROVIDER);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    let initial = isProvider(stored) ? stored : DEFAULT_PROVIDER;
    // If stored preference is vidlink but this anime has no MAL ID, fall back.
    if (initial === "vidlink" && !hasMalId) initial = DEFAULT_PROVIDER;
    setProvider(initial);
    setHydrated(true);
    onChange(initial);
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (next: EmbedProvider) => {
    setProvider(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    onChange(next);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-elevated p-1 ring-1 ring-border">
      {OPTIONS.map((opt) => {
        const pressed = hydrated
          ? provider === opt.value
          : opt.value === DEFAULT_PROVIDER;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => set(opt.value)}
            className={`rounded px-3 py-1 text-xs font-semibold ${
              pressed
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
