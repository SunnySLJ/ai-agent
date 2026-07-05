import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/nav/app-shell";

export const metadata: Metadata = {
  title: "AI Learn Hub · Python AI Agent 学习台",
  description: "笔记、闪卡、RAG 问答、面试题库与学习路线",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="flex min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
