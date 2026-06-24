---
type: decision
status: full
confidence: high
created: 2026-04-15
updated: 2026-04-15
source: "[[2026-04-15 architecture-review-after-workflow-sync]]"
tags: []
---

# charlie filter bubble firewall: Liz's interests influence scoring only, never ingestion aperture

**Decision:** The filter bubble firewall was explicitly established: Liz Varner's personal interests, project slate, and watchlist items influence charlie's *relevance scoring* — how the system weights and prioritizes signals it has already found — but never its *ingestion aperture* — what the ingestion agent goes looking for in the first place. Her engagement data (signal ratings, session responses, brain dumps) flows into calibration blocks injected into analysis and thesis prompts, not into ingestion search queries.

**Rationale:** The ingestion agent must discover signals on an open aperture so that charlie surfaces surprising or emerging information rather than recirculating what Liz already finds familiar. Direct entity injection would cause the system to search for what it already knows she follows, collapsing the discovery function into a filter on existing knowledge. The companion tool and feedback loop influence the *model* of what matters, not the *search* for what exists.

**Alternative considered:** Direct entity injection — feeding Liz's project slate, watchlist companies, and specific names into ingestion search queries as primary search terms.

**Trade-off:** Calibration via scoring signals is slower to take effect than direct injection; the system accumulates a relevance model over time rather than immediately surfacing things it knows she cares about. The minimum threshold of 2 ratings per signal type before injection means new feedback takes several days to influence the pipeline.
