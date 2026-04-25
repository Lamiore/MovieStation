import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CastList } from "@/components/detail/CastList";

const SAMPLE = [
  {
    id: 1,
    name: "Leonardo DiCaprio",
    character: "Cobb",
    profile_path: "/leo.jpg",
    order: 0,
    credit_id: "c1",
  },
  {
    id: 2,
    name: "Ellen Page",
    character: "Ariadne",
    profile_path: null,
    order: 1,
    credit_id: "c2",
  },
];

describe("CastList", () => {
  it("renders each cast member's name and character", () => {
    render(<CastList cast={SAMPLE} />);
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    expect(screen.getByText("Cobb")).toBeInTheDocument();
    expect(screen.getByText("Ellen Page")).toBeInTheDocument();
    expect(screen.getByText("Ariadne")).toBeInTheDocument();
  });

  it("renders nothing visible when cast array is empty", () => {
    const { container } = render(<CastList cast={[]} />);
    expect(container.textContent).toBe("");
  });
});
