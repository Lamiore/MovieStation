import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WatchPlayer } from "@/components/player/WatchPlayer";

function getIframeSrc(): string {
  const iframe = document.querySelector("iframe");
  if (!iframe) throw new Error("iframe not found");
  return iframe.getAttribute("src") ?? "";
}

describe("WatchPlayer", () => {
  it("renders the Videasy iframe by default for a movie", () => {
    render(<WatchPlayer type="movie" id={27205} title="Inception" />);
    expect(getIframeSrc()).toBe(
      "https://player.videasy.net/movie/27205?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("renders the Videasy iframe by default for a TV episode", () => {
    render(
      <WatchPlayer
        type="tv"
        id={1399}
        season={1}
        episode={1}
        title="GoT S1E1"
      />,
    );
    expect(getIframeSrc()).toBe(
      "https://player.videasy.net/tv/1399/1/1?color=e50914&nextEpisode=true&episodeSelector=true",
    );
  });

  it("switches the iframe src when a different provider is selected", async () => {
    render(<WatchPlayer type="movie" id={27205} title="Inception" />);
    await userEvent.click(screen.getByRole("radio", { name: "VidSrc" }));
    expect(getIframeSrc()).toBe("https://vidsrc.xyz/embed/movie/27205");
  });

  it("passes title through to the iframe", () => {
    render(<WatchPlayer type="movie" id={27205} title="Inception (2010)" />);
    const iframe = document.querySelector("iframe")!;
    expect(iframe.getAttribute("title")).toBe("Inception (2010)");
  });
});
