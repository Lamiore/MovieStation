import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeasonSelector } from "@/components/tv/SeasonSelector";

const SEASONS = [
  {
    id: 0,
    air_date: "2010-01-01",
    episode_count: 5,
    name: "Specials",
    overview: "",
    poster_path: null,
    season_number: 0,
    vote_average: 0,
  },
  {
    id: 1,
    air_date: "2011-04-17",
    episode_count: 10,
    name: "Season 1",
    overview: "",
    poster_path: null,
    season_number: 1,
    vote_average: 8.5,
  },
  {
    id: 2,
    air_date: "2012-04-01",
    episode_count: 10,
    name: "Season 2",
    overview: "",
    poster_path: null,
    season_number: 2,
    vote_average: 8.7,
  },
];

describe("SeasonSelector", () => {
  it("renders one button per regular season (skips season 0)", () => {
    render(<SeasonSelector tvId={1399} seasons={SEASONS} currentSeason={1} />);
    expect(screen.getByRole("link", { name: /season 1/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /season 2/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /specials/i })).toBeNull();
  });

  it("links each button to /tv/:id?s=:n", () => {
    render(<SeasonSelector tvId={1399} seasons={SEASONS} currentSeason={1} />);
    expect(screen.getByRole("link", { name: /season 1/i })).toHaveAttribute(
      "href",
      "/tv/1399?s=1",
    );
    expect(screen.getByRole("link", { name: /season 2/i })).toHaveAttribute(
      "href",
      "/tv/1399?s=2",
    );
  });

  it("marks the current season with aria-current=page", () => {
    render(<SeasonSelector tvId={1399} seasons={SEASONS} currentSeason={2} />);
    expect(screen.getByRole("link", { name: /season 2/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /season 1/i })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
