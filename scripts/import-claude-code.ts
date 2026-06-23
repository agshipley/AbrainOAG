// import-claude-code.ts — Source B importer: Claude Code JSONL sessions → 01-sessions/
// Zero LLM calls, zero cost. Idempotent (keyed by sessionId).
//
// Usage:
//   node --experimental-strip-types scripts/import-claude-code.ts [--one] [--dry-run]
//
//   --one      Import only the first session found (verify before full run)
//   --dry-run  Log what would happen; write nothing

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContentBlock {
  type: "text" | "thinking" | "tool_use" | "tool_result" | string;
  text?: string;
  thinking?: string;
}

interface ApiMessage {
  role: "user" | "assistant";
  content: ContentBlock[] | string;
}

interface JsonlRecord {
  type: string;
  sessionId?: string;
  uuid?: string;
  timestamp?: string;
  cwd?: string;
  isSidechain?: boolean;
  // user/assistant
  message?: ApiMessage;
  // ai-title
  aiTitle?: string;
  // last-prompt
  lastPrompt?: string;
  // system
  subtype?: string;
}

interface SessionData {
  sessionId: string;
  cwd: string;
  title: string;
  firstTimestamp: string;
  lastTimestamp: string;
  turns: { role: "user" | "assistant"; text: string }[];
}

// ── Paths ─────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const VAULT_ROOT    = path.resolve(__dirname, "..");
const SESSIONS_DIR  = path.join(VAULT_ROOT, "01-sessions");
const PROJECTS_DIR  = path.join(VAULT_ROOT, "02-projects");
const CLAUDE_PROJECTS_DIR = path.join(process.env.HOME ?? "/Users/andrewshipley", ".claude", "projects");

// ── CLI ───────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const ONE     = args.includes("--one");
const DRY_RUN = args.includes("--dry-run");

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(s: string, maxLen = 60): string {
  const trimmed = (s ?? "").trim();
  if (!trimmed) return "untitled";
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/, "") || "untitled";
}

function yamlQuote(s: string): string {
  return `"${(s ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ")}"`;
}

function isoDate(raw: string): string {
  return (raw ?? "").slice(0, 10);
}

// Derive a human-readable project name from cwd, and optionally a wikilink
// if a matching stub exists in 02-projects/.
function projectFromCwd(cwd: string): { name: string; wikilink: string | null } {
  const parts = cwd.replace(/\\/g, "/").split("/").filter(Boolean);
  // last meaningful component
  const last = parts[parts.length - 1] ?? "";
  const secondLast = parts[parts.length - 2] ?? "";

  // Try last component first, then "parent/last" for monorepos
  const candidates = [last, `${secondLast}/${last}`];

  // Check for a matching file in 02-projects/ (case-insensitive, space≈hyphen)
  let existingStubs: string[] = [];
  try {
    existingStubs = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith(".md"));
  } catch { /* 02-projects/ not yet populated */ }

  function normalize(s: string): string {
    return s.toLowerCase().replace(/[\s\-_'/]+/g, "-").replace(/[^a-z0-9\-]/g, "");
  }

  for (const candidate of candidates) {
    const norm = normalize(candidate);
    const match = existingStubs.find(stub => normalize(stub.replace(/\.md$/, "")) === norm);
    if (match) {
      const stubName = match.replace(/\.md$/, "");
      return { name: stubName, wikilink: `[[${stubName}]]` };
    }
  }

  // No stub match — return the cwd last component as plain name
  return { name: last || "unknown", wikilink: null };
}

// Extract readable text from a content block array (skip thinking, tool_use, tool_result).
// Handles the case where content is a plain string rather than a block array.
function extractText(content: ContentBlock[] | string): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .filter(b => b.type === "text" && typeof b.text === "string")
    .map(b => b.text as string)
    .join("\n")
    .trim();
}

// Parse a single JSONL file into a SessionData object.
// Returns null if the file has no readable turns.
function parseJsonl(filePath: string): SessionData | null {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n").filter(l => l.trim());

  let sessionId = "";
  let cwd = "";
  let title = "";
  let firstTimestamp = "";
  let lastTimestamp = "";
  const turns: { role: "user" | "assistant"; text: string }[] = [];

  for (const line of lines) {
    let rec: JsonlRecord;
    try { rec = JSON.parse(line); } catch { continue; }

    // Capture session metadata from first record that has it
    if (!sessionId && rec.sessionId)   sessionId = rec.sessionId;
    if (!cwd       && rec.cwd)         cwd       = rec.cwd;
    if (rec.timestamp) {
      if (!firstTimestamp) firstTimestamp = rec.timestamp;
      lastTimestamp = rec.timestamp;
    }

    // Title
    if (rec.type === "ai-title" && rec.aiTitle) title = rec.aiTitle;

    // Skip sidechain records (background/tool-context turns)
    if (rec.isSidechain) continue;

    // User turns: extract text blocks only (skip tool_result blocks)
    if (rec.type === "user" && rec.message?.content) {
      const text = extractText(rec.message.content);
      if (text) turns.push({ role: "user", text });
    }

    // Assistant turns: extract text blocks only (skip thinking and tool_use)
    if (rec.type === "assistant" && rec.message?.content) {
      const text = extractText(rec.message.content);
      if (text) turns.push({ role: "assistant", text });
    }
  }

  if (!sessionId) return null;

  // Fallback title from last-prompt if ai-title never appeared
  if (!title) {
    for (const line of lines) {
      let rec: JsonlRecord;
      try { rec = JSON.parse(line); } catch { continue; }
      if (rec.type === "last-prompt" && rec.lastPrompt) {
        title = rec.lastPrompt.slice(0, 60).replace(/\n/g, " ").trim();
        break;
      }
    }
  }
  if (!title) title = "Untitled session";

  return { sessionId, cwd, title, firstTimestamp, lastTimestamp, turns };
}

