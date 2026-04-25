import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ProviderToggle } from "@/components/anime/ProviderToggle";

describe("ProviderToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to videasy when no preference is stored", () => {
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    expect(screen.getByRole("button", { name: /videasy/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /2embed/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(onChange).toHaveBeenLastCalledWith("videasy");
  });

  it("reads stored preference on mount", () => {
    window.localStorage.setItem("nonton:animeProvider", "2embed");
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    expect(screen.getByRole("button", { name: /2embed/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(onChange).toHaveBeenLastCalledWith("2embed");
  });

  it("ignores invalid stored values and falls back to videasy", () => {
    window.localStorage.setItem("nonton:animeProvider", "garbage");
    render(<ProviderToggle onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /videasy/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("clicking 2embed persists and notifies", () => {
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    act(() => {
      screen.getByRole("button", { name: /2embed/i }).click();
    });
    expect(window.localStorage.getItem("nonton:animeProvider")).toBe("2embed");
    expect(onChange).toHaveBeenLastCalledWith("2embed");
  });

  it("clicking videasy persists and notifies", () => {
    window.localStorage.setItem("nonton:animeProvider", "2embed");
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    act(() => {
      screen.getByRole("button", { name: /videasy/i }).click();
    });
    expect(window.localStorage.getItem("nonton:animeProvider")).toBe("videasy");
    expect(onChange).toHaveBeenLastCalledWith("videasy");
  });
});
