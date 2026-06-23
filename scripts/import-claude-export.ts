// import-claude-export.ts — Source A importer: Claude.ai conversations → 01-sessions/
// Zero LLM calls, zero cost. Idempotent (keyed by conversation uuid).
//
// Usage:
//   node --experimental-strip-types scripts/import-claude-export.ts <conversations.json> [--one] [--dry-run]
//
//   --one      Import only the first conversation (verify before full run)
//   --dry-run  Log what would happen; write nothing

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  uuid: string;
  text: string;
  sender: string;
  created_at: string;
  updated_at: string;
  content: unknown[];
  attachments: unknown[];
  files: unknown[];
  parent_message_uuid: string;
}

interface Conversation {
  uuid: string;
  name: string;
  summary: string;
  created_at: string;
  updated_at: string;
  account: { uuid: string };
  chat_messages: Message[];
}

// ── Paths ─────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_ROOT = path.resolve(__dirname, "..");
const SESSIONS_DIR = path.join(VAULT_ROOT, "01-sessions");

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const convsPath = args.find(a => !a.startsWith("--"));
const ONE     = args.includes("--one");
const DRY_RUN = args.includes("--dry-run");

if (!convsPath) {
  console.error("Usage: node --experimental-strip-types scripts/import-claude-export.ts <conversations.json> [--one] [--dry-run]");
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(name: string, maxLen = 80): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "untitled";
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
  // trim any trailing hyphens introduced by the slice
  return slug.replace(/-+$/, "") || "untitled";
}

function yamlQuote(s: string): string {
  // Double-quoted YAML scalar: escape \ and " only; replace newlines with space
  return `"${(s ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ")}"`;
}

function isoDate(raw: string): string {
  // "2026-06-23T00:07:37.585024Z" → "2026-06-23"
  return (raw ?? "").slice(0, 10);
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
      // Extract uuid from frontmatter: look for `uuid: <value>` between the --- delimiters
      const m = content.match(/^---\n([\s\S]*?)\n---/);
      if (m) {
        const uuidLine = m[1].split("\n").find(l => l.startsWith("uuid:"));
        if (uuidLine) map.set(uuidLine.replace(/^uuid:\s*/, "").trim(), fpath);
      }
    } catch {
      // unreadable file — skip
    }
  }
  return map;
}

// ── Filename generation (collision-safe) ──────────────────────────────────────

function makeFilename(conv: Conversation, usedLower: Set<string>): string {
  const date = isoDate(conv.created_at);
  const slug = slugify(conv.name);
  const base = `${date} ${slug}`;
  const candidate = `${base}.md`;
  if (!usedLower.has(candidate.toLowerCase())) return candidate;
  // collision: append first 8 chars of uuid
  return `${base}-${conv.uuid.slice(0, 8)}.md`;
}

// ── Render conversation → markdown ────────────────────────────────────────────

function render(conv: Conversation): string {
  const parts: string[] = [];

  // Frontmatter
  parts.push([
    "---",
    "type: session",
    "source: claude-export",
    `uuid: ${conv.uuid}`,
    `title: ${yamlQuote(conv.name ?? "")}`,
    `created: ${isoDate(conv.created_at)}`,
    `updated: ${isoDate(conv.updated_at)}`,
    `message_count: ${(conv.chat_messages ?? []).length}`,
    "status: stub",
    "confidence: high",
    "tags: []",
    "---",
  ].join("\n"));

  // Title
  parts.push(`# ${conv.name ?? "Untitled"}`);

  // Summary block — only if non-empty
  const summary = (conv.summary ?? "").trim();
  if (summary) {
    parts.push("## Summary");
    parts.push(summary);
  }

  // Transcript
  parts.push("## Transcript");

  const turns: string[] = [];
  for (const msg of (conv.chat_messages ?? [])) {
    const text = (msg.text ?? "").trim();
    if (!text) continue;
    const label =
      msg.sender === "human"     ? "**human**" :
      msg.sender === "assistant" ? "**assistant**" :
                                   `**${msg.sender}**`;
    turns.push(`${label}\n\n${text}`);
  }

  if (turns.length > 0) {
    parts.push(turns.join("\n\n"));
  }

  // Join sections with double newline; trailing newline at end
  return parts.join("\n\n") + "\n";
}

// ── Main ──────────────────────────────────────────────────────────────────────

fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const convArray = JSON.parse(fs.readFileSync(convsPath, "utf8")) as Conversation[];
const toImport = ONE ? convArray.slice(0, 1) : convArray;

if (DRY_RUN) console.log("[DRY RUN — no files written]\n");
console.log(`Importing ${toImport.length} of ${convArray.length} conversations${ONE ? " (--one)" : ""}...`);
console.log(`Sessions dir: ${SESSIONS_DIR}\n`);

// Build existing-uuid map and set of lowercase filenames already on disk
const existingUUIDs = scanExisting();
const usedLower = new Set(
  fs.existsSync(SESSIONS_DIR)
    ? fs.readdirSync(SESSIONS_DIR).map(f => f.toLowerCase())
    : []
);

let created = 0;
let overwritten = 0;
let skippedMessages = 0;

for (const conv of toImport) {
  // Count skipped messages for stats
  for (const msg of (conv.chat_messages ?? [])) {
    if (!(msg.text ?? "").trim()) skippedMessages++;
  }

  const content = render(conv);
  const existingPath = existingUUIDs.get(conv.uuid);

  let targetPath: string;
  if (existingPath) {
    // Overwrite in-place (keep existing filename)
    targetPath = existingPath;
  } else {
    const fname = makeFilename(conv, usedLower);
    targetPath = path.join(SESSIONS_DIR, fname);
    usedLower.add(fname.toLowerCase());
    existingUUIDs.set(conv.uuid, targetPath); // prevent self-collision on subsequent iterations
  }

  const action = existingPath ? "OVERWRITE" : "CREATE  ";
  console.log(`  [${action}] ${path.relative(VAULT_ROOT, targetPath)}`);

  if (!DRY_RUN) {
    fs.writeFileSync(targetPath, content, "utf8");
    if (ONE) console.log(`\n  Output path: ${targetPath}`);
  }

  if (existingPath) overwritten++;
  else created++;
}

const totalInDir = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith(".md")).length;

console.log(`
Summary:
  Created:              ${created}
  Overwritten:          ${overwritten}
  Messages skipped:     ${skippedMessages} (empty text)
  Total in 01-sessions/: ${totalInDir}
`);
