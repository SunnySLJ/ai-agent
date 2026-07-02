import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "企业知识库 Agent Platform",
  description: "Python Agent/RAG + Java 业务工具 Web 控制台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
