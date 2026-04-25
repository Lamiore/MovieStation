"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TmdbVideo } from "@/lib/tmdb/types";

export interface TrailerModalProps {
  videos: TmdbVideo[];
}

function pickTrailer(videos: TmdbVideo[]): TmdbVideo | null {
  const youtube = videos.filter((v) => v.site === "YouTube");
  return (
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    null
  );
}

export function TrailerModal({ videos }: TrailerModalProps) {
  const trailer = useMemo(() => pickTrailer(videos), [videos]);
  const [open, setOpen] = useState(false);

  if (!trailer) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-md bg-elevated/60 px-4 py-2 text-sm font-semibold text-muted-foreground"
      >
        Trailer unavailable
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-elevated px-4 py-2 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-elevated/80"
          >
            <Play className="h-4 w-4" />
            Play Trailer
          </button>
        }
      />
      <DialogContent className="max-w-3xl border-border bg-bg p-0">
        <DialogTitle className="sr-only">{trailer.name}</DialogTitle>
        <div className="aspect-video w-full overflow-hidden rounded-md">
          <iframe
            title={trailer.name}
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
