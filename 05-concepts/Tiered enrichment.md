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

The gbrain vault's evidence-weighted model for assigning entity profile depth: stub, moderate, or full based on attributed artifact evidence and evidence-gated reach.

## Current model (post-Phase 1 extraction pass)

Tier is set by evidence weight, not mention count [from: [[2026-06-23 abrainoag can-you-review-the-gmrain-project-md-file]]]:

- **Full** — entity has attributed artifact evidence (code, deploy tokens, URLs within 120 chars of entity alias, or artifact text containing the alias) in at least 3 evidence-gated sessions. `ALLOW_PROSE_FULL = false`: prose-only entities cap at moderate regardless of reach.
- **Moderate** — evidenced in 2+ sessions, or high windowed depth from one substantive session.
- **Stub** — single incidental mention with nothing behind it. Rare in practice.

Evidence gating: a session counts toward reach only if the entity's match window contains an artifact, or the containing line has more than 60 chars beyond the entity name [from: [[2026-06-23 abrainoag can-you-review-the-gmrain-project-md-file]]].

## Original model (Phase 1 seed, superseded)

The initial GBRAIN_PROJECT.md spec defined tiers by inbound link count: stub = 1 mention, moderate = 3+ mentions, full = 8+ mentions or a direct working session [from: [[GBRAIN_PROJECT]]]. This model was replaced during the extraction pass when it produced 17/17 full tiers due to co-occurring entities in planning sessions inheriting each other's artifact signals.

Rules live in `09-meta/enrichment-rules.md`.

## Gaps

Evidence is corroborated across 3 sessions and directly shaped by the extraction pass in this vault. The model is well-documented for entities as it currently stands. The following are undocumented:

- How tiered enrichment applies to session files themselves — sessions have `status: stub` set at import but no evidence-weighted escalation pass has run on them
- The dream-cycle enrichment pass (Phase 4 in the gbrain plan): how automated tier escalation would work in practice, and what triggers a re-run
- Whether ALLOW_PROSE_FULL should ever be flipped to true — the rationale for keeping it false is documented, but the conditions under which the vault would benefit from prose-only full tiers are not discussed
- Performance characteristics: how enrichment-rules.md thresholds interact at scale if the vault grows significantly beyond its current 23 entities
