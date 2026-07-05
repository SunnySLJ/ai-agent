/** 纯 URL 工具，可在客户端使用 */

export function docPathToHref(relativePath: string): string {
  const segments = relativePath.split("/").map(encodeURIComponent);
  return `/docs/file/${segments.join("/")}`;
}

export function coursePathToHref(relativePath: string): string {
  const cleaned = relativePath
    .replace(/^agent\//, "")
    .replace(/^part(\d+)/, "part$1");
  const segments = cleaned.split("/").filter(Boolean).map(encodeURIComponent);
  return `/course/${segments.join("/")}`;
}
