#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_REGISTRY = ".shuang-skill/course-sources.local.json";
const DEFAULT_OUT_DIR = ".shuang-skill/extracts.local";
const DEFAULT_MAX_DEPTH = 4;
const DEFAULT_TEXT_LIMIT = 60;

const SKIP_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "target",
  "__pycache__",
  ".venv",
  ".tmp-pdf-venv",
]);

const SKIP_EXTS = new Set([
  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".7z",
  ".dmg",
  ".safetensors",
  ".ckpt",
  ".pt",
  ".pth",
  ".onnx",
  ".gguf",
  ".bin",
  ".mp4",
  ".mov",
  ".m4v",
  ".avi",
]);

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const SENSITIVE_PATTERNS = [
  /\b(?:api[_-]?key|secret|token|password|passwd|authorization)\b\s*[:=]\s*(?:Bearer\s+)?["']?[^"'\s,;]+["']?/gi,
  /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi,
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
];

const args = parseArgs(process.argv.slice(2));

if (args.help === "true") {
  console.log(`Usage:
  node scripts/course-local-extract.mjs [--sources <id,id>] [--registry <file>] [--out <dir>] [--max-depth 4]

Creates local-only extracts under:
  ${DEFAULT_OUT_DIR}

The output is ignored by git and is intended as private material for later evolution notes.`);
  process.exit(0);
}

const root = process.cwd();
const registryPath = resolvePath(args.registry || DEFAULT_REGISTRY);
const outDir = resolvePath(args.out || DEFAULT_OUT_DIR);
const maxDepth = Number(args["max-depth"] || DEFAULT_MAX_DEPTH);
const textLimit = Number(args["text-limit"] || DEFAULT_TEXT_LIMIT);

if (!fs.existsSync(registryPath)) {
  fail(`Missing registry: ${path.relative(root, registryPath)}. Create it from docs/skill-evolution/course-source-registry.example.json.`);
}

const registry = readJson(registryPath);
const allSources = Array.isArray(registry) ? registry : registry.sources;
if (!Array.isArray(allSources)) fail("Registry must be an array or { sources: [...] }.");

const wanted = new Set(splitList(args.sources));
const selected = wanted.size
  ? allSources.filter((source) => wanted.has(source.id))
  : allSources;

for (const id of wanted) {
  if (!allSources.some((source) => source.id === id)) fail(`Unknown source id: ${id}`);
}

fs.mkdirSync(outDir, { recursive: true });

const results = [];
for (const source of selected) {
  const extract = extractSource(source);
  const file = path.join(outDir, `${source.id}.json`);
  fs.writeFileSync(file, `${JSON.stringify(extract, null, 2)}\n`, "utf8");
  results.push({
    id: source.id,
    title: source.title,
    output: path.relative(root, file),
    files: extract.stats.files,
    skipped: extract.stats.skipped,
    pdfPending: extract.pendingPdf.length,
    imagePending: extract.pendingImages.length,
    textSignals: extract.textSignals.length,
    topicCandidates: extract.topicCandidates.length,
  });
}

writeIndex(results);
console.log(JSON.stringify({
  outDir: path.relative(root, outDir),
  sources: results.length,
  files: results.reduce((sum, item) => sum + item.files, 0),
  skipped: results.reduce((sum, item) => sum + item.skipped, 0),
  pdfPending: results.reduce((sum, item) => sum + item.pdfPending, 0),
  imagePending: results.reduce((sum, item) => sum + item.imagePending, 0),
  textSignals: results.reduce((sum, item) => sum + item.textSignals, 0),
}, null, 2));

function extractSource(source) {
  const sourceRoot = source.path;
  const extract = {
    generatedAt: new Date().toISOString(),
    source: {
      id: source.id,
      title: source.title,
      targetSkills: source.targetSkills || [],
      notes: source.notes || "",
      pathRedacted: true,
      exists: fs.existsSync(sourceRoot),
    },
    policy: {
      localOnly: true,
      outputMustNotBeCommitted: true,
      rawTextLimit: textLimit,
      pdfTextExtracted: false,
      imageOcrExtracted: false,
      sensitiveTextRedacted: true,
    },
    stats: {
      files: 0,
      directories: 0,
      skipped: 0,
      errors: 0,
    },
    textSignals: [],
    pendingPdf: [],
    pendingImages: [],
    skippedLargeOrBinary: [],
    topicCandidates: [],
    errors: [],
  };

  if (!extract.source.exists) return extract;
  walk(sourceRoot, sourceRoot, 0, extract);
  extract.topicCandidates = buildTopicCandidates(extract);
  return extract;
}

