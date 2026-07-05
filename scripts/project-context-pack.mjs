#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_OUT = ".shuang-skill/project-context.local.json";
const MAX_SNIPPET = 1200;
const MAX_FILE_BYTES = 24 * 1024;
const MAX_SPEC_FILES = 24;

const args = parseArgs(process.argv.slice(2));
const cwd = process.cwd();
const targetRoot = path.resolve(args.target || cwd);
const format = args.format || "json";
const jsonStdout = args.json === "true";
const outPath = args.out ? path.resolve(args.out) : null;

if (args.help === "true") {
  console.log(`Usage:
  node scripts/project-context-pack.mjs [--target <project>] [--out <file>] [--json] [--format json|markdown]

Creates a local project context pack from safe entry files such as README,
AGENTS.md, CLAUDE.md, package manifests, build manifests, and specs. It does
not read .env files, node_modules, .git, build caches, or source trees by
default.`);
  process.exit(0);
}

if (!fs.existsSync(targetRoot) || !fs.statSync(targetRoot).isDirectory()) {
  console.error(`Missing target directory: ${targetRoot}`);
  process.exit(1);
}

if (!["json", "markdown"].includes(format)) {
  console.error(`Unsupported format: ${format}`);
  process.exit(1);
}

const pack = buildContextPack(targetRoot);
const rendered = format === "markdown" ? renderMarkdown(pack) : `${JSON.stringify(pack, null, 2)}\n`;

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered, "utf8");
} else if (!jsonStdout && format === "json") {
  const defaultOut = path.join(targetRoot, DEFAULT_OUT);
  fs.mkdirSync(path.dirname(defaultOut), { recursive: true });
  fs.writeFileSync(defaultOut, rendered, "utf8");
}

if (jsonStdout || format === "markdown" || !outPath) {
  process.stdout.write(rendered);
}

function buildContextPack(root) {
  const files = [];
  addIfExists(files, root, "AGENTS.md", "agent-guidance");
  addIfExists(files, root, "CLAUDE.md", "agent-guidance");
  addIfExists(files, root, "README.md", "readme");
  addIfExists(files, root, "package.json", "package-manifest");
  addIfExists(files, root, "pom.xml", "build-manifest");
  addIfExists(files, root, "build.gradle", "build-manifest");
  addIfExists(files, root, "build.gradle.kts", "build-manifest");
  addIfExists(files, root, "pyproject.toml", "build-manifest");
  addIfExists(files, root, "requirements.txt", "build-manifest");

  for (const spec of listSpecFiles(root).slice(0, MAX_SPEC_FILES)) {
    addFile(files, root, spec, "spec");
  }

  const packageJson = readPackageJson(root);
  const projectName = packageJson?.name || titleFromReadme(files) || path.basename(root);
  const packageManagers = detectPackageManagers(root, packageJson);
  const frameworkSignals = detectFrameworkSignals(root, packageJson, files);
  const suggestedReadOrder = files
    .slice()
    .sort((a, b) => readOrderRank(a) - readOrderRank(b) || a.path.localeCompare(b.path))
    .map((file) => file.path);

  return {
    targetRoot: root,
    generatedAt: new Date().toISOString(),
    projectName,
    packageManagers,
    frameworkSignals,
    suggestedReadOrder,
    files,
    warnings: [],
  };
}

function addIfExists(files, root, rel, type) {
  if (fs.existsSync(path.join(root, rel))) addFile(files, root, rel, type);
}

function addFile(files, root, rel, type) {
  if (isUnsafePath(rel)) return;
  const file = path.join(root, rel);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return;
  const raw = fs.readFileSync(file, "utf8").slice(0, MAX_FILE_BYTES);
  const safe = redact(raw);
  const headings = extractHeadings(safe);
  files.push({
    path: normalizeRel(rel),
    type,
    title: headings[0] || inferTitle(rel, safe),
    headings,
    snippet: safe.trim().slice(0, MAX_SNIPPET),
    bytesRead: Buffer.byteLength(raw, "utf8"),
  });
}

function listSpecFiles(root) {
  const specsRoot = path.join(root, "specs");
  if (!fs.existsSync(specsRoot) || !fs.statSync(specsRoot).isDirectory()) return [];
  const out = [];
  walk(specsRoot, "specs", out);
  return out
    .filter((rel) => rel.endsWith(".md"))
    .sort();
}

function walk(abs, rel, out) {
  for (const entry of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const childRel = path.join(rel, entry.name);
    if (isUnsafePath(childRel)) continue;
    const childAbs = path.join(abs, entry.name);
    if (entry.isDirectory()) {
      walk(childAbs, childRel, out);
    } else if (entry.isFile()) {
      out.push(normalizeRel(childRel));
    }
  }
}

