import { NextResponse } from "next/server";
import { multiSearch } from "@/lib/tmdb/search";
import type { TmdbLocale } from "@/lib/tmdb/types";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const locale = (searchParams.get("locale") ?? "id-ID") as TmdbLocale;

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await multiSearch(query, { locale });
    const filtered = data.results.filter(
      (r) => r.media_type === "movie" || r.media_type === "tv",
    );
    return NextResponse.json({ results: filtered });
  } catch (err) {
    const message = err instanceof Error ? err.message : "search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
