import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaCard } from "@/components/media/MediaCard";

describe("MediaRow", () => {
  it("renders the heading and children", () => {
    render(
      <MediaRow title="Trending Minggu Ini">
        <MediaCard
          id={1}
          type="movie"
          title="Film A"
          posterPath="/a.jpg"
          releaseDate="2024-01-01"
          voteAverage={7}
        />
        <MediaCard
          id={2}
          type="movie"
          title="Film B"
          posterPath="/b.jpg"
          releaseDate="2023-06-01"
          voteAverage={6}
        />
      </MediaRow>,
    );

    expect(
      screen.getByRole("heading", { name: "Trending Minggu Ini" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Film A")).toBeInTheDocument();
    expect(screen.getByText("Film B")).toBeInTheDocument();
  });
});
