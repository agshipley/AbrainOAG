---
type: decision
status: full
confidence: high
created: 2026-05-11
updated: 2026-05-11
source: "[[2026-05-11 redirecting-project-strategy-after-permitting-dead-end]]"
tags: []
---

# first-agent: pivot from permit-data lead prospecting to relationship intelligence graph

**Decision:** The first-agent project abandoned permit data as its primary signal source and pivoted to building a relationship intelligence graph: a living model of people, firms, projects, and organizations in LA's creative and AEC ecosystem, tracking how they connect and evolve over time.

**Rationale:** Permit data arrives too late in the project lifecycle — creative agencies are typically contracted before permitting, often through architects hired in pre-permit phases. Press coverage (Urbanize LA, The Real Deal LA, Bisnow LA) also arrives after key hiring decisions are made. The core insight: "creative agencies win through relationships and timing, not cold outreach." The right product models relationship states and organizational evolution so an agency can identify warm paths to new clients — not surface cold leads from public records that competitors also read. Existing Supabase infrastructure made the graph approach technically viable.

**Alternative considered:** Continue with permit-based lead prospecting, substituting earlier signals (news coverage, permit pre-application filings, AIA LA directories) for the permit data that arrived too late.

**Trade-off:** Relationship graph requires active curation by a domain expert (Dora, Tre's colleague, identified as potential curation lead); it cannot be built purely from public data streams. Entity resolution — merging mentions of the same person or firm from different sources — was identified as the hardest unsolved technical problem in the new architecture.
