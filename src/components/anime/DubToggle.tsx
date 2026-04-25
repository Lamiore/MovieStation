"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nonton:animeDub";

export interface DubToggleProps {
  onChange: (dub: boolean) => void;
}

export function DubToggle({ onChange }: DubToggleProps) {
  const [dub, setDub] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = stored === "1";
    setDub(initial);
    setHydrated(true);
    onChange(initial);
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (next: boolean) => {
    setDub(next);
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    onChange(next);
  };

  // Avoid SSR hydration flash showing wrong pressed state
  const subPressed = hydrated ? !dub : true;
  const dubPressed = hydrated ? dub : false;

  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-elevated p-1 ring-1 ring-border">
      <button
        type="button"
        aria-pressed={subPressed}
        onClick={() => set(false)}
        className={`rounded px-3 py-1 text-xs font-semibold ${
          subPressed
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-text"
        }`}
      >
        Sub
      </button>
      <button
        type="button"
        aria-pressed={dubPressed}
        onClick={() => set(true)}
        className={`rounded px-3 py-1 text-xs font-semibold ${
          dubPressed
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-text"
        }`}
      >
        Dub
      </button>
    </div>
  );
}
