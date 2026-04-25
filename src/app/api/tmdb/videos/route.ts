import { NextResponse } from "next/server";
import { getMovieVideos } from "@/lib/tmdb/movies";
import { getTvVideos } from "@/lib/tmdb/tv";
import type { TmdbVideo } from "@/lib/tmdb/types";

function pickTrailerKey(videos: TmdbVideo[]): string | null {
  const youtube = videos.filter((v) => v.site === "YouTube");
  const trailer =
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    null;
  return trailer?.key ?? null;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const idParam = searchParams.get("id");
  const id = Number(idParam);

  if ((type !== "movie" && type !== "tv") || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ key: null }, { status: 400 });
  }

  try {
    const data = type === "movie" ? await getMovieVideos(id) : await getTvVideos(id);
    return NextResponse.json({ key: pickTrailerKey(data.results) });
  } catch {
    return NextResponse.json({ key: null }, { status: 200 });
  }
}
