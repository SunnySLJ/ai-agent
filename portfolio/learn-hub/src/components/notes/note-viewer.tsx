"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type NoteViewerProps = {
  content: string;
  className?: string;
};

export function NoteViewer({ content, className }: NoteViewerProps) {
  return (
    <article
      className={cn(
        "note-viewer space-y-4 text-sm leading-relaxed text-[var(--color-text-secondary)]",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
              {children}
            </h3>
          ),
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5">{children}</ol>
          ),
          code: ({ className: codeClass, children }) => {
            const isBlock = codeClass?.includes("language-");
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-4 font-mono text-xs text-[var(--color-brand-200)]">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-[var(--color-bg-elev)] px-1 py-0.5 font-mono text-xs text-[var(--color-brand-200)]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-4">{children}</pre>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[var(--color-brand-400)] underline-offset-2 hover:underline"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--color-brand-500)] pl-4 text-[var(--color-text-muted)]">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
