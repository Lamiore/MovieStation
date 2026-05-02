import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProviderToggle } from "@/components/player/ProviderToggle";

describe("ProviderToggle", () => {
  it("renders all four provider pills with their labels", () => {
    render(<ProviderToggle value="videasy" onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "Videasy" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "VidSrc" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Vidlink" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "2embed" })).toBeInTheDocument();
  });

  it("marks the selected pill aria-checked=true and others false", () => {
    render(<ProviderToggle value="vidsrc" onChange={() => {}} />);
    expect(
      screen.getByRole("radio", { name: "VidSrc" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("radio", { name: "Videasy" }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("groups pills under an aria-labeled radiogroup", () => {
    render(<ProviderToggle value="videasy" onChange={() => {}} />);
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-label")).toBe("Pilih server");
  });

  it("calls onChange with the clicked provider id", async () => {
    const onChange = vi.fn();
    render(<ProviderToggle value="videasy" onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "VidSrc" }));
    expect(onChange).toHaveBeenCalledWith("vidsrc");
  });

  it("renders a visible 'Server' label", () => {
    render(<ProviderToggle value="videasy" onChange={() => {}} />);
    expect(screen.getByText("Server")).toBeInTheDocument();
  });
});
