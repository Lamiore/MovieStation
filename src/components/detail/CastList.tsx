import Image from "next/image";
import type { TmdbCastMember } from "@/lib/tmdb/types";

const PROFILE_BASE = "https://image.tmdb.org/t/p/w185";

export interface CastListProps {
  cast: TmdbCastMember[];
  limit?: number;
}

export function CastList({ cast, limit = 12 }: CastListProps) {
  if (cast.length === 0) return null;
  const shown = cast.slice(0, limit);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {shown.map((person) => (
        <div key={person.credit_id} className="w-[112px] shrink-0">
          <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-border">
            {person.profile_path ? (
              <Image
                src={PROFILE_BASE + person.profile_path}
                alt={person.name}
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                {person.name.charAt(0)}
              </div>
            )}
          </div>
          <p className="mt-2 truncate text-xs font-medium text-text">
            {person.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {person.character}
          </p>
        </div>
      ))}
    </div>
  );
}
