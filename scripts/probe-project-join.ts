// probe-project-join.ts — read-only project-join probe, zero vault writes
// Usage: node --experimental-strip-types scripts/probe-project-join.ts <largest-project.json> <projects-dir> <conversations.json>

import * as fs from "fs";
import * as path from "path";

const REDACT_RE = /\b(sk-ant-[A-Za-z0-9\-_]+|sk-[A-Za-z0-9\-_]+|ghp_[A-Za-z0-9]+|AKIA[A-Z0-9]{16})\b/g;

function redact(s: string): string {
  return s.replace(REDACT_RE, "[REDACTED]");
}

function sample(value: unknown, maxChars = 40): string {
  if (value === null) return "null";
  if (typeof value === "string") {
    const clean = redact(value);
    return `len=${value.length} sample="${clean.slice(0, maxChars).replace(/\n/g, "\\n")}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `Array(${(value as unknown[]).length})`;
  if (typeof value === "object") return `Object(keys=${Object.keys(value as object).join(",")})`;
  return String(value);
}

function typeName(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return `Array(${(v as unknown[]).length})`;
  return typeof v;
}

const [largestFile, projectsDir, convsFile] = process.argv.slice(2);
if (!largestFile || !projectsDir || !convsFile) {
  console.error("Usage: node --experimental-strip-types probe-project-join.ts <largest.json> <projects-dir> <conversations.json>");
  process.exit(1);
}

console.log(`\n${"═".repeat(70)}`);
console.log("GBRAIN PROJECT-JOIN PROBE");
console.log(`${"═".repeat(70)}\n`);

// ── load conversation uuids for cross-reference ───────────────────────────────
const convArray = JSON.parse(fs.readFileSync(convsFile, "utf8")) as Record<string, unknown>[];
const convUUIDs = new Set(convArray.map(c => c["uuid"] as string));
console.log(`Loaded ${convUUIDs.size} conversation UUIDs from conversations.json\n`);

// ── 1. LARGEST FILE — FULL SHAPE ─────────────────────────────────────────────
console.log("── 1. LARGEST PROJECT FILE ─────────────────────────────────────────────\n");
console.log(`File: ${path.basename(largestFile)} (${(fs.statSync(largestFile).size / 1024).toFixed(1)} KB)\n`);

const proj = JSON.parse(fs.readFileSync(largestFile, "utf8")) as Record<string, unknown>;
const topKeys = Object.keys(proj);

// heuristics
const nameField = topKeys.find(k => /^(name|title)$/i.test(k));
const arrayFields = topKeys.filter(k => Array.isArray(proj[k]));

console.log("Top-level keys:");
for (const k of topKeys) {
  const v = proj[k];
  const tags: string[] = [];
  if (k === nameField) tags.push("← PROJECT NAME");
  if (Array.isArray(v) && (k.includes("doc") || k.includes("conv") || k.includes("message") || k.includes("chat"))) {
    tags.push("← CANDIDATE CONVERSATION/DOC ARRAY");
  }
  console.log(`  ${k}: [${typeName(v)}] ${sample(v)} ${tags.join(" ")}`);
}

// ── inspect candidate arrays ──────────────────────────────────────────────────
for (const arrKey of arrayFields) {
  const arr = proj[arrKey] as Record<string, unknown>[];
  if (arr.length === 0) continue;

  console.log(`\nArray "${arrKey}" — length ${arr.length}`);

  for (let i = 0; i < Math.min(2, arr.length); i++) {
    const el = arr[i];
    if (typeof el !== "object" || el === null) {
      console.log(`  [${i}]: ${typeName(el)} ${sample(el)}`);
      continue;
    }
    const elKeys = Object.keys(el);
    console.log(`\n  element[${i}] — keys: ${elKeys.join(", ")}`);
    for (const [k, v] of Object.entries(el)) {
      const tags: string[] = [];
      // check if this is a uuid that appears in conversations.json
      if (typeof v === "string" && (k.toLowerCase().includes("uuid") || k.toLowerCase() === "id")) {
        if (convUUIDs.has(v)) tags.push("← MATCHES conversations.json uuid ✓");
        else tags.push("← uuid (no match in conversations.json)");
      }
      if (Array.isArray(v) && v.length > 0) {
        console.log(`    ${k}: [${typeName(v)}]`);
        // peek first element
        const sub = (v as unknown[])[0];
        if (typeof sub === "object" && sub !== null) {
          console.log(`      [0] keys: ${Object.keys(sub as object).join(", ")}`);
          for (const [sk, sv] of Object.entries(sub as Record<string, unknown>)) {
            const stags: string[] = [];
            if (typeof sv === "string" && convUUIDs.has(sv)) stags.push("← MATCHES conversations.json uuid ✓");
            console.log(`        ${sk}: [${typeName(sv)}] ${sample(sv)} ${stags.join(" ")}`);
          }
        }
      } else {
        console.log(`    ${k}: [${typeName(v)}] ${sample(v)} ${tags.join(" ")}`);
      }
    }
    // does the element itself carry content, or just a reference?
    const hasContent = elKeys.some(k => ["text","content","body","messages","chat_messages"].includes(k.toLowerCase()));
    const hasRef = elKeys.some(k => k.toLowerCase().includes("uuid") || k.toLowerCase() === "id");
    console.log(`    → Content embedded: ${hasContent}  Reference only: ${hasRef && !hasContent}`);
  }
}

// ── 2. ALL 22 PROJECT FILES — SUMMARY ────────────────────────────────────────
console.log(`\n${"─".repeat(70)}`);
console.log("── 2. ALL PROJECT FILES — NAME + DOC/CONV REFERENCE COUNT ─────────────\n");

const pFiles = fs.readdirSync(projectsDir)
  .filter(f => f.endsWith(".json"))
  .map(f => path.join(projectsDir, f));

// figure out which key holds the conversation/doc references from the largest file
// we'll search all array keys for uuids that match conversations.json
let refKey: string | null = null;
let matchedConvUUIDs = new Set<string>();
let totalRefs = 0;

const projectRows: { name: string; refCount: number; matchedUUIDs: string[] }[] = [];

for (const pf of pFiles) {
  const p = JSON.parse(fs.readFileSync(pf, "utf8")) as Record<string, unknown>;
  const pName = (p["name"] ?? path.basename(pf)) as string;
  const pKeys = Object.keys(p);
  const arrKeys = pKeys.filter(k => Array.isArray(p[k]));

  let bestCount = 0;
  let bestMatched: string[] = [];

  for (const ak of arrKeys) {
    const arr = p[ak] as unknown[];
    const matched: string[] = [];

    for (const el of arr) {
      if (typeof el === "object" && el !== null) {
        // check all string values for conv uuid match
        for (const v of Object.values(el as Record<string, unknown>)) {
          if (typeof v === "string" && convUUIDs.has(v)) {
            matched.push(v);
          }
          // also check one level deeper
          if (typeof v === "object" && v !== null && !Array.isArray(v)) {
            for (const vv of Object.values(v as Record<string, unknown>)) {
              if (typeof vv === "string" && convUUIDs.has(vv)) matched.push(vv);
            }
          }
        }
      } else if (typeof el === "string" && convUUIDs.has(el)) {
        matched.push(el);
      }
    }

    if (matched.length > bestCount) {
      bestCount = matched.length;
      bestMatched = matched;
      if (!refKey && matched.length > 0) refKey = ak;
    }
  }

  totalRefs += bestCount;
  bestMatched.forEach(u => matchedConvUUIDs.add(u));
  projectRows.push({ name: pName, refCount: bestCount, matchedUUIDs: bestMatched });
}

for (const row of projectRows.sort((a, b) => b.refCount - a.refCount)) {
  const bar = row.refCount > 0 ? `[${row.refCount} conv refs]` : "[no conv refs]";
  console.log(`  ${bar.padEnd(20)} ${row.name}`);
}

console.log(`\nSummary:`);
console.log(`  Total conv references across all project files: ${totalRefs}`);
console.log(`  Unique conversation UUIDs in at least one project: ${matchedConvUUIDs.size} / ${convUUIDs.size}`);
console.log(`  Conversations that will get a [[project]] wikilink: ${matchedConvUUIDs.size}`);
console.log(`  Conversations with NO project link (standalone):    ${convUUIDs.size - matchedConvUUIDs.size}`);
if (refKey) console.log(`  Best matching array key for conversation refs: "${refKey}"`);

console.log(`\n${"═".repeat(70)}`);
console.log("PROBE COMPLETE — no vault writes.");
console.log(`${"═".repeat(70)}\n`);
