import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroBanner } from "@/components/media/HeroBanner";

describe("HeroBanner", () => {
  it("renders title, overview, and a primary CTA linking to detail", () => {
    render(
      <HeroBanner
        id={27205}
        type="movie"
        title="Inception"
        overview="A thief who steals corporate secrets…"
        backdropPath="/inception-backdrop.jpg"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Inception" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a thief who steals corporate secrets/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tonton/i })).toHaveAttribute(
      "href",
      "/movie/27205",
    );
  });

  it("links to /tv/:id when type is tv", () => {
    render(
      <HeroBanner
        id={1399}
        type="tv"
        title="Game of Thrones"
        overview="Seven noble families…"
        backdropPath="/got-backdrop.jpg"
      />,
    );

    expect(screen.getByRole("link", { name: /tonton/i })).toHaveAttribute(
      "href",
      "/tv/1399",
    );
  });

  it("renders without crashing when backdropPath is null", () => {
    render(
      <HeroBanner
        id={1}
        type="movie"
        title="No Backdrop"
        overview=""
        backdropPath={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "No Backdrop" })).toBeInTheDocument();
  });
});
