import { ChatPanel } from "@/components/chat/chat-panel";

export default function ChatPage() {
  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight">AI 提问</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          基于所有已学笔记的全局 RAG 对话
        </p>
        <div className="mt-8">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
