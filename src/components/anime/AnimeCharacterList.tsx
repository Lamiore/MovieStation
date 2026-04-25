import type { AnilistCharacterEdge } from "@/lib/anilist/types";

export function AnimeCharacterList({ edges }: { edges: AnilistCharacterEdge[] }) {
  if (edges.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight text-text md:text-lg">
        Cast
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {edges.map((edge) => {
          const va = edge.voiceActors[0];
          return (
            <li key={edge.node.id} className="flex items-center gap-3">
              {edge.node.image.medium ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={edge.node.image.medium}
                  alt={edge.node.name.full ?? ""}
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-border"
                />
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">
                  {edge.node.name.full ?? "—"}
                </p>
                {va ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {va.name.full}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
