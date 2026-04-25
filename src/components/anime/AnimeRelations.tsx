import { AnimeCard } from "./AnimeCard";
import { MediaRow } from "@/components/media/MediaRow";
import type { AnilistRelationEdge } from "@/lib/anilist/types";

const RELATION_LABELS: Record<string, string> = {
  PREQUEL: "Prequel",
  SEQUEL: "Sequel",
  SIDE_STORY: "Side Story",
  PARENT: "Parent Story",
  ALTERNATIVE: "Alternative",
  SPIN_OFF: "Spin-off",
  ADAPTATION: "Adaptation",
  CHARACTER: "Character",
  SUMMARY: "Summary",
  OTHER: "Other",
};

export function AnimeRelations({ edges }: { edges: AnilistRelationEdge[] }) {
  // Only ANIME nodes (skip manga/light novel)
  const animeEdges = edges.filter(
    (e) => e.node.format !== null && e.node.format !== "MUSIC",
  );
  if (animeEdges.length === 0) return null;

  // Group by relationType
  const groups = new Map<string, AnilistRelationEdge[]>();
  for (const edge of animeEdges) {
    const key = edge.relationType;
    const arr = groups.get(key) ?? [];
    arr.push(edge);
    groups.set(key, arr);
  }

  return (
    <>
      {Array.from(groups.entries()).map(([rel, list]) => (
        <MediaRow key={rel} title={RELATION_LABELS[rel] ?? rel}>
          {list.map((edge) => {
            const t =
              edge.node.title.userPreferred ?? edge.node.title.romaji ?? "—";
            return (
              <AnimeCard
                key={edge.node.id}
                id={edge.node.id}
                title={t}
                coverUrl={edge.node.coverImage.large}
                format={edge.node.format}
                episodes={edge.node.episodes}
                averageScore={edge.node.averageScore}
              />
            );
          })}
        </MediaRow>
      ))}
    </>
  );
}
