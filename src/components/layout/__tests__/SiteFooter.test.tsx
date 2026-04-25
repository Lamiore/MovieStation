import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "@/components/layout/SiteFooter";

describe("SiteFooter", () => {
  it("renders TMDB attribution with a link to themoviedb.org", () => {
    render(<SiteFooter />);
    const link = screen.getByRole("link", { name: /tmdb|themoviedb/i });
    expect(link.getAttribute("href")).toMatch(/themoviedb\.org/);
  });

  it("renders a non-affiliation disclaimer", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText(/tidak berafiliasi|not affiliated/i),
    ).toBeInTheDocument();
  });
});
