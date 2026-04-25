import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WatchlistButton } from "@/components/detail/WatchlistButton";

const SAMPLE = {
  id: 27205,
  type: "movie" as const,
  title: "Inception",
  posterPath: "/p.jpg",
};

describe("WatchlistButton", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts as 'Tambah ke Watchlist' when nothing in storage", () => {
    render(<WatchlistButton {...SAMPLE} />);
    expect(
      screen.getByRole("button", { name: /tambah ke watchlist/i }),
    ).toBeInTheDocument();
  });

  it("clicking once writes to localStorage and updates label", async () => {
    render(<WatchlistButton {...SAMPLE} />);
    await userEvent.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: /sudah di watchlist/i }),
    ).toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem("nonton:watchlist")!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(27205);
  });

  it("clicking again removes the item", async () => {
    render(<WatchlistButton {...SAMPLE} />);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("button", { name: /tambah ke watchlist/i }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem("nonton:watchlist")).toBe("[]");
  });

  it("reads existing watchlist value on mount", () => {
    window.localStorage.setItem(
      "nonton:watchlist",
      JSON.stringify([{ ...SAMPLE, addedAt: 1 }]),
    );
    render(<WatchlistButton {...SAMPLE} />);
    expect(
      screen.getByRole("button", { name: /sudah di watchlist/i }),
    ).toBeInTheDocument();
  });
});
