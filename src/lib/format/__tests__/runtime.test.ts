import { describe, it, expect } from "vitest";
import { formatRuntime } from "@/lib/format/runtime";

describe("formatRuntime", () => {
  it("returns empty string for null", () => {
    expect(formatRuntime(null)).toBe("");
  });

  it("returns empty string for 0", () => {
    expect(formatRuntime(0)).toBe("");
  });

  it("formats minutes only when under an hour", () => {
    expect(formatRuntime(45)).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatRuntime(125)).toBe("2h 5m");
  });

  it("formats exact hours with 0 minutes", () => {
    expect(formatRuntime(120)).toBe("2h 0m");
  });
});
