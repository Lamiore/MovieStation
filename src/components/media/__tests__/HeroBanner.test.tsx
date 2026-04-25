import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroBanner, type HeroItem } from "@/components/media/HeroBanner";

const ITEMS: HeroItem[] = [
  {
    id: 27205,
    type: "movie",
    title: "Inception",
    overview: "A thief who steals corporate secrets…",
    backdropPath: "/inception-backdrop.jpg",
  },
  {
    id: 1399,
    type: "tv",
    title: "Game of Thrones",
    overview: "Seven noble families…",
    backdropPath: "/got-backdrop.jpg",
  },
];

describe("HeroBanner", () => {
  it("renders the first item's title and overview by default", () => {
    render(<HeroBanner items={ITEMS} />);
    expect(
      screen.getByRole("heading", { name: "Inception" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a thief who steals corporate secrets/i),
    ).toBeInTheDocument();
  });

  it("links the primary CTA to the current item's detail page", () => {
    render(<HeroBanner items={ITEMS} />);
    const tonton = screen.getByRole("link", { name: /tonton/i });
    expect(tonton).toHaveAttribute("href", "/movie/27205");
  });

  it("renders one slide indicator per item when there are multiple items", () => {
    render(<HeroBanner items={ITEMS} />);
    expect(
      screen.getAllByRole("button", { name: /go to slide/i }),
    ).toHaveLength(2);
  });

  it("clicking a dot switches to that slide and links update", async () => {
    const user = userEvent.setup();
    render(<HeroBanner items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: /go to slide 2/i }));

    expect(
      screen.getByRole("heading", { name: "Game of Thrones" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tonton/i })).toHaveAttribute(
      "href",
      "/tv/1399",
    );
  });

  it("does not render dots when only one item is provided", () => {
    render(<HeroBanner items={[ITEMS[0]]} />);
    expect(
      screen.queryByRole("button", { name: /go to slide/i }),
    ).toBeNull();
  });

  it("renders without crashing when backdropPath is null", () => {
    render(
      <HeroBanner
        items={[
          {
            id: 1,
            type: "movie",
            title: "No Backdrop",
            overview: "",
            backdropPath: null,
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No Backdrop" }),
    ).toBeInTheDocument();
  });

  it("renders nothing when items is empty", () => {
    const { container } = render(<HeroBanner items={[]} />);
    expect(container.textContent).toBe("");
  });
});
