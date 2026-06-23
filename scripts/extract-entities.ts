// extract-entities.ts — Phase 1 extraction pass
// Zero LLM. Artifact attribution: an artifact counts toward an entity only when
// the entity alias is within ATTRIB_SPAN of the artifact, or the artifact text contains the alias.
//
// Usage:
//   node --experimental-strip-types scripts/extract-entities.ts --dry-run
//   node --experimental-strip-types scripts/extract-entities.ts --apply

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const VAULT_ROOT   = path.resolve(__dirname, "..");
const SESSIONS_DIR = path.join(VAULT_ROOT, "01-sessions");
const META_DIR     = path.join(VAULT_ROOT, "09-meta");
const ALIASES_FILE = path.join(META_DIR, "aliases.md");
const IMPORT_LOG   = path.join(META_DIR, "import-log.md");

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOW_PROSE_FULL = false;  // false = FULL requires FULL_REACH artifact-bearing sessions

const T = {
  WINDOW_CHARS:                600,
  ATTRIB_SPAN:                 120,   // max gap (chars) between entity and artifact for attribution
  REACH_EVIDENCE_FLOOR:        60,    // min line-net-chars for prose evidence gate
  FULL_REACH:                  3,
  FULL_DEPTH_CHARS:            2000,
  FULL_ARTIFACTS:              3,
  MODERATE_REACH:              2,
  MODERATE_DEPTH_CHARS:        400,
  MODERATE_ARTIFACTS:          1,
  SESSION_FULL_MESSAGES:       30,
  SESSION_MODERATE_MESSAGES:   10,
  SESSION_FULL_ARTIFACT_DENSITY: 0.10,
  SESSION_MOD_ARTIFACT_DENSITY:  0.05,
};

