export type SearchableChunk = {
  id: string;
  content: string;
  embedding: number[];
  note_id?: string;
  note_title?: string;
};

export type SearchResult = SearchableChunk & { score: number };

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function searchChunks(
  queryEmbedding: number[],
  chunks: SearchableChunk[],
  topK = 5
): SearchResult[] {
  return chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
