# Aliases

Matching rule: **case-insensitive, word-boundary only** (`\b`). Spaces in a phrase match `\s+`. Strip fenced code blocks and inline code spans from session body before matching — meta-doc examples and code variables must not produce phantom links.

Two sections: **Confident** (extract-entities auto-links unconditionally) and **Ambiguous** (evidence-gated: link only when the match window contains an artifact or a co-occurring known entity).

`AbrainOAG` is the export/repo folder name, an alias for the gbrain project work. No entity node is created for it; it is absorbed into the planned `gbrain` stub.

---

## Confident

| Canonical | Vault path | Aliases |
|-----------|------------|---------|
| charlie | 02-projects/charlie.md | charlie, Charlie |
| Orpheus | 02-projects/Orpheus.md | Orpheus, job-search-engine |
| first-agent | 02-projects/first-agent.md | first-agent, first agent |
| mrkt | 02-projects/mrkt.md | mrkt, Mrkt, MRKT |
| NLSAFE | 02-projects/NLSAFE.md | NLSAFE, NLSafe, nlsafe |
| Liz Varner | 03-people/Liz Varner.md | Liz Varner, Elizabeth Varner |
| Tre Borden | 03-people/Tre Borden.md | Tre Borden |
| Spencer Williams | 03-people/Spencer Williams.md | Spencer Williams |
| John Jost | 03-people/John Jost.md | John Jost |
| Trace Machina | 04-companies/Trace Machina.md | Trace Machina |
| EeroQ | 04-companies/EeroQ.md | EeroQ |
| AGS Law PLLC | 04-companies/AGS Law PLLC.md | AGS Law PLLC, AGS Law |
| Audience Haus | 04-companies/Audience Haus.md | Audience Haus |
| Corpus governance | 05-concepts/Corpus governance.md | corpus governance |
| Brain-first retrieval | 05-concepts/Brain-first retrieval.md | brain-first retrieval |
| Predictive contracting | 05-concepts/Predictive contracting.md | predictive contracting, Predictive Contracting |
| Tiered enrichment | 05-concepts/Tiered enrichment.md | tiered enrichment |
| Orpheus relevance failure | 07-decisions/2026-04-11 Orpheus relevance failure and corrective actions.md | Orpheus relevance failure, Orpheus diagnostic |

---

## Ambiguous

Bare token matching removed. Dropped: liz, ags, spencer, max (all noise or covered by full-form confident aliases). Rely on full-form confident aliases only: "Liz Varner", "AGS Law"/"AGS Law PLLC", "Spencer Williams". Wheelhouse: node created from Source B frontmatter (authoritative), no alias entry needed here.

| Alias | Candidate entity | Reason |
|-------|-----------------|--------|
| (none active) | — | All bare tokens removed this pass |

---

## Suppression

Never create a node for these slugs. Applied to Source B `project:` frontmatter before any node decision.

| Slug | Reason |
|------|--------|
| andrewshipley | Home directory / username slug, not a project |
| AbrainOAG | Export folder name; absorbed into planned gbrain stub |

---

## Notes

**Orpheus / job-search-engine**: `job-search-engine` is an alias of Orpheus (the Source B project path ends in `job-search-engine`). No separate node. Sessions under that cwd link to `[[Orpheus]]`.

**Wheelhouse**: if ≥2 of the ambiguous match sessions are corroborated (artifact in window), create `02-projects/Wheelhouse.md`.

**AbrainOAG**: alias of future `02-projects/gbrain.md`. When that stub is created, add `AbrainOAG` to its `aliases:` frontmatter.

**civilwarland, Dr Max's, trip-composer, lodging-agent, gbrain**: planned stubs — not in vault yet. Extract-entities will route them via evidence-gated node creation.
