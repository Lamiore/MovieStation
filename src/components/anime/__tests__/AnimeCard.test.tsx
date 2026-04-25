import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimeCard } from "@/components/anime/AnimeCard";

describe("AnimeCard", () => {
  it("renders title and links to /anime/[id]", () => {
    render(
      <AnimeCard
        id={21}
        title="One Piece"
        coverUrl="https://example/p.jpg"
        format="TV"
        episodes={1100}
        averageScore={88}
      />,
    );
    const link = screen.getByRole("link", { name: /one piece/i });
    expect(link).toHaveAttribute("href", "/anime/21");
  });

  it("shows episode count badge for TV format", () => {
    render(
      <AnimeCard
        id={1}
        title="X"
        coverUrl={null}
        format="TV"
        episodes={12}
        averageScore={null}
      />,
    );
    expect(screen.getByText(/12 ep/i)).toBeInTheDocument();
  });

  it("shows MOVIE badge for movie format and hides episode count", () => {
    render(
      <AnimeCard
        id={1}
        title="X"
        coverUrl={null}
        format="MOVIE"
        episodes={1}
        averageScore={null}
      />,
    );
    expect(screen.getByText(/movie/i)).toBeInTheDocument();
    expect(screen.queryByText(/1 ep/i)).not.toBeInTheDocument();
  });

  it("renders a fallback when coverUrl is null", () => {
    const { container } = render(
      <AnimeCard
        id={1}
        title="X"
        coverUrl={null}
        format="TV"
        episodes={null}
        averageScore={null}
      />,
    );
    // No img tag means we used the placeholder div
    expect(container.querySelector("img")).toBeNull();
  });
});
