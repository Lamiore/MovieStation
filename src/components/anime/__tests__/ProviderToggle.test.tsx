import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ProviderToggle } from "@/components/anime/ProviderToggle";

describe("ProviderToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to vidsrc when no preference is stored", () => {
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    expect(screen.getByRole("button", { name: /vidsrc/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /videasy/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(onChange).toHaveBeenLastCalledWith("vidsrc");
  });

  it("reads stored preference on mount", () => {
    window.localStorage.setItem("nonton:animeProvider", "videasy");
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    expect(screen.getByRole("button", { name: /videasy/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(onChange).toHaveBeenLastCalledWith("videasy");
  });

  it("ignores invalid stored values and falls back to vidsrc", () => {
    window.localStorage.setItem("nonton:animeProvider", "garbage");
    render(<ProviderToggle onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /vidsrc/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("clicking videasy persists and notifies", () => {
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    act(() => {
      screen.getByRole("button", { name: /videasy/i }).click();
    });
    expect(window.localStorage.getItem("nonton:animeProvider")).toBe("videasy");
    expect(onChange).toHaveBeenLastCalledWith("videasy");
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
});
