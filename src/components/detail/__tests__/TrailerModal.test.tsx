import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrailerModal } from "@/components/detail/TrailerModal";
import type { TmdbVideo } from "@/lib/tmdb/types";

const buildVideo = (overrides: Partial<TmdbVideo> = {}): TmdbVideo => ({
  id: "v1",
  key: "YOUTUBE_KEY",
  name: "Official Trailer",
  site: "YouTube",
  type: "Trailer",
  official: true,
  published_at: "2010-05-01",
  iso_639_1: "en",
  iso_3166_1: "US",
  size: 1080,
  ...overrides,
});

describe("TrailerModal", () => {
  it("renders an enabled button when a YouTube trailer exists", () => {
    render(<TrailerModal videos={[buildVideo()]} />);
    const btn = screen.getByRole("button", { name: /putar trailer/i });
    expect(btn).toBeEnabled();
  });

  it("renders a disabled button when no usable video exists", () => {
    render(<TrailerModal videos={[]} />);
    const btn = screen.getByRole("button", { name: /trailer tidak tersedia/i });
    expect(btn).toBeDisabled();
  });

  it("opens a dialog with a YouTube iframe when clicked", async () => {
    render(<TrailerModal videos={[buildVideo()]} />);
    await userEvent.click(screen.getByRole("button", { name: /putar trailer/i }));

    const iframe = await screen.findByTitle(/official trailer/i);
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe.getAttribute("src")).toMatch(/youtube\.com\/embed\/YOUTUBE_KEY/);
  });

  it("falls back to a Teaser when no Trailer is available", () => {
    const teaser = buildVideo({ type: "Teaser", key: "TEASER_KEY", name: "Teaser" });
    render(<TrailerModal videos={[teaser]} />);
    expect(screen.getByRole("button", { name: /putar trailer/i })).toBeEnabled();
  });

  it("ignores non-YouTube videos", () => {
    const vimeo = buildVideo({ site: "Vimeo" });
    render(<TrailerModal videos={[vimeo]} />);
    expect(
      screen.getByRole("button", { name: /trailer tidak tersedia/i }),
    ).toBeDisabled();
  });
});
