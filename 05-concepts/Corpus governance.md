---
type: concept
subtype: ""
status: moderate
confidence: high
created: 2026-06-22
updated: 2026-06-24
source: "[[GBRAIN_PROJECT]] §7"
aliases: []
tags: []
---

A classification system for data sources in the gbrain vault: every source is either live, deferred-technical, or deferred-scope. No source drops silently.

## Definition

[[Corpus governance]] maintains an auditable record of which sources are active in the vault and why others are not. Three tiers [from: [[GBRAIN_PROJECT]]]:

- **Live** — active and queryable
- **Deferred-technical** — correct to include but blocked by infrastructure constraints
- **Deferred-scope** — out of current scope, not a technical limitation

Every skipped or deferred source is logged in `09-meta/import-log.md` with a reason and an unblock path [from: [[GBRAIN_PROJECT]]].

## In practice

Applied during Phase 1 import: `memories.json` and the project `docs/` arrays from the Claude.ai export were classified as deferred sources and logged to `00-inbox/deferred-sources.md` [from: [[2026-06-23 abrainoag can-you-review-the-gmrain-project-md-file]]].

## Gaps

Evidence base is GBRAIN_PROJECT.md (definition) and one session (the Phase 1 import). Both supply the concept at the design-spec level. The following are undocumented:

- What the full current deferred-sources list contains beyond `memories.json` and project `docs/` arrays
- How the three-tier classification is assigned in practice: the rules for moving something from deferred-scope to live, or from deferred-technical to live when the blocking constraint is resolved
- Whether import-log.md entries have been maintained beyond the Phase 1 extraction pass
- How corpus governance interacts with Source C (the Orpheus project memory and diagnostic documents, which were planned but not formally imported)
