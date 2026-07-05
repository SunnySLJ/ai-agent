import crypto from "crypto";

const EMBEDDING_SIZE = 64;

function tokenize(text: string): string[] {
  const ascii = text.toLowerCase().match(/[a-z][a-z0-9+-]*|[A-Z]{2,}/g) ?? [];
  const cjk = [...text].filter((c) => "\u4e00" <= c && c <= "\u9fff");
  return [...ascii, ...cjk];
}

export function hashEmbed(text: string, size = EMBEDDING_SIZE): number[] {
  const vector = new Array<number>(size).fill(0);
  for (const token of tokenize(text)) {
    const digest = crypto.createHash("sha256").update(token).digest();
    const index = digest.readUInt32BE(0) % size;
    const sign = digest[4]! % 2 === 0 ? 1 : -1;
    vector[index]! += sign;
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vector;
  return vector.map((v) => v / norm);
}

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
      /\/$/,
      ""
    ),
    model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  };
}

let embeddingApiDisabled = false;

export async function embedText(text: string): Promise<number[]> {
  const config = getOpenAIConfig();
  if (!config || embeddingApiDisabled) return hashEmbed(text);

  try {
    const res = await fetch(`${config.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ model: config.model, input: text }),
    });

    if (!res.ok) {
      embeddingApiDisabled = true;
      return hashEmbed(text);
    }

    const data = (await res.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };
    const embedding = data.data?.[0]?.embedding;
    if (!embedding?.length) return hashEmbed(text);
    return embedding;
  } catch (err) {
    console.warn("OpenAI embedding error, using hash fallback:", err);
    return hashEmbed(text);
  }
}

export function parseEmbedding(stored: string | null): number[] | null {
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as number[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
