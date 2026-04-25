import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/SiteHeader";

describe("SiteHeader", () => {
  it("renders logo link to home and the four nav links", () => {
    render(<SiteHeader />);

    const logo = screen.getByRole("link", { name: /nontonfilm/i });
    expect(logo).toHaveAttribute("href", "/");

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /browse/i })).toHaveAttribute(
      "href",
      "/browse",
    );
    expect(screen.getByRole("link", { name: /watchlist/i })).toHaveAttribute(
      "href",
      "/watchlist",
    );
    expect(screen.getByRole("link", { name: /history/i })).toHaveAttribute(
      "href",
      "/history",
    );
  });

  it("renders a search link to /search", () => {
    render(<SiteHeader />);
    const searchLink = screen.getByRole("link", { name: /search/i });
    expect(searchLink).toHaveAttribute("href", "/search");
  });
});
