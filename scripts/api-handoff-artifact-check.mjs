#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REQUIRED_DOC_SECTIONS = [
  "联调摘要",
  "接口清单",
  "代码顺序",
  "请求字段",
  "响应字段",
  "风险",
  "验证记录",
];

const HIDDEN_PATH_PATTERN = /\/(?:internal|callback|notify|job|scheduler|task|debug)(?:\/|$)|\/admin\/debug(?:\/|$)/i;
const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);

const args = parseArgs(process.argv.slice(2));

if (args.help === "true" || !args.doc || !args.openapi) {
  console.log(`Usage:
  node scripts/api-handoff-artifact-check.mjs --doc <handoff.md> --openapi <openapi.json> [--json]

Checks an API handoff package before frontend integration delivery. It verifies
required handoff sections, Mermaid diagrams, final code line references,
OpenAPI 3 JSON structure, frontend-only paths, field descriptions, and examples.`);
  process.exit(args.doc && args.openapi ? 0 : 1);
}

const root = process.cwd();
const docPath = path.resolve(args.doc);
const openapiPath = path.resolve(args.openapi);
const report = {
  status: "pass",
  docPath,
  openapiPath,
  blockers: [],
  warnings: [],
  doc: {},
  openapi: {},
};

checkDoc(docPath, report);
checkOpenapi(openapiPath, report);

report.status = report.blockers.length ? "fail" : "pass";

if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.blockers.length ? 1 : 0);

function checkDoc(file, out) {
  if (!fs.existsSync(file)) {
    out.blockers.push(`missing doc: ${path.relative(root, file)}`);
    return;
  }

  const text = fs.readFileSync(file, "utf8");
  const sectionPresence = Object.fromEntries(
    REQUIRED_DOC_SECTIONS.map((section) => [section, new RegExp(`^##\\s+.*${escapeRegExp(section)}`, "m").test(text)])
  );
  const missingSections = Object.entries(sectionPresence)
    .filter(([, present]) => !present)
    .map(([section]) => section);
  for (const section of missingSections) {
    out.blockers.push(`doc missing required section: ${section}`);
  }

  const hasFlowchart = /```mermaid[\s\S]*?flowchart\s+TD/i.test(text);
  const hasSequenceDiagram = /```mermaid[\s\S]*?sequenceDiagram/i.test(text);
  const hasLineReferences = /[A-Za-z_$][\w$<>]*\s*:\s*\d+/.test(text);
  const hasRequestFieldTable = sectionHasTableColumns(text, "请求字段", ["字段", "类型", "是否必填"]);
  const hasResponseFieldTable = sectionHasTableColumns(text, "响应字段", ["字段", "类型"]);

  if (!hasFlowchart) out.blockers.push("doc missing Mermaid flowchart TD");
  if (!hasSequenceDiagram) out.blockers.push("doc missing Mermaid sequenceDiagram");
  if (!hasLineReferences) out.blockers.push("doc missing real code line references");
  if (!hasRequestFieldTable) out.blockers.push("doc missing request field table columns");
  if (!hasResponseFieldTable) out.blockers.push("doc missing response field table columns");

  out.doc = {
    sectionPresence,
    hasFlowchart,
    hasSequenceDiagram,
    hasLineReferences,
    hasRequestFieldTable,
    hasResponseFieldTable,
  };
}

function checkOpenapi(file, out) {
  if (!fs.existsSync(file)) {
    out.blockers.push(`missing openapi: ${path.relative(root, file)}`);
    return;
  }

  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    out.blockers.push(`openapi JSON parse failed: ${error.message}`);
    return;
  }

  if (!/^3\.0\./.test(String(spec.openapi || ""))) {
    out.blockers.push("openapi must be 3.0.x");
  }
  if (!spec.info?.title) out.blockers.push("openapi info.title missing");
  if (!spec.info?.version) out.blockers.push("openapi info.version missing");
  if (!Array.isArray(spec.servers) || !spec.servers.length) {
    out.warnings.push("openapi servers missing; use a test base URL or documented placeholder");
  }

  const paths = spec.paths && typeof spec.paths === "object" ? spec.paths : {};
  const pathEntries = Object.entries(paths);
  if (!pathEntries.length) out.blockers.push("openapi paths missing");

  let operationCount = 0;
  for (const [route, routeItem] of pathEntries) {
    if (HIDDEN_PATH_PATTERN.test(route) && !routeItem?.["x-frontend-facing"]) {
      out.blockers.push(`openapi contains hidden/internal path: ${route}`);
    }
    for (const [method, operation] of Object.entries(routeItem || {})) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue;
      operationCount += 1;
      checkOperation(route, method.toUpperCase(), operation, out);
    }
  }
  if (!operationCount) out.blockers.push("openapi has no HTTP operations");

  const schemas = spec.components?.schemas && typeof spec.components.schemas === "object"
    ? spec.components.schemas
    : {};
  if (!Object.keys(schemas).length) {
    out.blockers.push("openapi components.schemas missing");
  }
  for (const [schemaName, schema] of Object.entries(schemas)) {
    checkSchemaDescriptions(schemaName, schema, out);
  }

  out.openapi = {
    version: spec.openapi || "",
    pathCount: pathEntries.length,
    operationCount,
    schemaCount: Object.keys(schemas).length,
  };
}

