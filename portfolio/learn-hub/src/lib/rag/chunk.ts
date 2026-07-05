export function chunkMarkdown(text: string, maxChars = 800): string[] {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let buf = "";

  for (const p of paragraphs) {
    if ((buf + "\n\n" + p).length > maxChars && buf) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
  }

  if (buf) chunks.push(buf);
  return chunks.length > 0 ? chunks : text.trim() ? [text.trim()] : [];
}
