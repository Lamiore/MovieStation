import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaCard } from "@/components/media/MediaCard";

describe("MediaCard", () => {
  it("renders title, year, and links to detail page", () => {
    render(
      <MediaCard
        id={27205}
        type="movie"
        title="Inception"
        posterPath="/poster.jpg"
        releaseDate="2010-07-16"
        voteAverage={8.3}
      />,
    );

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
    expect(screen.getByText("8.3")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/movie/27205");
  });

  it("falls back to placeholder when posterPath is null", () => {
    render(
      <MediaCard
        id={1}
        type="movie"
        title="Untitled"
        posterPath={null}
        releaseDate=""
        voteAverage={0}
      />,
    );

    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("placeholder-poster.svg");
  });

  it("links to /tv/:id when type is tv", () => {
    render(
      <MediaCard
        id={1399}
        type="tv"
        title="Game of Thrones"
        posterPath="/got.jpg"
        releaseDate="2011-04-17"
        voteAverage={9}
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/tv/1399");
  });
});