const ARTIFACT_PATTERNS: RegExp[] = [
  /```[\s\S]*?```/g,
  /(?:^|[\s('"[{])((?:[~.]?\/|~\/)\S+)/gm,
  /https?:\/\/[^\s)>"]+/gi,
  /\b(?:deploy(?:ed)?|shipped|live|production|MCP|schema|pipeline|agent\s+loop|endpoint)\b/gi,
];

// ── Types ─────────────────────────────────────────────────────────────────────

type Tier = "full" | "moderate" | "stub";

interface AliasEntry { canonical: string; vaultPath: string; aliases: string[] }

interface EntityStats {
  canonical: string;
  vaultPath: string;
  evidencedSessions: Set<string>;
  artifactSessions:  Set<string>;  // attributed artifact sessions (artAttrib >= 1)
  totalMatched: number;
  depth: number;
  artifacts: number;               // total attributed artifacts across evidenced sessions
  dedicatedSessions: string[];
  allMatchSessions: string[];
  windowSamples: Map<string, string>;
}

interface MatchTuple { start: number; end: number; canonical: string; matchText: string }

interface NodeDecision {
  name: string; folder: string; folderClear: boolean;
  sessionCount: number; sessions: string[];
  gate: string; create: boolean;
}

// ── Text helpers ──────────────────────────────────────────────────────────────

function countSessionArtifacts(text: string): number {
  let n = 0;
  for (const re of ARTIFACT_PATTERNS)
    n += (text.match(new RegExp(re.source, re.flags)) ?? []).length;
  return n;
}

// Attributed artifact count: artifacts within ATTRIB_SPAN of any entity match,
// OR whose text contains the entity alias.
function countAttributedArtifacts(
  rawBody: string,
  positions: { start: number; end: number }[],
  windows:   { start: number; end: number }[],
  aliases:   string[],
  attribSpan: number
): number {
  if (positions.length === 0) return 0;
  const aliasRe = aliases.map(a => {
    const esc = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    return new RegExp(`\\b${esc}\\b`, "i");  // non-global, just .test()
  });
  let count = 0;

  for (const w of windows) {
    const wText = rawBody.slice(w.start, w.end);
    const wOff  = w.start;

    for (const re of ARTIFACT_PATTERNS) {
      const aRe = new RegExp(re.source, re.flags);
      let m: RegExpExecArray | null;
      while ((m = aRe.exec(wText)) !== null) {
        const artStart = wOff + m.index;
        const artEnd   = artStart + m[0].length;

        // Criterion 1: entity match within ATTRIB_SPAN of this artifact
        const byProximity = positions.some(p => {
          // Gap between two ranges; 0 if they overlap
          const gap = Math.max(0, Math.max(artStart, p.start) - Math.min(artEnd, p.end));
          return gap <= attribSpan;
        });

        // Criterion 2: artifact text itself contains an entity alias
        const artSample  = m[0].slice(0, 1000);
        const byContent  = aliasRe.some(r => r.test(artSample));

        if (byProximity || byContent) count++;
      }
    }
  }
  return count;
}

// Length-preserving strips — positions in stripped/matchBody === rawBody positions
function stripCode(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, m => " ".repeat(m.length))
    .replace(/`[^`\n]*`/g,      m => " ".repeat(m.length));
}
function stripWikilinks(text: string): string {
  return text.replace(/\[\[[^\]\n]*?\]\]/g, m => " ".repeat(m.length));
}
function stripH1(text: string): string {
  return text.replace(/\n# [^\n]+/, m => " ".repeat(m.length));
}

function buildPattern(alias: string): RegExp {
  const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`\\b${esc}\\b`, "gi");
}

function parseFrontmatter(content: string): Record<string, string> {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const c = line.indexOf(":");
    if (c < 1) continue;
    fm[line.slice(0, c).trim()] = line.slice(c + 1).trim().replace(/^["']|["']$/g, "");
  }
  return fm;
}

function extractBody(content: string): string {
  const m = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return m ? m[1] : content;
}

function windowAround(text: string, s: number, e: number, half: number) {
  let start = Math.max(0, s - half), end = Math.min(text.length, e + half);
  const pb = text.lastIndexOf("\n\n", s); if (pb !== -1 && pb >= s - half) start = pb + 2;
  const pa = text.indexOf("\n\n", e);     if (pa !== -1 && pa <= e + half) end = pa;
  return { start, end };
}

function mergeWindows(wins: { start: number; end: number }[]) {
  if (!wins.length) return wins;
  const s = [...wins].sort((a, b) => a.start - b.start);
  const out = [{ ...s[0] }];
  for (let i = 1; i < s.length; i++) {
    const last = out[out.length - 1];
    if (s[i].start <= last.end) last.end = Math.max(last.end, s[i].end);
    else out.push({ ...s[i] });
  }
  return out;
}

function isEvidenced(stripped: string, mStart: number, mText: string, attribArts: number): boolean {
  if (attribArts >= 1) return true;
  const ls = stripped.lastIndexOf("\n", mStart - 1) + 1;
  let le   = stripped.indexOf("\n", mStart); if (le === -1) le = stripped.length;
  return (le - ls) - mText.length > T.REACH_EVIDENCE_FLOOR;
}

function assignEntityTier(s: EntityStats): Tier {
  const reach  = s.evidencedSessions.size;
  const artRch = s.artifactSessions.size;
  const fullGate = ALLOW_PROSE_FULL || artRch >= T.FULL_REACH;
  if (fullGate) {
    if (s.dedicatedSessions.length > 0) return "full";
    if (s.artifacts >= T.FULL_ARTIFACTS) return "full";
    if (reach >= T.FULL_REACH && s.depth >= T.FULL_DEPTH_CHARS) return "full";
  }
  if (reach >= T.MODERATE_REACH || s.depth >= T.MODERATE_DEPTH_CHARS || s.artifacts >= T.MODERATE_ARTIFACTS)
    return "moderate";
  return "stub";
}

function assignSessionTier(msgCount: number, arts: number): Tier {
  const d = arts / Math.max(msgCount, 1);
  if (msgCount >= T.SESSION_FULL_MESSAGES    && d >= T.SESSION_FULL_ARTIFACT_DENSITY) return "full";
  if (msgCount >= T.SESSION_MODERATE_MESSAGES || d >= T.SESSION_MOD_ARTIFACT_DENSITY) return "moderate";
  return "stub";
}

function folderFor(name: string): { folder: string; clear: boolean } {
  const n = name.toLowerCase();
  if (n.endsWith("-agent") || n.endsWith("-engine") || n.endsWith("-composer") ||
      n.includes("land") || n === "gbrain" || n === "wheelhouse" || n.startsWith("dr "))
    return { folder: "02-projects/", clear: true };
  if (/\b(llc|pllc|inc|corp|haus|machina)\b/i.test(name)) return { folder: "04-companies/", clear: true };
  if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name))            return { folder: "03-people/",    clear: true };
  return { folder: "02-projects/", clear: false };
}

// ── Parse aliases.md ──────────────────────────────────────────────────────────

function parseAliases(): { confident: AliasEntry[]; suppressed: Set<string> } {
  const raw = fs.readFileSync(ALIASES_FILE, "utf8");
  const confident: AliasEntry[] = [];
  const suppressed = new Set<string>();
  let section = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("## Confident"))   { section = "confident";   continue; }
    if (line.startsWith("## Suppression")) { section = "suppression"; continue; }
    if (line.startsWith("## "))            { section = "";            continue; }
    if (section === "confident" && line.startsWith("| ")) {
      const cols = line.split("|").map(c => c.trim()).filter(Boolean);
      if (cols.length < 3 || cols[0] === "Canonical") continue;
      confident.push({ canonical: cols[0], vaultPath: cols[1].startsWith("(") ? "" : cols[1],
                       aliases: cols[2].split(",").map(a => a.trim()).filter(Boolean) });
    }
    if (section === "suppression" && line.startsWith("| ")) {
      const cols = line.split("|").map(c => c.trim()).filter(Boolean);
      if (cols.length < 2 || cols[0] === "Slug") continue;
      suppressed.add(cols[0].toLowerCase());
    }
  }
  return { confident, suppressed };
}

// ── Stage 1: Source B project nodes (authoritative) ──────────────────────────

function discoverSourceBNodes(fps: string[], suppressed: Set<string>, confident: AliasEntry[]) {
  const nodes = new Map<string, Set<string>>();
  for (const fp of fps) {
    const fm = parseFrontmatter(fs.readFileSync(fp, "utf8"));
    if (fm.source !== "claude-code") continue;
    const proj = fm.project?.replace(/^\[\[|\]\]$/g, "").trim() ?? "";
    if (!proj || suppressed.has(proj.toLowerCase())) continue;
    if (confident.some(e => e.aliases.some(a => a.toLowerCase() === proj.toLowerCase()) ||
                            e.canonical.toLowerCase() === proj.toLowerCase())) continue;
    if (!nodes.has(proj)) nodes.set(proj, new Set());
    nodes.get(proj)!.add(path.basename(fp));
  }
  return nodes;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function run() {
  const args    = process.argv.slice(2);
  const DRY_RUN = !args.includes("--apply");
  if (DRY_RUN) console.log("[DRY RUN — no files written]\n");

  const { confident, suppressed } = parseAliases();

  const sessionFiles = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith(".md")).sort()
    .map(f => path.join(SESSIONS_DIR, f));

  // Source B nodes
  const sourceBNodes = discoverSourceBNodes(sessionFiles, suppressed, confident);
  const nodeDecisions: NodeDecision[] = [...sourceBNodes.entries()].map(([name, sessions]) => {
    const { folder, clear } = folderFor(name);
    return { name, folder, folderClear: clear, sessionCount: sessions.size,
             sessions: [...sessions], gate: `Source B authoritative (${sessions.size} session${sessions.size > 1 ? "s" : ""})`, create: true };
  }).sort((a, b) => b.sessionCount - a.sessionCount);

  // Runtime aliases = static + confirmed new nodes
  const runtimeAliases: AliasEntry[] = [
    ...confident,
    ...nodeDecisions.filter(n => n.create).map(n => ({
      canonical: n.name, vaultPath: `${n.folder}${n.name}.md`, aliases: [n.name],
    })),
  ];

  // Init entity stats
  const entityMap = new Map<string, EntityStats>();
  for (const e of runtimeAliases) {
    entityMap.set(e.canonical, {
      canonical: e.canonical, vaultPath: e.vaultPath,
      evidencedSessions: new Set(), artifactSessions: new Set(),
      totalMatched: 0, depth: 0, artifacts: 0,
      dedicatedSessions: [], allMatchSessions: [], windowSamples: new Map(),
    });
  }

  const sessionTiers: Tier[] = [];
  const sessionMatchMap = new Map<string, MatchTuple[]>();

  for (const fp of sessionFiles) {
    const basename = path.basename(fp);
    const content  = fs.readFileSync(fp, "utf8");
    const fm       = parseFrontmatter(content);
    const title    = fm.title?.replace(/^["']|["']$/g, "") ?? basename;
    const msgCount = parseInt(fm.message_count ?? "0", 10);
    const source   = fm.source ?? "";
    const project  = fm.project?.replace(/^\[\[|\]\]$/g, "").trim() ?? "";

    const fullBody  = extractBody(content);
    const rawBody   = stripH1(fullBody);          // H1 → spaces; positions align
    const stripped  = stripCode(rawBody);          // code → spaces; positions align
    const matchBody = stripWikilinks(stripped);    // existing [[links]] → spaces; positions align

    const sessionArts = countSessionArtifacts(fullBody); // full-session for session tier
    sessionTiers.push(assignSessionTier(msgCount, sessionArts));

    const sessionMatches: MatchTuple[] = [];

    for (const e of runtimeAliases) {
      // statPositions: from `stripped` (preserves wikilinks so already-linked text still counts)
      // Used for: evidenced sessions, artifact attribution, depth, artifactSessions.
      // This makes the second --apply run produce identical stats (idempotent).
      const statPositions: { start: number; end: number; text: string }[] = [];
      for (const alias of e.aliases) {
        const re = buildPattern(alias);
        let m: RegExpExecArray | null;
        while ((m = re.exec(stripped)) !== null)
          statPositions.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
      }

      const titleMatch = e.aliases.some(a => buildPattern(a).test(title));
      if (statPositions.length === 0 && !titleMatch) continue;

      const stats = entityMap.get(e.canonical)!;
      stats.totalMatched++;
      stats.allMatchSessions.push(basename);
      if (titleMatch && !stats.dedicatedSessions.includes(basename)) stats.dedicatedSessions.push(basename);

      if (statPositions.length > 0) {
        const wins  = mergeWindows(statPositions.map(p => windowAround(stripped, p.start, p.end, T.WINDOW_CHARS)));
        const wDep  = wins.reduce((s, w) => s + w.end - w.start, 0);

        // Attributed artifacts: use rawBody (same positions as stripped; preserves code)
        const attribArts = countAttributedArtifacts(rawBody, statPositions, wins, e.aliases, T.ATTRIB_SPAN);

        const evidenced = isEvidenced(stripped, statPositions[0].start, statPositions[0].text, attribArts);

        if (evidenced) {
          stats.evidencedSessions.add(basename);
          stats.depth     += wDep;
          stats.artifacts += attribArts;
        }
        if (attribArts >= 1) stats.artifactSessions.add(basename);
        if (!stats.windowSamples.has(basename) && wins.length > 0)
          stats.windowSamples.set(basename, stripped.slice(wins[0].start, wins[0].end).trim());
      } else if (titleMatch) {
        stats.evidencedSessions.add(basename);
        if (sessionArts >= 1) stats.artifactSessions.add(basename);
      }

      // newPositions: from `matchBody` (wikilinks stripped) — only UNlinked text
      // Used exclusively for collecting new wikilink insertions (prevents double-linking).
      for (const alias of e.aliases) {
        const re = buildPattern(alias);
        let m: RegExpExecArray | null;
        while ((m = re.exec(matchBody)) !== null) {
          sessionMatches.push({ start: m.index, end: m.index + m[0].length, canonical: e.canonical, matchText: m[0] });
        }
      }
    }
    sessionMatchMap.set(fp, sessionMatches);
  }

  const entityTiers = new Map<string, Tier>();
  for (const [c, s] of entityMap) entityTiers.set(c, assignEntityTier(s));

  // ── DRY-RUN REPORT ───────────────────────────────────────────────────────────

  const H = "═".repeat(70);
  console.log(H);
  console.log("ENTITY EXTRACTION — DRY RUN (attributed artifacts, ATTRIB_SPAN=120)");
  console.log(H);

  const eT = { full: 0, moderate: 0, stub: 0 };
  for (const t of entityTiers.values()) eT[t]++;
  const sT = { full: 0, moderate: 0, stub: 0 };
  for (const t of sessionTiers) sT[t]++;

  console.log(`\n── TIER DISTRIBUTION ────────────────────────────────────────────────────\n`);
  console.log(`  Entities (${entityMap.size}): full=${eT.full}  moderate=${eT.moderate}  stub=${eT.stub}`);
  console.log(`  Sessions (${sessionTiers.length}): full=${sT.full}  moderate=${sT.moderate}  stub=${sT.stub}`);

  console.log(`\n── FULL ENTITIES ────────────────────────────────────────────────────────\n`);
  const order: Record<Tier, number> = { full: 0, moderate: 1, stub: 2 };
  const sorted = [...entityMap.values()].sort(
    (a, b) => order[entityTiers.get(a.canonical)!] - order[entityTiers.get(b.canonical)!] || b.artifactSessions.size - a.artifactSessions.size
  );
  for (const s of sorted.filter(s => entityTiers.get(s.canonical) === "full")) {
    const ded = s.dedicatedSessions.length > 0 ? ` [ded:${s.dedicatedSessions.length}]` : "";
    console.log(`  ${s.canonical.padEnd(30)} artRch=${s.artifactSessions.size}  arts=${s.artifacts}  reach=${s.evidencedSessions.size}  depth=${s.depth.toLocaleString()}${ded}`);
  }

  console.log(`\n── ALL ENTITY TIERS ─────────────────────────────────────────────────────\n`);
  for (const s of sorted) {
    const tier = entityTiers.get(s.canonical)!;
    const raw  = s.totalMatched !== s.evidencedSessions.size ? ` (raw:${s.totalMatched})` : "";
    console.log(`  ${s.canonical.padEnd(30)} ${tier.toUpperCase().padEnd(10)} artRch=${s.artifactSessions.size}  arts=${s.artifacts}  reach=${s.evidencedSessions.size}${raw}`);
  }

  // ── Spotlight entities ────────────────────────────────────────────────────────
  const spotlightNames = ["John Jost", "Spencer Williams", "Audience Haus", "trip-composer", "civilwarland", "Wheelhouse"];
  console.log(`\n── SPOTLIGHT: prose-vs-built separation ─────────────────────────────────\n`);
  for (const name of spotlightNames) {
    const s = entityMap.get(name);
    if (!s) { console.log(`  ${name}: not in entity map`); continue; }
    const tier = entityTiers.get(name)!;
    const fullGate = s.artifactSessions.size >= T.FULL_REACH;
    console.log(`  ${name}`);
    console.log(`    tier=${tier.toUpperCase()}  attribArts=${s.artifacts}  attribArtRch=${s.artifactSessions.size}  reach=${s.evidencedSessions.size}`);
    console.log(`    fullGate (artRch≥${T.FULL_REACH}): ${fullGate ? "PASSES" : "FAILS → capped at moderate"}`);
    // Show which sessions have attributed artifacts
    for (const sess of s.allMatchSessions.slice(-4).reverse()) {
      const art = s.artifactSessions.has(sess) ? " [attrib-art]" : "";
      const ev  = s.evidencedSessions.has(sess) ? "✓" : "✗";
      console.log(`    ${ev} ${sess}${art}`);
    }
    console.log();
  }

  // ── Suppression check ─────────────────────────────────────────────────────────
  console.log(`── SUPPRESSION CHECK ────────────────────────────────────────────────────\n`);
  const suppCheck = ["andrewshipley", "abrainoag"];
  for (const slug of suppCheck) {
    const inMap = [...entityMap.keys()].some(k => k.toLowerCase() === slug);
    console.log(`  ${slug}: ${inMap ? "⚠ IN MAP" : "✓ suppressed"}`);
  }

  // ── Bare-token check ──────────────────────────────────────────────────────────
  console.log(`\n── BARE TOKEN CHECK ─────────────────────────────────────────────────────\n`);
  const bareTokens = ["liz", "ags", "spencer", "max"];
  for (const tok of bareTokens) {
    const re = new RegExp(`^${tok}$`, "i");
    const direct = [...sessionMatchMap.values()].flat().filter(m => re.test(m.matchText)).length;
    console.log(`  "${tok}": direct links planned = ${direct}  ${direct === 0 ? "✓" : "✗ FAIL"}`);
  }

  // ── Source B node decisions ───────────────────────────────────────────────────
  console.log(`\n── SOURCE B NODE DECISIONS ──────────────────────────────────────────────\n`);
  for (const nd of nodeDecisions)
    console.log(`  ✓ ${nd.folder}${nd.name}.md   [${nd.gate}]`);
  const whNode = nodeDecisions.find(n => n.name.toLowerCase() === "wheelhouse");
  console.log(`  Wheelhouse node: ${whNode ? "✓ created" : "✗ missing"}`);

  // ── Apply gate ────────────────────────────────────────────────────────────────
  const jj = entityMap.get("John Jost")!;
  const gateJohnJost   = entityTiers.get("John Jost") !== "full";
  const gateOrpheus    = entityTiers.get("Orpheus")  === "full";
  const gateCharlie    = entityTiers.get("charlie")  === "full";
  const gateNoProseOnly = [...entityMap.entries()]
    .filter(([c]) => entityTiers.get(c) === "full")
    .every(([, s]) => s.artifacts > 0);
  const gateSuppressed = !nodeDecisions.some(n => suppCheck.includes(n.name.toLowerCase()) && n.create);
  const gateWheelhouse = whNode !== undefined;
  const gateBareTokens = bareTokens.every(tok => {
    const re = new RegExp(`^${tok}$`, "i");
    return ![...sessionMatchMap.values()].flat().some(m => re.test(m.matchText));
  });

  const allPass = gateJohnJost && gateOrpheus && gateCharlie && gateNoProseOnly && gateSuppressed && gateWheelhouse && gateBareTokens;

  console.log(`\n── APPLY GATE ───────────────────────────────────────────────────────────\n`);
  console.log(`  John Jost ≠ FULL:               ${gateJohnJost  ? "✓ PASS" : "✗ FAIL"} (tier=${entityTiers.get("John Jost")}  attribArts=${jj.artifacts}  artRch=${jj.artifactSessions.size})`);
  console.log(`  Orpheus = FULL:                 ${gateOrpheus   ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  charlie = FULL:                 ${gateCharlie   ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  All FULL have attribArts > 0:   ${gateNoProseOnly ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  Suppression (no andy/AbrainOAG): ${gateSuppressed ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  Wheelhouse node exists:          ${gateWheelhouse ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  Zero bare liz/ags/spencer/max:  ${gateBareTokens ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`\n  ALL GATE CONDITIONS: ${allPass ? "✓ PASS — proceeding to --apply" : "✗ FAIL — stopping"}\n`);

  if (!allPass) {
    const failed: string[] = [];
    if (!gateJohnJost)   failed.push(`John Jost is FULL (artRch=${jj.artifactSessions.size}, arts=${jj.artifacts})`);
    if (!gateOrpheus)    failed.push(`Orpheus not FULL`);
    if (!gateCharlie)    failed.push(`charlie not FULL`);
    if (!gateNoProseOnly) {
      const offenders = [...entityMap.entries()].filter(([c,s]) => entityTiers.get(c)==="full" && s.artifacts===0).map(([c])=>c);
      failed.push(`Prose-only entities in FULL: ${offenders.join(", ")}`);
    }
    if (!gateSuppressed)  failed.push(`Suppressed name has a node`);
    if (!gateWheelhouse)  failed.push(`Wheelhouse node missing`);
    if (!gateBareTokens)  failed.push(`Bare token links found`);
    console.log(`  Failed:\n${failed.map(f => "    - " + f).join("\n")}\n`);
    return;
  }

  const totalLinks = [...sessionMatchMap.values()].reduce((s, m) => s + m.length, 0);
  if (DRY_RUN) {
    console.log(`  Wikilinks planned: ${totalLinks}`);
    console.log(`  New stubs planned: ${nodeDecisions.filter(n => n.create).length}`);
    return;
  }

  // ── APPLY ─────────────────────────────────────────────────────────────────────

  console.log("APPLYING…\n");
  let linksInserted = 0, stubsCreated = 0, filesModified = 0;

  // 1. Create stub files
  for (const nd of nodeDecisions.filter(n => n.create)) {
    const stubPath = path.join(VAULT_ROOT, nd.folder, `${nd.name}.md`);
    if (fs.existsSync(stubPath)) { console.log(`  (exists) ${nd.folder}${nd.name}.md`); continue; }
    const typeMap: Record<string, string> = { "02-projects/": "project", "03-people/": "person", "04-companies/": "company" };
    const type = typeMap[nd.folder] ?? "project";
    const srcRefs = nd.sessions.slice(0, 3).map(s => `[[${s.replace(/\.md$/, "")}]]`).join(", ");
    fs.writeFileSync(stubPath, [
      "---",`type: ${type}`,"subtype: repo","status: moderate","confidence: high",
      "created: 2026-06-23","updated: 2026-06-23",`source: "claude-code sessions"`,"aliases: []","tags: []","---","",
      `${nd.name} — Source B evidence from ${nd.sessionCount} session${nd.sessionCount > 1 ? "s" : ""}. [from: ${srcRefs}]`,""
    ].join("\n"));
    console.log(`  ✓ created ${nd.folder}${nd.name}.md`);
    stubsCreated++;
  }

  // 2. Insert wikilinks + update Source B project: frontmatter
  for (const fp of sessionFiles) {
    const matches = sessionMatchMap.get(fp) ?? [];
    const content = fs.readFileSync(fp, "utf8");
    const fm      = parseFrontmatter(content);
    const source  = fm.source ?? "";
    const project = fm.project?.replace(/^\[\[|\]\]$/g, "").trim() ?? "";

    const fmEndIdx  = content.indexOf("\n---\n") + 5;
    let fmSection   = content.slice(0, fmEndIdx);
    const bodyFull  = content.slice(fmEndIdx);
    let updatedBody = bodyFull;

    for (const { start, end, canonical, matchText } of [...matches].sort((a, b) => b.start - a.start)) {
      const lb = updatedBody.lastIndexOf("[[", start);
      if (lb !== -1 && updatedBody.indexOf("]]", lb) > start) continue;
      const wl = matchText.toLowerCase() === canonical.toLowerCase() ? `[[${canonical}]]` : `[[${canonical}|${matchText}]]`;
      updatedBody = updatedBody.slice(0, start) + wl + updatedBody.slice(end);
      linksInserted++;
    }

    // Update Source B project: frontmatter
    if (source === "claude-code" && project && !suppressed.has(project.toLowerCase())) {
      const oldPF = `project: "${project}"`, newPF = `project: "[[${project}]]"`;
      if (fmSection.includes(oldPF)) fmSection = fmSection.replace(oldPF, newPF);
    }

    const newContent = fmSection + updatedBody;
    if (newContent !== content) { fs.writeFileSync(fp, newContent, "utf8"); filesModified++; }
  }

  // 3. Append import-log
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  fs.appendFileSync(IMPORT_LOG,
    `\n## ${now} extract-entities --apply\n` +
    `- Sessions scanned: ${sessionFiles.length}\n` +
    `- Sessions modified: ${filesModified}\n` +
    `- Wikilinks inserted: ${linksInserted}\n` +
    `- Stubs created: ${stubsCreated} (${nodeDecisions.filter(n=>n.create).map(n=>n.name).join(", ")})\n` +
    `- Entity tiers: full=${eT.full} moderate=${eT.moderate} stub=${eT.stub}\n`
  );

  console.log(`\n── APPLY SUMMARY ────────────────────────────────────────────────────────\n`);
  console.log(`  Session files modified: ${filesModified}`);
  console.log(`  Wikilinks inserted:     ${linksInserted}`);
  console.log(`  Stubs created:          ${stubsCreated}`);
  console.log(`  Import-log updated:     yes\n`);
}

run();
