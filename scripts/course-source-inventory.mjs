#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_REGISTRY = '.shuang-skill/course-sources.local.json';
const DEFAULT_OUT = '.shuang-skill/course-source-inventory.local.json';
const SKIP_DIRS = new Set([
  '.git',
  '.next',
  'node_modules',
  'dist',
  'build',
  'target',
  '__pycache__',
  '.venv',
  '.tmp-pdf-venv',
]);

const SENSITIVE_PATTERNS = [
  /\b(?:api[_-]?key|secret|token|password|passwd|authorization)\b\s*[:=]\s*(?:Bearer\s+)?["']?[^"'\s,;]+["']?/gi,
  /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi,
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
];

function parseArgs(argv) {
  const args = {
    registry: DEFAULT_REGISTRY,
    out: DEFAULT_OUT,
    maxDepth: 4,
    sampleLimit: 12,
    json: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--registry') args.registry = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--max-depth') args.maxDepth = Number(argv[++i]);
    else if (arg === '--sample-limit') args.sampleLimit = Number(argv[++i]);
    else if (arg === '--json') args.json = true;
    else if (arg === '--help') {
      console.log(`Usage:
  node scripts/course-source-inventory.mjs [--registry <file>] [--out <file>] [--json]

The registry is local-only by default:
  ${DEFAULT_REGISTRY}

Expected registry shape:
[
  {
    "id": "agent-skills-quickstart",
    "title": "Agent Skills 快速入门",
    "path": "/absolute/source/path",
    "targetSkills": ["shuang-skill-rules", "shuang-evolve"],
    "notes": "Only derive workflow rules; do not copy source material."
  }
]`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function safeReadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function trimText(value, max = 180) {
  return redactSensitive(String(value || ''))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function redactSensitive(value) {
  let output = value;
  for (const pattern of SENSITIVE_PATTERNS) {
    output = output.replace(pattern, (match) => {
      if (/^Bearer\s/i.test(match)) return 'Bearer <redacted>';
      const key = match.split(/[:=]/)[0]?.trim();
      if (key && key.length < match.length) return `${key}=<redacted>`;
      return '<redacted>';
    });
  }
  return output;
}

function addExt(summary, fileName) {
  const ext = path.extname(fileName).toLowerCase() || '<no-ext>';
  summary.extensions[ext] = (summary.extensions[ext] || 0) + 1;
}

function collectMarkdownHeadings(file, summary, limit) {
  if (summary.markdownHeadings.length >= limit) return;
  const text = fs.readFileSync(file, 'utf8');
  const headings = text
    .split(/\r?\n/)
    .filter((line) => /^#{1,3}\s+/.test(line))
    .map((line) => trimText(line.replace(/^#{1,3}\s+/, '')))
    .filter(Boolean)
    .slice(0, 8);
  if (headings.length) {
    summary.markdownHeadings.push({
      file: path.basename(file),
      headings,
    });
  }
}

function collectNotebookHeadings(file, summary, limit) {
  if (summary.notebookHeadings.length >= limit) return;
  const data = safeReadJson(file);
  const headings = [];
  for (const cell of data.cells || []) {
    if (cell.cell_type !== 'markdown') continue;
    const source = Array.isArray(cell.source) ? cell.source.join('') : String(cell.source || '');
    for (const line of source.split(/\r?\n/)) {
      if (/^#{1,3}\s+/.test(line)) headings.push(trimText(line.replace(/^#{1,3}\s+/, '')));
      if (headings.length >= 8) break;
    }
    if (headings.length >= 8) break;
  }
  if (headings.length) {
    summary.notebookHeadings.push({
      file: path.basename(file),
      headings,
    });
  }
}

function collectExcalidrawText(file, summary, limit) {
  if (summary.excalidrawTexts.length >= limit) return;
  const data = safeReadJson(file);
  const texts = [];
  for (const element of data.elements || []) {
    if (element.type === 'text' && element.text) {
      const text = trimText(element.text.replace(/\n/g, ' / '));
      if (text) texts.push(text);
    }
    if (texts.length >= 8) break;
  }
  if (texts.length) {
    summary.excalidrawTexts.push({
      file: path.basename(file),
      texts,
    });
  }
}

function walk(root, entry, args, depth, summary) {
  if (depth > args.maxDepth) return;
  let stat;
  try {
    stat = fs.statSync(entry);
  } catch (error) {
    summary.errors.push({ path: entry, error: error.message });
    return;
  }

  if (stat.isDirectory()) {
    if (SKIP_DIRS.has(path.basename(entry))) return;
    summary.dirCount += 1;
    let children;
    try {
      children = fs.readdirSync(entry);
    } catch (error) {
      summary.errors.push({ path: entry, error: error.message });
      return;
    }
    for (const child of children) {
      walk(root, path.join(entry, child), args, depth + 1, summary);
    }
    return;
  }

  if (!stat.isFile()) return;
  summary.fileCount += 1;
  summary.totalBytes += stat.size;
  addExt(summary, entry);

  const rel = path.relative(root, entry);
  if (summary.samples.length < args.sampleLimit) {
    summary.samples.push(rel);
  }

  const ext = path.extname(entry).toLowerCase();
  try {
    if (ext === '.md') collectMarkdownHeadings(entry, summary, args.sampleLimit);
    if (ext === '.ipynb') collectNotebookHeadings(entry, summary, args.sampleLimit);
    if (ext === '.excalidraw') collectExcalidrawText(entry, summary, args.sampleLimit);
    if (ext === '.pdf' && summary.pdfFiles.length < args.sampleLimit) {
      summary.pdfFiles.push({ file: rel, bytes: stat.size });
    }
  } catch (error) {
    summary.errors.push({ path: rel, error: error.message });
  }
}

function summarizeSource(source, args) {
  const root = source.path;
  const summary = {
    id: source.id,
    title: source.title,
    path: root,
    targetSkills: source.targetSkills || [],
    notes: source.notes || '',
    exists: fs.existsSync(root),
    fileCount: 0,
    dirCount: 0,
    totalBytes: 0,
    extensions: {},
    samples: [],
    markdownHeadings: [],
    notebookHeadings: [],
    excalidrawTexts: [],
    pdfFiles: [],
    errors: [],
  };
  if (!summary.exists) return summary;
  walk(root, root, args, 0, summary);
  summary.topExtensions = Object.entries(summary.extensions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ext, count]) => ({ ext, count }));
  delete summary.extensions;
  return summary;
}

function main() {
  const args = parseArgs(process.argv);
  if (!fs.existsSync(args.registry)) {
    console.error(`Missing registry: ${args.registry}`);
    console.error('Create it from docs/skill-evolution/course-source-registry.example.json or run with --registry <file>.');
    process.exit(1);
  }
  const registry = safeReadJson(args.registry);
  const sources = Array.isArray(registry) ? registry : registry.sources;
  if (!Array.isArray(sources)) throw new Error('Registry must be an array or { "sources": [...] }.');

  const inventory = {
    generatedAt: new Date().toISOString(),
    registry: args.registry,
    maxDepth: args.maxDepth,
    sources: sources.map((source) => summarizeSource(source, args)),
  };

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${JSON.stringify(inventory, null, 2)}\n`);
  if (args.json) {
    console.log(JSON.stringify(inventory, null, 2));
  } else {
    console.log(`Wrote ${args.out}`);
    console.log(JSON.stringify({
      sources: inventory.sources.length,
      missing: inventory.sources.filter((source) => !source.exists).length,
      errors: inventory.sources.reduce((sum, source) => sum + source.errors.length, 0),
    }, null, 2));
  }
}

main();
