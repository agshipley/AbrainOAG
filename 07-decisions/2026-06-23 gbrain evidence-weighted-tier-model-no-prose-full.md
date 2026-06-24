---
type: decision
status: full
confidence: high
created: 2026-06-23
updated: 2026-06-23
source: "[[2026-06-23 abrainoag can-you-review-the-gmrain-project-md-file]]"
tags: []
---

# gbrain extraction: FULL tier requires attributed artifact evidence; prose-only entities cap at MODERATE

**Decision:** The extraction pass sets `ALLOW_PROSE_FULL = false`: an entity reaches FULL tier only if it has attributed artifact evidence (code blocks, file paths, URLs, or deploy/architecture keywords) in at least `FULL_REACH` sessions where that artifact is within `ATTRIB_SPAN` (120 chars) of the entity alias, or the artifact text itself contains the entity name. Entities mentioned only in prose — regardless of reach or depth — cap at MODERATE. Artifact attribution is windowed (±600 chars per match), not session-level.

**Rationale:** The prior mention-count model assigned every entity in the corpus to FULL because planning sessions (which mention all entities together) inflated raw counts and session-level artifact scores. John Jost appearing in the same planning document as code-heavy Orpheus content was inheriting Orpheus's artifact signal. Attribution to a specific entity requires the artifact to be within clause range of the entity alias — the proximity check eliminates incidental co-occurrence. This makes the FULL tier mean "this entity has its own build/deploy evidence," not "this entity appears in sessions that also contain build evidence."

**Alternative considered:** Use session-length depth (prior approach), or use evidence-gated reach with window artifacts but allow prose entities to reach FULL when reach is high enough (`ALLOW_PROSE_FULL = true`).

**Trade-off:** People and companies that appear frequently in substantive prose (Spencer Williams, John Jost, Trace Machina, Audience Haus) cap at MODERATE even with high reach, because their mentions do not generate attributed artifacts. This is the correct outcome — they are mentioned, not built — but requires tuning `ATTRIB_SPAN` and `FULL_REACH` to avoid over-demoting entities like Liz Varner who appear in sessions with genuine artifact evidence about her project.
