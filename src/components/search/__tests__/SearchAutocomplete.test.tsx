import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";

const sampleResponse = {
  results: [
    {
      id: 27205,
      media_type: "movie" as const,
      title: "Inception",
      release_date: "2010-07-16",
      poster_path: "/p.jpg",
    },
    {
      id: 1399,
      media_type: "tv" as const,
      name: "Game of Thrones",
      first_air_date: "2011-04-17",
      poster_path: "/got.jpg",
    },
  ],
};

describe("SearchAutocomplete", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(sampleResponse), { status: 200 })) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders an input", () => {
    render(<SearchAutocomplete />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("fetches and shows results after typing (debounced)", async () => {
    const user = userEvent.setup();
    render(<SearchAutocomplete />);

    await user.type(screen.getByRole("searchbox"), "inception");

    await waitFor(
      () => {
        expect(screen.getByText("Inception")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(screen.getByText("Game of Thrones")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalled();
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/tmdb/search");
    expect(calledUrl).toContain("q=inception");
  });

  it("does not fetch for empty query", async () => {
    render(<SearchAutocomplete />);
    await new Promise((r) => setTimeout(r, 500));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
