import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DubToggle } from "@/components/anime/DubToggle";

describe("DubToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to Sub when no preference is stored", () => {
    render(<DubToggle onChange={() => {}} />);
    const sub = screen.getByRole("button", { name: /^sub$/i });
    const dub = screen.getByRole("button", { name: /^dub$/i });
    expect(sub).toHaveAttribute("aria-pressed", "true");
    expect(dub).toHaveAttribute("aria-pressed", "false");
  });

  it("reads stored preference on mount", () => {
    window.localStorage.setItem("nonton:animeDub", "1");
    render(<DubToggle onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /^dub$/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("clicking Dub persists preference and notifies parent", () => {
    const onChange = vi.fn();
    render(<DubToggle onChange={onChange} />);
    act(() => {
      screen.getByRole("button", { name: /^dub$/i }).click();
    });
    expect(window.localStorage.getItem("nonton:animeDub")).toBe("1");
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("clicking Sub clears the dub preference", () => {
    window.localStorage.setItem("nonton:animeDub", "1");
    const onChange = vi.fn();
    render(<DubToggle onChange={onChange} />);
    act(() => {
      screen.getByRole("button", { name: /^sub$/i }).click();
    });
    expect(window.localStorage.getItem("nonton:animeDub")).toBe("0");
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});
