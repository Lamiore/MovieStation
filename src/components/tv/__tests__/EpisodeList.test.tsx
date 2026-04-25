import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EpisodeList } from "@/components/tv/EpisodeList";

const EPISODES = [
  {
    id: 101,
    name: "Winter Is Coming",
    overview: "Lord Eddard…",
    episode_number: 1,
    season_number: 1,
    air_date: "2011-04-17",
    still_path: "/ep1.jpg",
    runtime: 62,
    vote_average: 8.0,
    vote_count: 100,
  },
  {
    id: 102,
    name: "The Kingsroad",
    overview: "An incident on…",
    episode_number: 2,
    season_number: 1,
    air_date: "2011-04-24",
    still_path: null,
    runtime: 56,
    vote_average: 8.1,
    vote_count: 100,
  },
];

describe("EpisodeList", () => {
  it("renders episode number, name, and overview for each episode", () => {
    render(<EpisodeList tvId={1399} season={1} episodes={EPISODES} />);
    expect(screen.getByText("Winter Is Coming")).toBeInTheDocument();
    expect(screen.getByText("The Kingsroad")).toBeInTheDocument();
    expect(screen.getByText(/lord eddard/i)).toBeInTheDocument();
  });

  it("links each episode to /watch/tv/:id/:s/:e", () => {
    render(<EpisodeList tvId={1399} season={1} episodes={EPISODES} />);
    expect(
      screen.getByRole("link", { name: /winter is coming/i }),
    ).toHaveAttribute("href", "/watch/tv/1399/1/1");
    expect(
      screen.getByRole("link", { name: /kingsroad/i }),
    ).toHaveAttribute("href", "/watch/tv/1399/1/2");
  });
});
