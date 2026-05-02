"use client";

import { PROVIDERS } from "@/lib/embed/providers";

export interface ProviderToggleProps {
  value: string;
  onChange: (id: string) => void;
}

export function ProviderToggle({ value, onChange }: ProviderToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Server</span>
      <div
        role="radiogroup"
        aria-label="Pilih server"
        className="flex flex-wrap gap-1.5"
      >
        {PROVIDERS.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(p.id)}
              className={
                active
                  ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground ring-1 ring-primary"
                  : "rounded-full bg-elevated px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-elevated/80 hover:text-text"
              }
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
