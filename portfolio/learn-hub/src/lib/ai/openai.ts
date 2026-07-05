export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
      /\/$/,
      ""
    ),
    model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
  };
}

export async function chatCompletion(
  messages: ChatMessage[]
): Promise<string | null> {
  const config = getOpenAIConfig();
  if (!config) return null;

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    console.warn("OpenAI chat failed:", await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
