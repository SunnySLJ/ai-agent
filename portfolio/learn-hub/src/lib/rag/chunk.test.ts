import { describe, it, expect } from "vitest";
import { chunkMarkdown } from "./chunk";

describe("chunkMarkdown", () => {
  it("splits long markdown into multiple chunks", () => {
    const para = "A".repeat(500);
    const text = `${para}\n\n${para}\n\n${para}`;
    const chunks = chunkMarkdown(text, 800);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 1000)).toBe(true);
  });

  it("keeps short text as a single chunk", () => {
    const text = "# Title\n\nShort paragraph.";
    expect(chunkMarkdown(text)).toEqual([text]);
  });

  it("returns empty array for blank input", () => {
    expect(chunkMarkdown("   \n\n  ")).toEqual([]);
  });
});
