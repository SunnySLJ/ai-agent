import { describe, it, expect } from "vitest";
import { cosineSimilarity, searchChunks } from "./search";

describe("searchChunks", () => {
  it("ranks closer vectors higher", () => {
    const q = [1, 0];
    const results = searchChunks(
      q,
      [
        { id: "a", embedding: [1, 0], content: "match" },
        { id: "b", embedding: [0, 1], content: "miss" },
      ],
      1
    );
    expect(results[0]?.id).toBe("a");
  });

  it("returns cosine similarity of 1 for identical vectors", () => {
    const v = [0.6, 0.8];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
});
