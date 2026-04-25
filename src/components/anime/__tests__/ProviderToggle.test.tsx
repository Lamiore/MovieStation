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
    expect(screen.getByRole("button", { name: /vidsrc/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(onChange).toHaveBeenLastCalledWith("videasy");
  });

  it("renders three options when MAL ID is available", () => {
    render(<ProviderToggle onChange={() => {}} hasMalId />);
    expect(screen.getByRole("button", { name: /videasy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /vidsrc/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /vidlink/i })).toBeInTheDocument();
  });

  it("hides vidlink when no MAL ID is available", () => {
    render(<ProviderToggle onChange={() => {}} hasMalId={false} />);
    expect(screen.getByRole("button", { name: /videasy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /vidsrc/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /vidlink/i })).toBeNull();
  });

  it("reads stored preference on mount", () => {
    window.localStorage.setItem("nonton:animeProvider", "vidsrc");
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    expect(screen.getByRole("button", { name: /vidsrc/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(onChange).toHaveBeenLastCalledWith("vidsrc");
  });

  it("falls back to videasy if stored is vidlink but hasMalId is false", () => {
    window.localStorage.setItem("nonton:animeProvider", "vidlink");
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} hasMalId={false} />);
    expect(screen.getByRole("button", { name: /videasy/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(onChange).toHaveBeenLastCalledWith("videasy");
  });

  it("ignores invalid stored values and falls back to videasy", () => {
    window.localStorage.setItem("nonton:animeProvider", "garbage");
    render(<ProviderToggle onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /videasy/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("clicking vidsrc persists and notifies", () => {
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    act(() => {
      screen.getByRole("button", { name: /vidsrc/i }).click();
    });
    expect(window.localStorage.getItem("nonton:animeProvider")).toBe("vidsrc");
    expect(onChange).toHaveBeenLastCalledWith("vidsrc");
  });

  it("clicking vidlink persists and notifies", () => {
    const onChange = vi.fn();
    render(<ProviderToggle onChange={onChange} />);
    act(() => {
      screen.getByRole("button", { name: /vidlink/i }).click();
    });
    expect(window.localStorage.getItem("nonton:animeProvider")).toBe("vidlink");
    expect(onChange).toHaveBeenLastCalledWith("vidlink");
  });
});
