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

export type WechatArticleImage = {
  image_id: string;
  page_number: number;
  mime_type: string;
  data_base64: string;
  width?: number;
  height?: number;
};

export type WechatArticleSection = {
  heading: string;
  body: string;
  image_id?: string | null;
  quote?: string | null;
};

export type WechatArticle = {
  article_id: string;
  title: string;
  subtitle: string;
  hook: string;
  essence: string[];
  action_items: string[];
  sections: WechatArticleSection[];
  html: string;
  markdown: string;
  images: WechatArticleImage[];
  generator: string;
  page_count: number;
  publish_tips: string[];
};

export type ClaimEvidenceLink = {
  claim_id: string;
  evidence_id: string;
  relation: string;
  alignment_score: number;
  rationale: string;
};

export type VerifiedEvidence = {
  evidence_id: string;
  doc_id: string;
  title: string;
  chunk_id: string;
  snippet: string;
  score: number;
  source_type: string;
};

export type VerifiedClaimResult = {
  claim_id: string;
  text: string;
  source_stage: string;
  status: string;
  confidence: number;
  links: ClaimEvidenceLink[];
  evidences: VerifiedEvidence[];
};

export type VerificationReport = {
  report_id: string;
  source_text: string;
  source_stage: string;
  overall_confidence: number;
  should_refuse: boolean;
  summary: string;
  verify_threshold: number;
  refuse_threshold: number;
  claims: VerifiedClaimResult[];
};

export type ForgeStageMeta = {
  stage_id: string;
  label: string;
  agent: string;
  order: number;
};

export type ForgeStageArtifact = {
  stage_id: string;
  label: string;
  agent: string;
  title: string;
  summary: string;
  markdown: string;
  engine: string;
  status: string;
  verification: VerificationReport | null;
};

export type ProjectForgeRun = {
  run_id: string;
  idea: string;
  overall_status: string;
  current_stage: string;
  deploy_url: string;
  repository: string;
  parent_run_id?: string | null;
  stages: ForgeStageArtifact[];
};

export type ClaimEvidenceLink = {
  claim_id: string;
  evidence_id: string;
  relation: string;
  alignment_score: number;
  rationale: string;
};

export type VerifiedEvidence = {
  evidence_id: string;
  doc_id: string;
  title: string;
  chunk_id: string;
  snippet: string;
  score: number;
  source_type: string;
};

export type VerifiedClaimResult = {
  claim_id: string;
  text: string;
  source_stage: string;
  status: string;
  confidence: number;
  links: ClaimEvidenceLink[];
  evidences: VerifiedEvidence[];
};

export type VerificationReport = {
  report_id: string;
  source_text: string;
  source_stage: string;
  overall_confidence: number;
  should_refuse: boolean;
  summary: string;
  verify_threshold: number;
  refuse_threshold: number;
  claims: VerifiedClaimResult[];
};

export type ForgeStageMeta = {
  stage_id: string;
  label: string;
  agent: string;
  order: number;
};

export type ForgeStageArtifact = {
  stage_id: string;
  label: string;
  agent: string;
  title: string;
  summary: string;
  markdown: string;
  engine: string;
  status: string;
  verification: VerificationReport | null;
};