function walk(sourceRoot, current, depth, extract) {
  if (depth > maxDepth) return;
  let stat;
  try {
    stat = fs.statSync(current);
  } catch (error) {
    addError(extract, current, sourceRoot, error);
    return;
  }

  if (stat.isDirectory()) {
    if (SKIP_DIRS.has(path.basename(current))) {
      extract.stats.skipped += 1;
      return;
    }
    extract.stats.directories += 1;
    let entries;
    try {
      entries = fs.readdirSync(current);
    } catch (error) {
      addError(extract, current, sourceRoot, error);
      return;
    }
    for (const entry of entries) {
      walk(sourceRoot, path.join(current, entry), depth + 1, extract);
    }
    return;
  }

  if (!stat.isFile()) return;
  extract.stats.files += 1;
  const rel = path.relative(sourceRoot, current);
  const ext = path.extname(current).toLowerCase();

  if (shouldSkipFile(current, stat.size)) {
    extract.stats.skipped += 1;
    if (extract.skippedLargeOrBinary.length < 80) {
      extract.skippedLargeOrBinary.push({
        file: rel,
        ext: ext || "<no-ext>",
        bytes: stat.size,
        reason: SKIP_EXTS.has(ext) ? "binary/archive/model" : "too-large",
      });
    }
    return;
  }

  try {
    if (ext === ".md" || ext === ".txt") collectTextFile(current, rel, extract);
    else if (ext === ".ipynb") collectNotebook(current, rel, extract);
    else if (ext === ".excalidraw") collectExcalidraw(current, rel, extract);
    else if (ext === ".json") collectJsonSignals(current, rel, extract);
    else if (ext === ".pdf") collectPendingPdf(current, rel, stat, extract);
    else if (IMAGE_EXTS.has(ext)) collectPendingImage(current, rel, stat, extract);
  } catch (error) {
    addError(extract, current, sourceRoot, error);
  }
}

function shouldSkipFile(file, size) {
  const ext = path.extname(file).toLowerCase();
  if (SKIP_EXTS.has(ext)) return true;
  if (size > 5 * 1024 * 1024 && ext !== ".pdf") return true;
  return false;
}

