import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WatchlistButton } from "@/components/detail/WatchlistButton";

describe("WatchlistButton", () => {
  it("shows 'Tambah ke Watchlist' when not in watchlist", () => {
    render(<WatchlistButton id={1} type="movie" />);
    expect(
      screen.getByRole("button", { name: /tambah ke watchlist/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Sudah di Watchlist' when already in watchlist", () => {
    render(<WatchlistButton id={1} type="movie" isInWatchlist />);
    expect(
      screen.getByRole("button", { name: /sudah di watchlist/i }),
    ).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn();
    render(<WatchlistButton id={42} type="tv" onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("does not crash when onToggle is omitted", async () => {
    render(<WatchlistButton id={1} type="movie" />);
    await userEvent.click(screen.getByRole("button"));
  });
});
