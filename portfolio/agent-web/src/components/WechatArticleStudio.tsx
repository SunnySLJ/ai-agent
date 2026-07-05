"use client";

import { FormEvent, useMemo, useState } from "react";
import { generateWechatArticle, getApiBaseUrl } from "@/lib/api";
import type { WechatArticle } from "@/lib/types";

export default function WechatArticleStudio() {
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [article, setArticle] = useState<WechatArticle | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview");

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  async function handleGenerate(event: FormEvent) {
    event.preventDefault();
    if (!file || loading) {
      setStatus("请先选择一本 PDF 书籍");
      return;
    }

    setLoading(true);
    setStatus("正在解析书籍并生成公众号文章...");
    setArticle(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (bookTitle.trim()) {
        formData.append("book_title", bookTitle.trim());
      }
      if (author.trim()) {
        formData.append("author", author.trim());
      }

      const result = await generateWechatArticle(formData);
      setArticle(result);
      setStatus(
        `生成完成（${result.generator === "llm" ? "AI 增强" : "离线模板"}，共 ${result.page_count} 页）`,
      );
    } catch (error) {
      setStatus(`生成失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  async function copyText(content: string, label: string) {
    try {
      await navigator.clipboard.writeText(content);
      setStatus(`已复制${label}到剪贴板`);
    } catch {
      setStatus(`复制${label}失败，请手动选择复制`);
    }
  }

  function downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(`已下载 ${filename}`);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <h1>书籍 → 公众号文章</h1>
          <p>
            上传 PDF 书籍，自动提炼全书精髓、生成可直接发布的公众号排版（含书中配图）。
            适合读书复盘、内容创作与学习卡片输出。
          </p>
        </div>
        <div className="status-pill">
          <span className="status-dot ok" />
          API · {apiBase}
        </div>
      </section>

      <section className="layout">
        <div className="stack">
          <section className="panel">
            <div className="panel-header">
              <h2>上传书籍</h2>
            </div>
            <div className="panel-body">
              <form className="stack" onSubmit={handleGenerate}>
                <div className="field">
                  <label htmlFor="book-file">PDF 书籍文件</label>
                  <input
                    id="book-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                  <p className="hint">支持扫描版与文字版 PDF，系统会自动提取正文与配图。</p>
                </div>
                <div className="field">
                  <label htmlFor="book-title">书名（可选）</label>
                  <input
                    id="book-title"
                    value={bookTitle}
                    onChange={(event) => setBookTitle(event.target.value)}
                    placeholder="例如：深度工作"
                  />
                </div>
                <div className="field">
                  <label htmlFor="book-author">作者（可选）</label>
                  <input
                    id="book-author"
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    placeholder="例如：卡尔·纽波特"
                  />
                </div>
                <button className="primary" type="submit" disabled={loading || !file}>
                  {loading ? "生成中..." : "生成公众号文章"}
                </button>
                {status && <p className="hint">{status}</p>}
              </form>
            </div>
          </section>

          {article && (
            <section className="panel">
              <div className="panel-header">
                <h2>发布操作</h2>
                <div className="view-toggle">
                  <button
                    type="button"
                    className={viewMode === "preview" ? "active" : ""}
                    onClick={() => setViewMode("preview")}
                  >
                    预览
                  </button>
                  <button
                    type="button"
                    className={viewMode === "markdown" ? "active" : ""}
                    onClick={() => setViewMode("markdown")}
                  >
                    Markdown
                  </button>
                </div>
              </div>
              <div className="panel-body stack">
                <div className="action-row">
                  <button
                    className="primary"
                    type="button"
                    onClick={() => copyText(article.html, " HTML 正文")}
                  >
                    复制 HTML（公众号）
                  </button>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => copyText(article.markdown, " Markdown")}
                  >
                    复制 Markdown
                  </button>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() =>
                      downloadFile(
                        `${article.title.slice(0, 20)}.html`,
                        article.html,
                        "text/html;charset=utf-8",
                      )
                    }
                  >
                    下载 HTML
                  </button>
                </div>

                {article.publish_tips.map((tip) => (
                  <p key={tip} className="hint">
                    · {tip}
                  </p>
                ))}

                {viewMode === "preview" ? (
                  <article
                    className="article-preview"
                    dangerouslySetInnerHTML={{ __html: article.html }}
                  />
                ) : (
                  <pre className="markdown-preview">{article.markdown}</pre>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="stack">
          {article ? (
            <>
              <section className="panel">
                <div className="panel-header">
                  <h2>全书精髓</h2>
                </div>
                <div className="panel-body stack">
                  <ol className="essence-list">
                    {article.essence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <h2>学以致用</h2>
                </div>
                <div className="panel-body stack">
                  {article.action_items.map((item) => (
                    <article key={item} className="tool-card">
                      <p>{item}</p>
                    </article>
                  ))}
                </div>
              </section>

              {article.images.length > 0 && (
                <section className="panel">
                  <div className="panel-header">
                    <h2>书中配图（{article.images.length}）</h2>
                  </div>
                  <div className="panel-body stack">
                    {article.images.map((image) => (
                      <article key={image.image_id} className="image-card">
                        <img
                          src={`data:${image.mime_type};base64,${image.data_base64}`}
                          alt={`第 ${image.page_number} 页配图`}
                        />
                        <p className="hint">第 {image.page_number} 页</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section className="panel">
              <div className="panel-header">
                <h2>使用说明</h2>
              </div>
              <div className="panel-body stack">
                <p className="hint">1. 上传你想精读的 PDF 书籍。</p>
                <p className="hint">2. 系统提取正文与配图，生成公众号结构文章。</p>
                <p className="hint">3. 右侧「全书精髓」可直接当学习卡片复习。</p>
                <p className="hint">4. 复制 HTML 到公众号编辑器即可发布。</p>
                <p className="hint">
                  配置 OPENAI_API_KEY 后，文章质量会显著提升（AI 增强模式）。
                </p>
              </div>
            </section>
          )}
        </aside>
      </section>
    </main>
  );
}
