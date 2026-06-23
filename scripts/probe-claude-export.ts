// probe-claude-export.ts — read-only schema probe, zero vault writes, zero LLM calls
// Usage: node --experimental-strip-types scripts/probe-claude-export.ts <conversations.json>

import * as fs from "fs";
import * as path from "path";

const REDACT_RE = /\b(sk-ant-[A-Za-z0-9\-_]+|sk-[A-Za-z0-9\-_]+|ghp_[A-Za-z0-9]+|AKIA[A-Z0-9]{16})\b/g;

function redact(s: string): string {
  return s.replace(REDACT_RE, "[REDACTED]");
}

function sample(value: unknown, maxChars = 60): string {
  if (value === null) return "null";
  if (typeof value === "string") {
    const clean = redact(value);
    return `len=${value.length} sample="${clean.slice(0, maxChars).replace(/\n/g, "\\n")}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === "object") return `Object(keys=${Object.keys(value as object).join(",")})`;
  return String(value);
}

function typeName(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return `Array(${(v as unknown[]).length})`;
  return typeof v;
}

function parseISO(raw: unknown): string {
  if (!raw) return "(missing)";
  const d = new Date(raw as string);
  return isNaN(d.getTime()) ? `(unparseable: ${raw})` : d.toISOString();
}

// ── locate args ──────────────────────────────────────────────────────────────
const convPath = process.argv[2];
const projectsDir = process.argv[3] ?? null;
if (!convPath) {
  console.error("Usage: node --experimental-strip-types probe-claude-export.ts <conversations.json> [projects-dir]");
  process.exit(1);
}

console.log(`\n${"═".repeat(70)}`);
console.log("GBRAIN EXPORT SCHEMA PROBE");
console.log(`conversations.json: ${convPath} (${(fs.statSync(convPath).size / 1_048_576).toFixed(1)} MB)`);
console.log(`${"═".repeat(70)}\n`);

// ── load ─────────────────────────────────────────────────────────────────────
const raw = fs.readFileSync(convPath, "utf8");
const data: unknown = JSON.parse(raw);

// ── top-level shape ───────────────────────────────────────────────────────────
console.log("── 1. TOP-LEVEL SHAPE ──────────────────────────────────────────────────\n");

let convArray: Record<string, unknown>[];
if (Array.isArray(data)) {
  console.log(`Top-level type: Array`);
  console.log(`Array length:   ${data.length}`);
  convArray = data as Record<string, unknown>[];
} else if (typeof data === "object" && data !== null) {
  const keys = Object.keys(data as object);
  console.log(`Top-level type: Object`);
  console.log(`Keys: ${keys.join(", ")}`);
  // find the array key
  const arrayKey = keys.find(k => Array.isArray((data as Record<string, unknown>)[k]));
  if (!arrayKey) { console.error("Could not find an array key in the top-level object."); process.exit(1); }
  console.log(`Conversations array key: "${arrayKey}"`);
  convArray = (data as Record<string, unknown>)[arrayKey] as Record<string, unknown>[];
  console.log(`Array length: ${convArray.length}`);
} else {
  console.error(`Unexpected top-level type: ${typeof data}`);
  process.exit(1);
}

// ── schema across all records ─────────────────────────────────────────────────
console.log("\n── 2. SCHEMA ACROSS ALL RECORDS ────────────────────────────────────────\n");

const keyCounts: Record<string, number> = {};
const messageCounts: number[] = [];
let minCreated = Infinity, maxCreated = -Infinity;

for (const conv of convArray) {
  for (const k of Object.keys(conv)) keyCounts[k] = (keyCounts[k] ?? 0) + 1;
  // find message array
  for (const k of Object.keys(conv)) {
    const v = conv[k];
    if (Array.isArray(v) && (k.includes("message") || k.includes("turn") || k === "chat_messages")) {
      messageCounts.push((v as unknown[]).length);
      break;
    }
  }
  // date range
  for (const dateKey of ["created_at", "created", "updated_at", "updated"]) {
    if (conv[dateKey]) {
      const t = new Date(conv[dateKey] as string).getTime();
      if (!isNaN(t)) { minCreated = Math.min(minCreated, t); maxCreated = Math.max(maxCreated, t); break; }
    }
  }
}

const total = convArray.length;
console.log(`Total conversations: ${total}`);
console.log(`\nKey presence across all ${total} records:`);
for (const [k, count] of Object.entries(keyCounts).sort()) {
  const optional = count < total ? ` ← OPTIONAL (present in ${count}/${total})` : "";
  console.log(`  ${k}: ${count}/${total}${optional}`);
}

if (messageCounts.length > 0) {
  const sorted = [...messageCounts].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
  console.log(`\nMessage counts — min: ${sorted[0]}  median: ${median}  max: ${sorted[sorted.length - 1]}`);
}

if (minCreated !== Infinity) {
  console.log(`Date range: ${new Date(minCreated).toISOString()} → ${new Date(maxCreated).toISOString()}`);
}

// ── one record ────────────────────────────────────────────────────────────────
console.log("\n── 3. FIRST RECORD — FULL KEY MAP ─────────────────────────────────────\n");

const first = convArray[0];
const allKeys = Object.keys(first);

// heuristics for special fields
const idField = allKeys.find(k => /^(uuid|id)$/i.test(k));
const titleField = allKeys.find(k => /^(title|name|subject)$/i.test(k));
const createdField = allKeys.find(k => /^created/i.test(k));
const updatedField = allKeys.find(k => /^updated/i.test(k));
const projectField = allKeys.find(k => /^project/i.test(k));
const messagesField = allKeys.find(k => Array.isArray(first[k]) &&
  (k.includes("message") || k.includes("turn") || k === "chat_messages"));

for (const k of allKeys) {
  const v = first[k];
  const tags: string[] = [];
  if (k === idField) tags.push("← STABLE ID");
  if (k === titleField) tags.push("← TITLE");
  if (k === createdField) tags.push(`← CREATED (ISO: ${parseISO(v)})`);
  if (k === updatedField) tags.push(`← UPDATED (ISO: ${parseISO(v)})`);
  if (k === projectField) tags.push("← PROJECT REF");
  if (k === messagesField) tags.push("← MESSAGES ARRAY");
  const display = Array.isArray(v) ? `Array(${(v as unknown[]).length})` : sample(v);
  console.log(`  ${k}: [${typeName(v)}] ${display} ${tags.join(" ")}`);
}

// ── message shape ─────────────────────────────────────────────────────────────
console.log("\n── 4. MESSAGE SHAPE ────────────────────────────────────────────────────\n");

if (!messagesField) {
  console.log("Could not detect a messages/turns array on the first record.");
  console.log("Array-valued keys:", allKeys.filter(k => Array.isArray(first[k])).join(", ") || "(none)");
} else {
  const msgs = first[messagesField] as Record<string, unknown>[];
  console.log(`Messages array key: "${messagesField}"  length: ${msgs.length}`);

  for (let i = 0; i < Math.min(2, msgs.length); i++) {
    const msg = msgs[i];
    console.log(`\n  message[${i}] — keys: ${Object.keys(msg).join(", ")}`);
    for (const [k, v] of Object.entries(msg)) {
      if (Array.isArray(v)) {
        console.log(`    ${k}: Array(${(v as unknown[]).length})`);
        // inspect block structure
        for (let b = 0; b < Math.min(2, (v as unknown[]).length); b++) {
          const block = (v as Record<string, unknown>[])[b];
          if (typeof block === "object" && block !== null) {
            console.log(`      block[${b}]: {${Object.keys(block).join(", ")}}`);
            for (const [bk, bv] of Object.entries(block)) {
              console.log(`        ${bk}: [${typeName(bv)}] ${sample(bv)}`);
            }
          }
        }
      } else {
        const tags: string[] = [];
        if (/^(role|sender|author)$/i.test(k)) tags.push(`← ROLE/SENDER  value="${v}"`);
        console.log(`    ${k}: [${typeName(v)}] ${sample(v)} ${tags.join(" ")}`);
      }
    }
  }
}

// ── siblings ──────────────────────────────────────────────────────────────────
console.log("\n── 5. SIBLING FILES ────────────────────────────────────────────────────\n");

// projects
if (projectsDir && fs.existsSync(projectsDir)) {
  const pFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith(".json"));
  console.log(`projects/ directory: ${pFiles.length} JSON files`);
  if (pFiles.length > 0) {
    const pRaw = fs.readFileSync(path.join(projectsDir, pFiles[0]), "utf8");
    const pData = JSON.parse(pRaw);
    const pKeys = Object.keys(pData);
    console.log(`  Sample file: ${pFiles[0]}`);
    console.log(`  Top-level keys: ${pKeys.join(", ")}`);
    for (const k of pKeys) {
      const v = pData[k];
      console.log(`    ${k}: [${typeName(v)}] ${sample(v)}`);
    }
  }
} else {
  console.log("projects/ directory not provided or not found at:", projectsDir);
}

// project reference on conversations
if (projectField) {
  const vals = convArray
    .map(c => c[projectField])
    .filter(v => v !== null && v !== undefined);
  const nonNull = vals.length;
  const sample0 = nonNull > 0 ? sample(vals[0]) : "(all null)";
  console.log(`\nProject reference field on conversations: "${projectField}"`);
  console.log(`  Present (non-null) in ${nonNull}/${total} conversations`);
  console.log(`  Sample value: ${sample0}`);
}

// users.json
const usersPath = path.join(path.dirname(convPath), "users.json");
if (fs.existsSync(usersPath)) {
  const uData = JSON.parse(fs.readFileSync(usersPath, "utf8"));
  console.log(`\nusers.json top-level type: ${typeName(uData)}`);
  if (Array.isArray(uData)) {
    console.log(`  Array length: ${uData.length}`);
    if (uData.length > 0) console.log(`  First record keys: ${Object.keys(uData[0]).join(", ")}`);
  } else {
    console.log(`  Keys: ${Object.keys(uData).join(", ")}`);
  }
}

console.log(`\n${"═".repeat(70)}`);
console.log("PROBE COMPLETE — no vault writes, no LLM calls.");
console.log(`${"═".repeat(70)}\n`);
