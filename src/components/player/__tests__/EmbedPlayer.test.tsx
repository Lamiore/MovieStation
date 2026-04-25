import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EmbedPlayer } from "@/components/player/EmbedPlayer";

describe("EmbedPlayer", () => {
  it("renders an iframe with the provided src", () => {
    const { container } = render(
      <EmbedPlayer src="https://player.videasy.net/movie/27205" title="Inception" />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute("src")).toBe(
      "https://player.videasy.net/movie/27205",
    );
  });

  it("sets title (for accessibility), allowFullScreen, and referrer-policy", () => {
    const { container } = render(
      <EmbedPlayer src="https://example/embed/x" title="Some Title" />,
    );
    const iframe = container.querySelector("iframe")!;
    expect(iframe.getAttribute("title")).toBe("Some Title");
    expect(iframe.hasAttribute("allowfullscreen")).toBe(true);
    expect(iframe.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(iframe.getAttribute("allow")).toMatch(/autoplay/);
    expect(iframe.getAttribute("allow")).toMatch(/fullscreen/);
  });
});
