export type Citation = {
  doc_id: string;
  title: string;
  chunk_id: string;
  snippet: string;
  score: number;
};

export type ToolCall = {
  name: string;
  arguments: Record<string, string>;
  result: string;
  success: boolean;
};

export type AgentTrace = {
  question: string;
  retrieved_chunks: Array<{
    chunk_id: string;
    doc_id: string;
    title: string;
    snippet: string;
    score: number;
  }>;
  tool_calls: ToolCall[];
  model_response: string;
  latency_ms: number;
  estimated_tokens: number;
  session_id?: string | null;
  safety_blocked?: boolean;
  approval_required?: boolean;
  approval_id?: string | null;
};

export type AgentResponse = {
  answer: string;
  refused: boolean;
  confidence: number;
  citations: Citation[];
  trace: AgentTrace;
  session_id?: string | null;
  safety_blocked?: boolean;
  approval_required?: boolean;
  approval_id?: string | null;
};

export type EvaluationSummary = {
  total_runs: number;
  refusal_count: number;
  tool_call_count: number;
  tool_success_count: number;
  average_latency_ms: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: {
    refused?: boolean;
    citations?: Citation[];
    toolCalls?: ToolCall[];
    approvalId?: string | null;
    streaming?: boolean;
  };
};