function readPackageJson(root) {
  const file = path.join(root, "package.json");
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function detectPackageManagers(root, packageJson) {
  const managers = [];
  if (fs.existsSync(path.join(root, "pnpm-lock.yaml")) || /^pnpm@/.test(packageJson?.packageManager || "")) managers.push("pnpm");
  if (fs.existsSync(path.join(root, "yarn.lock")) || /^yarn@/.test(packageJson?.packageManager || "")) managers.push("yarn");
  if (fs.existsSync(path.join(root, "package-lock.json")) || packageJson) managers.push("npm");
  if (fs.existsSync(path.join(root, "pom.xml"))) managers.push("maven");
  if (fs.existsSync(path.join(root, "build.gradle")) || fs.existsSync(path.join(root, "build.gradle.kts"))) managers.push("gradle");
  if (fs.existsSync(path.join(root, "pyproject.toml")) || fs.existsSync(path.join(root, "requirements.txt"))) managers.push("python");
  return unique(managers);
}

function detectFrameworkSignals(root, packageJson, files) {
  const deps = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
  };
  const signals = [];
  for (const name of ["next", "react", "vue", "vite", "nuxt", "svelte", "zod", "vitest", "jest", "playwright", "typescript"]) {
    if (deps[name]) signals.push(name);
  }
  if (fs.existsSync(path.join(root, "pom.xml"))) signals.push("maven");
  if (files.some((file) => /spring-boot|springframework/i.test(file.snippet))) signals.push("spring");
  return unique(signals);
}

function extractHeadings(text) {
  return [...text.matchAll(/^#{1,3}\s+(.+)$/gm)]
    .map((match) => match[1].trim())
    .slice(0, 12);
}

function titleFromReadme(files) {
  return files.find((file) => file.path === "README.md")?.headings?.[0] || "";
}

function inferTitle(rel, text) {
  if (rel === "package.json") {
    try {
      return JSON.parse(text).name || "package.json";
    } catch {
      return "package.json";
    }
  }
  return path.basename(rel);
}

function readOrderRank(file) {
  if (file.path === "AGENTS.md") return 0;
  if (file.path === "CLAUDE.md") return 1;
  if (file.path === "README.md") return 2;
  if (file.type === "package-manifest") return 3;
  if (file.type === "build-manifest") return 4;
  if (file.type === "spec") return 5;
  return 9;
}

function renderMarkdown(pack) {
  const lines = [];
  lines.push("# Project Context Pack", "");
  lines.push(`- Target: \`${pack.targetRoot}\``);
  lines.push(`- Project: ${pack.projectName}`);
  lines.push(`- Package managers: ${pack.packageManagers.length ? pack.packageManagers.join(", ") : "none detected"}`);
  lines.push(`- Framework signals: ${pack.frameworkSignals.length ? pack.frameworkSignals.join(", ") : "none detected"}`);
  lines.push("");
  lines.push("## Suggested Read Order", "");
  for (const rel of pack.suggestedReadOrder) lines.push(`- \`${rel}\``);
  lines.push("");
  lines.push("## Files", "");
  for (const file of pack.files) {
    lines.push(`### ${file.path}`, "");
    lines.push(`- Type: ${file.type}`);
    if (file.headings.length) lines.push(`- Headings: ${file.headings.join(" / ")}`);
    if (file.snippet) {
      lines.push("", "```text", file.snippet, "```");
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function isUnsafePath(rel) {
  const normalized = normalizeRel(rel);
  return normalized.split("/").some((part) => [
    ".git",
    ".next",
    "node_modules",
    "dist",
    "build",
    "target",
    ".shuang-skill",
  ].includes(part)) || /^\.env(?:\.|$)/.test(path.basename(normalized));
}

function redact(text) {
  return String(text)
    .replace(/(authorization\s*[:=]\s*)(.+)/gi, "$1<redacted>")
    .replace(/((?:api[_-]?key|secret|token|password)\s*[:=]\s*)([^\s"']+)/gi, "$1<redacted>")
    .replace(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, "<redacted>");
}

function normalizeRel(value) {
  return String(value).replaceAll(path.sep, "/");
}

function unique(items) {
  return [...new Set(items.filter(Boolean))].sort();
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") out.json = "true";
    else if (arg === "--help" || arg === "-h") out.help = "true";
    else if (arg === "--target") out.target = argv[++i];
    else if (arg === "--out") out.out = argv[++i];
    else if (arg === "--format") out.format = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}