// ── Discover all top-level JSONL files (skip subagents/) ─────────────────────

function discoverSessions(): string[] {
  const sessions: string[] = [];
  for (const projDir of fs.readdirSync(CLAUDE_PROJECTS_DIR)) {
    const projPath = path.join(CLAUDE_PROJECTS_DIR, projDir);
    if (!fs.statSync(projPath).isDirectory()) continue;
    for (const fname of fs.readdirSync(projPath)) {
      if (fname.endsWith(".jsonl")) {
        sessions.push(path.join(projPath, fname));
      }
    }
  }
  return sessions;
}

// ── Idempotency: scan existing session files for uuid → filepath ──────────────

function scanExisting(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(SESSIONS_DIR)) return map;
  for (const fname of fs.readdirSync(SESSIONS_DIR)) {
    if (!fname.endsWith(".md")) continue;
    const fpath = path.join(SESSIONS_DIR, fname);
    try {
      const content = fs.readFileSync(fpath, "utf8");
      const m = content.match(/^---\n([\s\S]*?)\n---/);
      if (m) {
        const uuidLine = m[1].split("\n").find(l => l.startsWith("uuid:"));
        if (uuidLine) map.set(uuidLine.replace(/^uuid:\s*/, "").trim(), fpath);
      }
    } catch { /* skip */ }
  }
  return map;
}

// ── Filename generation (collision-safe) ──────────────────────────────────────

function makeFilename(session: SessionData, proj: string, usedLower: Set<string>): string {
  const date    = isoDate(session.firstTimestamp);
  const pSlug   = slugify(proj, 30);
  const tSlug   = slugify(session.title, 50);
  const base    = `${date} ${pSlug} ${tSlug}`;
  const candidate = `${base}.md`;
  if (!usedLower.has(candidate.toLowerCase())) return candidate;
  return `${base}-${session.sessionId.slice(0, 8)}.md`;
}

// ── Render session → markdown ─────────────────────────────────────────────────

function render(session: SessionData): string {
  const { name: projName, wikilink } = projectFromCwd(session.cwd);

  const parts: string[] = [];

  // Frontmatter
  const projField = wikilink ? `project: "${wikilink}"` : `project: "${projName}"`;
  parts.push([
    "---",
    "type: session",
    "source: claude-code",
    `uuid: ${session.sessionId}`,
    `title: ${yamlQuote(session.title)}`,
    projField,
    `cwd: ${yamlQuote(session.cwd)}`,
    `created: ${isoDate(session.firstTimestamp)}`,
    `updated: ${isoDate(session.lastTimestamp)}`,
    `message_count: ${session.turns.length}`,
    "status: stub",
    "confidence: high",
    "tags: []",
    "---",
  ].join("\n"));

  // Title
  const projRef = wikilink ? ` (${wikilink})` : ` (${projName})`;
  parts.push(`# ${session.title}${projRef}`);

  // Transcript
  parts.push("## Transcript");

  if (session.turns.length > 0) {
    const rendered = session.turns
      .map(t => `**${t.role}**\n\n${t.text}`)
      .join("\n\n");
    parts.push(rendered);
  } else {
    parts.push("*(no readable turns)*");
  }

  return parts.join("\n\n") + "\n";
}

// ── Main ──────────────────────────────────────────────────────────────────────

fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const allJsonl = discoverSessions();
const toImport = ONE ? allJsonl.slice(0, 1) : allJsonl;

if (DRY_RUN) console.log("[DRY RUN — no files written]\n");
console.log(`Found ${allJsonl.length} Claude Code session files.`);
console.log(`Importing ${toImport.length}${ONE ? " (--one)" : ""}...`);
console.log(`Sessions dir: ${SESSIONS_DIR}\n`);

const existingUUIDs = scanExisting();
const usedLower = new Set(
  fs.existsSync(SESSIONS_DIR)
    ? fs.readdirSync(SESSIONS_DIR).map(f => f.toLowerCase())
    : []
);

let created = 0, overwritten = 0, skipped = 0;

for (const jsonlPath of toImport) {
  const session = parseJsonl(jsonlPath);

  if (!session) {
    console.log(`  [SKIP    ] ${path.relative(process.env.HOME ?? "", jsonlPath)} — no sessionId`);
    skipped++;
    continue;
  }

  const { name: projName } = projectFromCwd(session.cwd);
  const content = render(session);
  const existingPath = existingUUIDs.get(session.sessionId);

  let targetPath: string;
  if (existingPath) {
    targetPath = existingPath;
  } else {
    const fname = makeFilename(session, projName, usedLower);
    targetPath  = path.join(SESSIONS_DIR, fname);
    usedLower.add(fname.toLowerCase());
    existingUUIDs.set(session.sessionId, targetPath);
  }

  const action = existingPath ? "OVERWRITE" : "CREATE  ";
  const rel    = path.relative(VAULT_ROOT, targetPath);
  console.log(`  [${action}] ${rel}  (${session.turns.length} turns, ${session.cwd})`);

  if (!DRY_RUN) {
    fs.writeFileSync(targetPath, content, "utf8");
    if (ONE) {
      console.log(`\n  Output path: ${targetPath}`);
      console.log(`  Session title: ${session.title}`);
      console.log(`  Project cwd: ${session.cwd}`);
    }
  }

  if (existingPath) overwritten++;
  else created++;
}

const totalInDir = fs.existsSync(SESSIONS_DIR)
  ? fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith(".md")).length
  : 0;

console.log(`
Summary:
  Created:               ${created}
  Overwritten:           ${overwritten}
  Skipped (no session):  ${skipped}
  Total in 01-sessions/: ${totalInDir}
`);
