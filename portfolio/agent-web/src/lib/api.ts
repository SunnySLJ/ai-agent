import type { AgentResponse, EvaluationSummary } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getApiBaseUrl(): string {
  return API_BASE;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const result = await request<{ status: string }>("/health");
    return result.status === "ok";
  } catch {
    return false;
  }
}

export async function askQuestion(
  question: string,
  sessionId?: string | null,
): Promise<AgentResponse> {
  return request<AgentResponse>("/ask", {
    method: "POST",
    body: JSON.stringify({ question, session_id: sessionId ?? null }),
  });
}

export async function confirmApproval(approvalId: string): Promise<AgentResponse> {
  return request<AgentResponse>(`/approvals/${approvalId}/confirm`, {
    method: "POST",
  });
}

export async function ingestDocument(payload: {
  doc_id: string;
  title: string;
  content: string;
  content_type?: string;
}): Promise<{ accepted: boolean; doc_id: string }> {
  return request("/documents", {
    method: "POST",
    body: JSON.stringify({
      content_type: "text/markdown",
      ...payload,
    }),
  });
}

export async function fetchSummary(): Promise<EvaluationSummary> {
  return request<EvaluationSummary>("/summary");
}

export async function fetchTools(): Promise<string[]> {
  const result = await request<{ tools: string[] }>("/tools");
  return result.tools;
}

export type StreamHandlers = {
  onMeta?: (data: Record<string, unknown>) => void;
  onToken?: (delta: string) => void;
  onDone?: (response: AgentResponse) => void;
  onError?: (error: Error) => void;
};

export async function askQuestionStream(
  question: string,
  sessionId: string | null | undefined,
  handlers: StreamHandlers,
): Promise<void> {
  const response = await fetch(`${API_BASE}/ask/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, session_id: sessionId ?? null }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Stream request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const parseBlock = (block: string) => {
    let eventName = "message";
    let dataLine = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLine = line.slice(5).trim();
      }
    }
    if (!dataLine) {
      return;
    }
    const payload = JSON.parse(dataLine) as Record<string, unknown>;
    if (eventName === "meta") {
      handlers.onMeta?.(payload);
    } else if (eventName === "token") {
      handlers.onToken?.(String(payload.delta ?? ""));
    } else if (eventName === "done") {
      handlers.onDone?.(payload as unknown as AgentResponse);
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        if (part.trim()) {
          parseBlock(part);
        }
      }
    }
    if (buffer.trim()) {
      parseBlock(buffer);
    }
  } catch (error) {
    handlers.onError?.(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
