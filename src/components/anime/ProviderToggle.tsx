"use client";

import { useEffect, useState } from "react";
import type { EmbedProvider } from "@/lib/embed/buildEmbedUrl";

const STORAGE_KEY = "nonton:animeProvider";
const DEFAULT_PROVIDER: EmbedProvider = "vidsrc";

const OPTIONS: { value: EmbedProvider; label: string }[] = [
  { value: "vidsrc", label: "Vidsrc" },
  { value: "videasy", label: "Videasy" },
  { value: "2embed", label: "2embed" },
];

function isProvider(value: string | null): value is EmbedProvider {
  return value === "videasy" || value === "vidsrc" || value === "2embed";
}

export interface ProviderToggleProps {
  onChange: (provider: EmbedProvider) => void;
}

export function ProviderToggle({ onChange }: ProviderToggleProps) {
  const [provider, setProvider] = useState<EmbedProvider>(DEFAULT_PROVIDER);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = isProvider(stored) ? stored : DEFAULT_PROVIDER;
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