function collectTextFile(file, rel, extract) {
  const text = fs.readFileSync(file, "utf8");
  const headings = text
    .split(/\r?\n/)
    .filter((line) => /^#{1,4}\s+/.test(line))
    .map((line) => clean(line.replace(/^#{1,4}\s+/, "")))
    .filter(Boolean)
    .slice(0, 10);
  addTextSignal(extract, {
    file: rel,
    type: "text",
    headings,
    snippets: shortNonHeadingLines(text).slice(0, 8),
  });
}

function collectNotebook(file, rel, extract) {
  const data = readJson(file);
  const headings = [];
  const snippets = [];
  for (const cell of data.cells || []) {
    if (cell.cell_type !== "markdown") continue;
    const source = Array.isArray(cell.source) ? cell.source.join("") : String(cell.source || "");
    for (const line of source.split(/\r?\n/)) {
      if (/^#{1,4}\s+/.test(line)) headings.push(clean(line.replace(/^#{1,4}\s+/, "")));
      else if (snippets.length < 8) {
        const item = clean(line);
        if (item) snippets.push(item);
      }
      if (headings.length >= 10 && snippets.length >= 8) break;
    }
    if (headings.length >= 10 && snippets.length >= 8) break;
  }
  addTextSignal(extract, {
    file: rel,
    type: "notebook-markdown",
    headings: headings.slice(0, 10),
    snippets,
  });
}

function collectExcalidraw(file, rel, extract) {
  const data = readJson(file);
  const texts = [];
  for (const element of data.elements || []) {
    if (element.type !== "text" || !element.text) continue;
    const item = clean(String(element.text).replace(/\n/g, " / "));
    if (item) texts.push(item);
    if (texts.length >= 12) break;
  }
  addTextSignal(extract, {
    file: rel,
    type: "excalidraw",
    headings: [],
    snippets: texts,
  });
}

function collectJsonSignals(file, rel, extract) {
  if (!/package\.json$|manifest|skills|config/i.test(rel)) return;
  const data = readJson(file);
  const snippets = [];
  if (data.name) snippets.push(`name: ${data.name}`);
  if (data.description) snippets.push(`description: ${data.description}`);
  if (data.scripts) snippets.push(`scripts: ${Object.keys(data.scripts).slice(0, 12).join(", ")}`);
  addTextSignal(extract, {
    file: rel,
    type: "json-metadata",
    headings: [],
    snippets: snippets.map(clean).filter(Boolean),
  });
}

function collectPendingPdf(_file, rel, stat, extract) {
  if (extract.pendingPdf.length >= 120) return;
  extract.pendingPdf.push({
    file: rel,
    bytes: stat.size,
    status: "pending-text-extractor",
    note: "No PDF text is stored in this extract. Use an approved local OCR/PDF extractor to create a private summary.",
  });
}

function collectPendingImage(file, rel, stat, extract) {
  if (extract.pendingImages.length >= 120) return;
  extract.pendingImages.push({
    file: rel,
    bytes: stat.size,
    dimensions: getImageDimensions(file),
    status: "pending-ocr",
    note: "No OCR text is stored in this extract.",
  });
}

function addTextSignal(extract, signal) {
  if (!signal.headings.length && !signal.snippets.length) return;
  if (extract.textSignals.length >= textLimit) return;
  extract.textSignals.push({
    file: signal.file,
    type: signal.type,
    headings: signal.headings.map(clean).filter(Boolean).slice(0, 10),
    snippets: signal.snippets.map(clean).filter(Boolean).slice(0, 10),
  });
}

function shortNonHeadingLines(text) {
  return text
    .split(/\r?\n/)
    .map(clean)
    .filter((line) => line && !line.startsWith("#") && line.length >= 12)
    .slice(0, 20);
}

function buildTopicCandidates(extract) {
  const joined = extract.textSignals
    .flatMap((signal) => [...signal.headings, ...signal.snippets])
    .join(" ")
    .toLowerCase();
  const candidates = [];
  const rules = [
    ["skill-protocol", ["skill", "skills", "技能", "skILL".toLowerCase()]],
    ["harness-stage-gates", ["harness", "stage", "阶段", "phase"]],
    ["file-first-memory", ["memory", "记忆", "agents.md", "user.md", "soul.md"]],
    ["agent-workbench-boundaries", ["claude", "权限", "hooks", "plugin", "工具"]],
    ["ocr-ingestion-safety", ["ocr", "pdf", "图片", "png", "模型"]],
    ["spec-kit-handoff", ["spec", "plan", "tasks", "constitution"]],
  ];
  for (const [topic, words] of rules) {
    const score = words.reduce((sum, word) => sum + countOccurrences(joined, word), 0);
    if (score || (topic === "ocr-ingestion-safety" && (extract.pendingPdf.length || extract.pendingImages.length))) {
      candidates.push({ topic, score: score || extract.pendingPdf.length + extract.pendingImages.length });
    }
  }
  return candidates.sort((a, b) => b.score - a.score).slice(0, 8);
}

function getImageDimensions(file) {
  const ext = path.extname(file).toLowerCase();
  const buffer = fs.readFileSync(file);
  if (ext === ".png" && buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if ((ext === ".jpg" || ext === ".jpeg") && buffer.length > 4) {
    for (let offset = 2; offset + 9 < buffer.length;) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      offset += 2 + length;
    }
  }
  return null;
}

function writeIndex(results) {
  const lines = [
    "# Local Course Extract Index",
    "",
    "This file is generated under `.shuang-skill/` and must not be committed.",
    "",
    "| source | output | text signals | pdf pending | image pending | topics |",
    "|---|---|---:|---:|---:|---|",
  ];
  for (const result of results) {
    lines.push(`| \`${result.id}\` | \`${result.output}\` | ${result.textSignals} | ${result.pdfPending} | ${result.imagePending} | ${result.topicCandidates} |`);
  }
  fs.writeFileSync(path.join(outDir, "index.local.md"), `${lines.join("\n")}\n`, "utf8");
}

function clean(value) {
  return redactSensitive(String(value || ""))
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 240);
}

function redactSensitive(value) {
  let output = value;
  for (const pattern of SENSITIVE_PATTERNS) {
    output = output.replace(pattern, (match) => {
      if (/^Bearer\s/i.test(match)) return "Bearer <redacted>";
      const key = match.split(/[:=]/)[0]?.trim();
      if (key && key.length < match.length) return `${key}=<redacted>`;
      return "<redacted>";
    });
  }
  return output;
}

function countOccurrences(text, word) {
  if (!word) return 0;
  return text.split(word.toLowerCase()).length - 1;
}

function addError(extract, file, sourceRoot, error) {
  extract.stats.errors += 1;
  if (extract.errors.length < 80) {
    extract.errors.push({
      file: path.relative(sourceRoot, file),
      error: error.message,
    });
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    out[key.slice(2)] = value;
  }
  return out;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function resolvePath(value) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
