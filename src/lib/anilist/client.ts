import "server-only";

const ENDPOINT = "https://graphql.anilist.co";
const DEFAULT_REVALIDATE_SECONDS = 60 * 60; // 1 hour

export interface AnilistFetchOptions {
  revalidate?: number;
}

export async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: AnilistFetchOptions = {},
): Promise<T> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`AniList ${response.status}: ${response.statusText}`);
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(
      `AniList GraphQL: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }

  if (!json.data) {
    throw new Error("AniList: empty data");
  }

  return json.data;
}
