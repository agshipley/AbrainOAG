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

A retrieval discipline for knowledge systems: query the local vault before any external call or web search.

## Definition

[[Brain-first retrieval]] operates as follows [from: [[2026-06-23 building-a-gbrain-system-with-claude-code]]]:

- **Hit** — answer from the vault
- **Miss** — fetch externally, then write the result back so the next query hits

The vault compounds in value with every session: each external fetch that gets written back reduces future external calls.

## Origin

The principle is taken from Garry Tan's gbrain project and adapted for this vault. Gbrain frames it as the difference between "search gives you raw pages" and "GBrain gives you the answer" [from: [[2026-06-22 gbrain-project-technical-specifications]]].

## Gaps

Evidence base is two sessions (June 22–23 2026 gbrain planning). Both sessions describe the principle at the level of design intent, sourced from gbrain's documentation and README. The following are undocumented:

- Whether brain-first retrieval has been applied in practice within this vault — no session shows an agent querying the vault before an external call
- How "write back on miss" would be implemented: which agent writes, to which file, in what format
- What counts as a vault "hit" (exact match, semantic match, keyword match)
- Interaction with the Phase 3 retrieval engine: brain-first retrieval in Phase 1 relies on Obsidian full-text search, which has different precision characteristics than the hybrid search gbrain's Phase 3 would provide