function checkOperation(route, method, operation, out) {
  if (!operation?.summary && !operation?.description) {
    out.blockers.push(`operation ${method} ${route} missing summary`);
  }
  if (!operation?.responses || !Object.keys(operation.responses).length) {
    out.blockers.push(`operation ${method} ${route} responses missing`);
  }

  const requestContent = operation?.requestBody?.content || {};
  for (const [mediaType, media] of Object.entries(requestContent)) {
    if (!isJsonMedia(mediaType)) continue;
    if (!hasExample(media)) {
      out.blockers.push(`operation ${method} ${route} requestBody missing example`);
    }
  }

  for (const [statusCode, response] of Object.entries(operation?.responses || {})) {
    const responseContent = response?.content || {};
    for (const [mediaType, media] of Object.entries(responseContent)) {
      if (!isJsonMedia(mediaType)) continue;
      if (!hasExample(media)) {
        out.blockers.push(`operation ${method} ${route} response ${statusCode} missing example`);
      }
    }
  }
}

function checkSchemaDescriptions(schemaName, schema, out) {
  if (!schema || typeof schema !== "object") return;
  const properties = schema.properties && typeof schema.properties === "object" ? schema.properties : {};
  for (const [propertyName, property] of Object.entries(properties)) {
    const propertyPath = `${schemaName}.${propertyName}`;
    if (property && typeof property === "object" && property.$ref) continue;
    if (!property?.description) {
      out.blockers.push(`schema ${propertyPath} missing description`);
    }
    if (property?.properties) {
      checkSchemaDescriptions(propertyPath, property, out);
    }
    if (property?.items && !property.items.$ref && property.items.properties) {
      checkSchemaDescriptions(`${propertyPath}[]`, property.items, out);
    }
  }
}

function sectionHasTableColumns(text, sectionKeyword, requiredColumns) {
  const section = extractSection(text, sectionKeyword);
  if (!section) return false;
  const tableHeader = section
    .split(/\r?\n/)
    .find((line) => /^\|.*\|$/.test(line) && requiredColumns.every((column) => line.includes(column)));
  return Boolean(tableHeader);
}

function extractSection(text, keyword) {
  const pattern = new RegExp(`^##\\s+.*${escapeRegExp(keyword)}.*$`, "m");
  const match = text.match(pattern);
  if (!match) return "";
  const start = match.index + match[0].length;
  const next = text.slice(start).search(/^##\s+/m);
  return next === -1 ? text.slice(start) : text.slice(start, start + next);
}

function hasExample(media) {
  return media && (
    Object.prototype.hasOwnProperty.call(media, "example") ||
    Object.prototype.hasOwnProperty.call(media, "examples") ||
    Object.prototype.hasOwnProperty.call(media.schema || {}, "example")
  );
}

function isJsonMedia(mediaType) {
  return /json/i.test(mediaType);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printMarkdown(out) {
  console.log("# API Handoff Artifact Check");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Doc: \`${path.relative(root, out.docPath)}\``);
  console.log(`- OpenAPI: \`${path.relative(root, out.openapiPath)}\``);
  console.log("");
  console.log("## Blockers");
  console.log("");
  if (out.blockers.length) {
    for (const blocker of out.blockers) console.log(`- ${blocker}`);
  } else {
    console.log("- none");
  }
  console.log("");
  console.log("## Warnings");
  console.log("");
  if (out.warnings.length) {
    for (const warning of out.warnings) console.log(`- ${warning}`);
  } else {
    console.log("- none");
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
