# Enrichment Rules

## Threshold constants (tune here)

```
# Tier gate
ALLOW_PROSE_FULL        = false  # when false: FULL requires ≥FULL_REACH artifact-bearing sessions
                                  # (sessions where windowArts≥1). Flip to true to let
                                  # prose-only entities reach full tier.

WINDOW_CHARS            = 600    # chars on each side of a match (depth + artifact windows)

ATTRIB_SPAN             = 120    # max chars between entity alias and artifact token for the
                                  # artifact to be attributed to that entity (same-sentence /
                                  # same-clause range). Second criterion: artifact TEXT contains
                                  # the entity alias (e.g. a file path containing the project name,
                                  # a URL with the repo slug) — attributed unconditionally.

# Evidence-gating (reach)
REACH_EVIDENCE_FLOOR    = 60     # min chars in the containing LINE beyond the entity name span,
                                  # for a session to count toward reach when artifacts = 0.
                                  # Filters bare seed-list bullets ("John Jost — NYU; co-author...")
                                  # while passing full-sentence prose mentions.
                                  # Primary gate is windowArts >= 1; this is the prose fallback.

# Evidence-gating (new names / node creation)
NEW_NAME_ARTIFACT_FLOOR = 2      # min artifacts in window for a single-session new name to
                                  # qualify for a stub. Rescues deployed single-session apps.
                                  # Two-session names always qualify (standard gate).

# Ambiguous alias corroboration
AMBIG_CORROBORATE_ARTS  = 1      # min artifacts in window for an ambiguous alias to get a link

FULL_REACH              = 3      # evidence-gated sessions
FULL_DEPTH_CHARS        = 2000   # windowed depth chars
FULL_ARTIFACTS          = 3      # windowed artifact tokens

MODERATE_REACH          = 2
MODERATE_DEPTH_CHARS    = 400
MODERATE_ARTIFACTS      = 1

SESSION_FULL_MESSAGES   = 30
SESSION_MODERATE_MESSAGES = 10
SESSION_FULL_ARTIFACT_DENSITY  = 0.10
SESSION_MODERATE_ARTIFACT_DENSITY = 0.05
```

**Threshold changes from initial values:**
- `FULL_DEPTH_CHARS`: 5000 → 2000. With ±600-char windows, a 3-mention entity accumulates ≈1 800–3 600 chars. 2 000 is the right crossover for "substantive across multiple sessions."
- `FULL_ARTIFACTS`: 5 → 3. Windowed artifacts are a tighter count than full-session artifacts; 3 within windows is a strong signal.
- `MODERATE_DEPTH_CHARS`: 800 → 400. One substantive paragraph is ≈300–500 chars; 400 captures that without requiring two sessions.
- `MODERATE_ARTIFACTS`: 2 → 1. Even a single deploy keyword or code block within the match window is meaningful evidence.

These constants live in `scripts/extract-entities.ts` as `THRESHOLDS`. Change them there; the script reads them at runtime. The values above are the defaults at time of writing.

---

## Signals

### 1. Reach (evidence-gated)
Number of distinct session files in which the entity name matches AND the match is evidenced. A session counts toward reach only if the entity's match window in that session satisfies at least one of:
- **Artifact gate**: `windowArts >= 1` (an artifact token falls within the merged match windows)
- **Prose gate**: the line/paragraph containing the match has > `REACH_EVIDENCE_FLOOR` chars beyond the entity name span (filters bare seed-list bullets while passing full-sentence prose)

Bare list-mentions ("John Jost — NYU; co-author, 2020 PLOS ONE paper." as a single bullet) typically fail both gates and do not count toward reach. Depth and artifact totals are also accumulated only from evidence-gated sessions.

### 2. Depth (windowed)
For each match of an entity alias in the session body (post-strip), extract a window of ±`WINDOW_CHARS` characters around the match, preferring paragraph breaks as natural boundaries (`\n\n`). Merge overlapping windows. Depth for a session = sum of merged window lengths. Depth across sessions = sum across all sessions where the entity appears.

This replaces the prior definition (full session length), which caused every co-occurring entity to inherit the length of large sessions.

### 3. Artifacts (windowed)
Count artifact tokens that fall **within the match windows** for the entity (not across the full session). Each pattern match inside a window = 1. Because code stripping uses length-preserving replacement (spaces), positions in stripped body align with positions in raw body — windows are extracted from raw body for artifact counting.

**Artifact token set (regex):**

```
Fenced code blocks    /```[\s\S]*?```/g                       each block = 1
File paths            /(?:^|[\s('"[{])((?:[~.]?\/|~)\S+)/gm   each match = 1
HTTP(S) URLs          /https?:\/\/[^\s)>"]+/gi                 each match = 1
Deploy keywords       /\b(?:deploy(?:ed)?|shipped|live|production|
                       MCP|schema|pipeline|agent\s+loop|endpoint)\b/gi
                                                               each match = 1
```

Tuning: add patterns in `scripts/extract-entities.ts` `ARTIFACT_PATTERNS` array.

---

## Entity tier assignment

```
dedicated = entity name appears in any session's frontmatter `title` field

if dedicated:
    tier = "full"
elif artifacts >= FULL_ARTIFACTS:
    tier = "full"
elif reach >= FULL_REACH AND depth >= FULL_DEPTH_CHARS:
    tier = "full"
elif reach >= MODERATE_REACH OR depth >= MODERATE_DEPTH_CHARS OR artifacts >= MODERATE_ARTIFACTS:
    tier = "moderate"
else:
    tier = "stub"
```

Status is assigned by evidence, not by default. No entity starts as stub and escalates — the extraction pass sets tier from evidence held on the first scan.

Projects almost never stub: their architecture, deploy history, and build sessions produce artifact and depth signals that score them to moderate or full immediately.

---

## Session tier assignment

```
artifact_density = artifact_count / max(message_count, 1)

if message_count >= SESSION_FULL_MESSAGES AND artifact_density >= SESSION_FULL_ARTIFACT_DENSITY:
    tier = "full"
elif message_count >= SESSION_MODERATE_MESSAGES OR artifact_density >= SESSION_MODERATE_ARTIFACT_DENSITY:
    tier = "moderate"
else:
    tier = "stub"
```

Session tier is independent of entity tier. A stub session may still mention a full entity, and vice versa.

---

## Confidence

| Value | Meaning |
|-------|---------|
| `high` | Claim corroborated across 2+ distinct sessions |
| `med` | Single-source claim (one session) |
| `low` | Inferred, ambiguous, or from a stub-tier session |

---

## Dedup rules

- Before creating a stub, check `aliases` frontmatter in existing entity files. If a matching alias exists, treat it as the same entity (add inbound session, do not create a new file).
- Log every dedup decision in `09-meta/import-log.md`: original match, resolved entity, reason.
- If two candidate entities both match and overlap in aliases, flag for manual review — do not merge automatically.
