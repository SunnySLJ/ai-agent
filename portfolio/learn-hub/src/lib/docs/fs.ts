import fs from "fs";
import path from "path";
import { getProjectRoot } from "../paths";

/** 允许编辑的项目内路径前缀 */
const EDITABLE_PREFIXES = [
  "docs/",
  "logs/daily/",
  "logs/weekly/",
  "logs/applications/",
  "shuang-plan.md",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
];

export function getAgentRoot(): string {
  return path.resolve(getProjectRoot(), "../../agent");
}

function assertInsideRoot(absPath: string, root: string): string {
  const normalized = path.resolve(absPath);
  const rootResolved = path.resolve(root);
  if (
    normalized !== rootResolved &&
    !normalized.startsWith(rootResolved + path.sep)
  ) {
    throw new Error("Path outside allowed root");
  }
  return normalized;
}

export function resolveProjectFile(relativePath: string): string {
  const cleaned = relativePath.replace(/^\/+/, "").replace(/^work\/ai-agent\//, "");
  const abs = path.resolve(getProjectRoot(), cleaned);
  return assertInsideRoot(abs, getProjectRoot());
}

export function resolveAgentFile(relativePath: string): string {
  const cleaned = relativePath.replace(/^\/+/, "").replace(/^agent\//, "");
  const abs = path.resolve(getAgentRoot(), cleaned);
  return assertInsideRoot(abs, getAgentRoot());
}

export function isEditableProjectPath(relativePath: string): boolean {
  const cleaned = relativePath.replace(/^\/+/, "").replace(/^work\/ai-agent\//, "");
  return EDITABLE_PREFIXES.some(
    (prefix) => cleaned === prefix || cleaned.startsWith(prefix)
  );
}

export function globProjectDoc(pattern: string): string | null {
  const cleaned = pattern.replace(/^work\/ai-agent\//, "");
  const dir = path.dirname(cleaned);
  const base = path.basename(cleaned);
  const absDir = resolveProjectFile(dir === "." ? "" : dir);
  if (!fs.existsSync(absDir)) return null;

  const re = new RegExp(
    "^" + base.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"
  );

  const files = fs
    .readdirSync(absDir)
    .filter((f) => re.test(f) && f.endsWith(".md"))
    .sort();

  return files[0] ? path.join(dir === "." ? "" : dir, files[0]).replace(/^\//, "") : null;
}

export function readProjectFile(relativePath: string): string {
  const abs = resolveProjectFile(relativePath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    throw new Error("File not found");
  }
  return fs.readFileSync(abs, "utf-8");
}

export function writeProjectFile(relativePath: string, content: string): void {
  if (!isEditableProjectPath(relativePath)) {
    throw new Error("Path is not editable");
  }
  const abs = resolveProjectFile(relativePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf-8");
}

export function readAgentFile(relativePath: string): string {
  const result = browseAgentCourse(relativePath);
  if (result.mode === "content") return result.content;
  throw new Error("Path is a directory; use browse mode");
}

export type AgentBrowseEntry = {
  name: string;
  relativePath: string;
  kind: "directory" | "markdown" | "notebook" | "pdf" | "other";
};

export type AgentBrowseResult =
  | {
      mode: "browse";
      path: string;
      entries: AgentBrowseEntry[];
    }
  | {
      mode: "content";
      path: string;
      content: string;
      fileType: "markdown" | "notebook" | "text";
    };

function classifyAgentFile(name: string): AgentBrowseEntry["kind"] {
  const lower = name.toLowerCase();
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".ipynb")) return "notebook";
  if (lower.endsWith(".pdf")) return "pdf";
  return "other";
}

function previewNotebook(absPath: string): string {
  try {
    const raw = fs.readFileSync(absPath, "utf-8");
    const nb = JSON.parse(raw) as {
      cells?: { cell_type?: string; source?: string | string[] }[];
    };
    const markdown = (nb.cells ?? [])
      .filter((c) => c.cell_type === "markdown")
      .map((c) =>
        Array.isArray(c.source) ? c.source.join("") : (c.source ?? "")
      )
      .join("\n\n---\n\n")
      .trim();
    if (markdown) {
      return `${markdown}\n\n---\n\n> 📓 以上为 Notebook 中的 Markdown 单元格预览。完整交互内容请在 Cursor 中打开：\n>\n> \`${absPath}\``;
    }
  } catch {
    /* fall through */
  }
  return `# Jupyter Notebook\n\n请在 Cursor / Jupyter 中打开完整课件：\n\n\`${absPath}\``;
}

function readAgentContentFile(absPath: string, relativePath: string): AgentBrowseResult {
  const lower = absPath.toLowerCase();
  if (lower.endsWith(".ipynb")) {
    return {
      mode: "content",
      path: relativePath,
      content: previewNotebook(absPath),
      fileType: "notebook",
    };
  }
  if (lower.endsWith(".md") || lower.endsWith(".txt")) {
    return {
      mode: "content",
      path: relativePath,
      content: fs.readFileSync(absPath, "utf-8"),
      fileType: lower.endsWith(".md") ? "markdown" : "text",
    };
  }
  if (lower.endsWith(".pdf")) {
    return {
      mode: "content",
      path: relativePath,
      content: `# PDF 课件\n\n浏览器无法直接预览 PDF，请在本地打开：\n\n\`${absPath}\``,
      fileType: "text",
    };
  }
  return {
    mode: "content",
    path: relativePath,
    content: `# ${path.basename(relativePath)}\n\n请在 Cursor 中打开：\n\n\`${absPath}\``,
    fileType: "text",
  };
}

const SKIP_AGENT_NAMES = new Set([
  ".DS_Store",
  "__MACOSX",
  "node_modules",
]);

export function browseAgentCourse(relativePath: string): AgentBrowseResult {
  const cleaned = relativePath.replace(/^agent\//, "").replace(/\/+$/, "");
  const abs = resolveAgentFile(cleaned || ".");

  if (!fs.existsSync(abs)) {
    throw new Error("Course path not found");
  }

  const stat = fs.statSync(abs);
  if (stat.isFile()) {
    return readAgentContentFile(abs, cleaned);
  }

  const entries: AgentBrowseEntry[] = fs
    .readdirSync(abs, { withFileTypes: true })
    .filter(
      (e) =>
        !SKIP_AGENT_NAMES.has(e.name) &&
        !e.name.endsWith(".zip") &&
        !e.name.startsWith(".")
    )
    .map((e) => ({
      name: e.name,
      relativePath: path.join(cleaned, e.name).replace(/\\/g, "/"),
      kind: e.isDirectory() ? "directory" : classifyAgentFile(e.name),
    }))
    .sort((a, b) => {
      if (a.kind === "directory" && b.kind !== "directory") return -1;
      if (b.kind === "directory" && a.kind !== "directory") return 1;
      return a.name.localeCompare(b.name, "zh-CN");
    });

  return { mode: "browse", path: cleaned, entries };
}

/** 把 catalog 里的课程路径解析为 agent 目录下的真实路径 */
export function resolveAgentCoursePath(raw: string): string {
  let input = raw.trim().replace(/^agent\//, "");
  if (!input) return "";

  const segments = input.split("/").filter(Boolean);
  let partKey = segments[0] ?? "";

  if (/^part\d+/i.test(partKey)) {
    try {
      const matchPrefix = partKey.match(/^(part\d+)/i)?.[1] ?? partKey;
      const dirs = fs
        .readdirSync(getAgentRoot())
        .filter((d) => d.toLowerCase().startsWith(matchPrefix.toLowerCase()));
      if (dirs[0]) partKey = dirs[0];
    } catch {
      /* ignore */
    }
  }

  const rest = segments.slice(1);
  if (rest.length === 0) return partKey;

  let currentAbs = path.join(getAgentRoot(), partKey);
  const resolved: string[] = [partKey];

  for (const hint of rest) {
    if (!fs.existsSync(currentAbs)) break;
    const stat = fs.statSync(currentAbs);
    if (!stat.isDirectory()) break;

    const children = fs.readdirSync(currentAbs);
    const hintLower = hint.toLowerCase();
    const match =
      children.find((c) => c === hint) ??
      children.find((c) => c.toLowerCase().startsWith(hintLower)) ??
      children.find((c) => c.toLowerCase().includes(hintLower)) ??
      children.find((c) => {
        const num = hint.match(/\d+/)?.[0];
        return num ? c.includes(num) : false;
      });

    if (!match) {
      resolved.push(hint);
      break;
    }
    resolved.push(match);
    currentAbs = path.join(currentAbs, match);
  }

  return resolved.join("/");
}

export type DocTreeItem = {
  path: string;
  title: string;
  editable: boolean;
};

export function listImportantDocs(): DocTreeItem[] {
  const root = getProjectRoot();
  const items: DocTreeItem[] = [
    { path: "shuang-plan.md", title: "总需求 shuang-plan", editable: true },
    { path: "docs/00-document-index.md", title: "文档索引", editable: true },
    { path: "docs/18-project-first-daily-plan.md", title: "每日学习计划", editable: true },
    { path: "docs/07-source-map.md", title: "课程资料映射", editable: true },
    { path: "docs/21-w1-rag-eval-study-notes.md", title: "W1 学习笔记", editable: true },
    { path: "docs/22-w2-verified-knowledge-study-notes.md", title: "W2 学习笔记", editable: true },
    { path: "docs/20-case11-verified-knowledge-interview-map.md", title: "案例11 面试对照", editable: true },
    { path: "docs/decisions/0002-langgraph.md", title: "ADR LangGraph", editable: true },
    { path: "docs/templates/T05-skills-gap-review.md", title: "技能差距模板", editable: true },
  ];

  return items.filter((item) => {
    try {
      return fs.existsSync(resolveProjectFile(item.path));
    } catch {
      return false;
    }
  });
}
